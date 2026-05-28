import { NextRequest, NextResponse } from 'next/server';
import { db } from '@white-shop/db';
import type { Payment } from '@prisma/client';
import { authenticateToken } from '@/lib/middleware/auth';
import { registerArcaOrder } from '@/lib/payments/arca/client';
import { getArcaConfig } from '@/lib/payments/arca/config';
import type { ArcaCurrencyCode } from '@/lib/payments/arca/types';
import { verifyPaymentInitToken } from '@/lib/payments/payment-init-token';
import { toApiError } from '@/lib/types/errors';
import { logger } from '@/lib/utils/logger';

type InitArcaRequestBody = {
  orderNumber?: string;
  initToken?: string;
};

const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_FORBIDDEN = 403;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_FAILED_DEPENDENCY = 424;
const HTTP_STATUS_BAD_GATEWAY = 502;
const HTTP_STATUS_TOO_MANY_REQUESTS = 429;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const initRateLimitStore = new Map<string, number[]>();

function getClientKey(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwardedFor) {
    return forwardedFor;
  }
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

function enforceRateLimit(req: NextRequest): void {
  const key = getClientKey(req);
  const now = Date.now();
  const bucket = initRateLimitStore.get(key) ?? [];
  const validTimestamps = bucket.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (validTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    throw {
      status: HTTP_STATUS_TOO_MANY_REQUESTS,
      type: 'https://api.shop.am/problems/rate-limit',
      title: 'Too Many Requests',
      detail: 'Too many payment initialization attempts. Please try again in a minute.',
    };
  }
  validTimestamps.push(now);
  initRateLimitStore.set(key, validTimestamps);
}

function validateOrderNumber(value: string | undefined): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    throw {
      status: HTTP_STATUS_BAD_REQUEST,
      type: 'https://api.shop.am/problems/validation-error',
      title: 'Validation Error',
      detail: 'orderNumber is required',
    };
  }
  return trimmed;
}

export async function POST(req: NextRequest) {
  try {
    enforceRateLimit(req);
    const user = await authenticateToken(req);
    const payload = (await req.json()) as InitArcaRequestBody;
    const orderNumber = validateOrderNumber(payload.orderNumber);
    const initToken = payload.initToken?.trim() ?? '';
    if (!initToken) {
      throw {
        status: HTTP_STATUS_FORBIDDEN,
        type: 'https://api.shop.am/problems/forbidden',
        title: 'Forbidden',
        detail: 'Missing payment initialization token',
      };
    }

    const order = await db.order.findUnique({
      where: { number: orderNumber },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw {
        status: HTTP_STATUS_NOT_FOUND,
        type: 'https://api.shop.am/problems/not-found',
        title: 'Order not found',
        detail: `Order '${orderNumber}' was not found`,
      };
    }

    if (order.userId && order.userId !== user?.id) {
      throw {
        status: HTTP_STATUS_FORBIDDEN,
        type: 'https://api.shop.am/problems/forbidden',
        title: 'Forbidden',
        detail: 'You cannot initialize payment for this order',
      };
    }

    if (!order.userId && user?.id) {
      throw {
        status: HTTP_STATUS_FORBIDDEN,
        type: 'https://api.shop.am/problems/forbidden',
        title: 'Forbidden',
        detail: 'Authenticated user cannot initialize guest order payment',
      };
    }

    const tokenClaims = verifyPaymentInitToken(initToken);
    if (
      !tokenClaims ||
      tokenClaims.orderId !== order.id ||
      tokenClaims.orderNumber !== order.number ||
      tokenClaims.paymentMethod !== 'arca' ||
      tokenClaims.userId !== (user?.id ?? null)
    ) {
      throw {
        status: HTTP_STATUS_FORBIDDEN,
        type: 'https://api.shop.am/problems/forbidden',
        title: 'Forbidden',
        detail: 'Invalid payment initialization token',
      };
    }

    if (order.paymentStatus === 'paid') {
      throw {
        status: HTTP_STATUS_FAILED_DEPENDENCY,
        type: 'https://api.shop.am/problems/validation-error',
        title: 'Validation Error',
        detail: 'Order is already paid',
      };
    }

    const payment = order.payments.find((item: Payment) => item.provider === 'arca');
    if (!payment) {
      throw {
        status: HTTP_STATUS_FAILED_DEPENDENCY,
        type: 'https://api.shop.am/problems/validation-error',
        title: 'Validation Error',
        detail: 'Arca payment record was not found for this order',
      };
    }

    if (payment.status === 'completed') {
      throw {
        status: HTTP_STATUS_FAILED_DEPENDENCY,
        type: 'https://api.shop.am/problems/validation-error',
        title: 'Validation Error',
        detail: 'Arca payment is already completed',
      };
    }

    const config = getArcaConfig();
    // Merchant test account can be AMD-only even when internal order currency is USD.
    // Arca register.do accepts AMD numeric code `051`, which is the safest baseline.
    const currency: ArcaCurrencyCode = '051';
    const amountMinor = Math.round(Number(order.total) * 100);

    if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
      throw {
        status: HTTP_STATUS_BAD_REQUEST,
        type: 'https://api.shop.am/problems/validation-error',
        title: 'Validation Error',
        detail: 'Order total must be greater than zero',
      };
    }

    const callbackUrl = `${config.appUrl}/api/v1/payments/arca/callback?order=${encodeURIComponent(
      order.number,
    )}`;

    const registerResult = await registerArcaOrder({
      orderNumber: order.number,
      amount: amountMinor,
      currency,
      returnUrl: callbackUrl,
      description: `Order ${order.number}`,
      language: 'en',
    });

    const errorCode = Number.parseInt(String(registerResult.errorCode), 10);
    if (errorCode !== 0 || !registerResult.formUrl || !registerResult.orderId) {
      logger.error('Arca register.do failed', {
        orderNumber: order.number,
        errorCode: registerResult.errorCode,
        errorMessage: registerResult.errorMessage,
      });
      throw {
        status: HTTP_STATUS_BAD_GATEWAY,
        type: 'https://api.shop.am/problems/upstream-error',
        title: 'Arca Initialization Failed',
        detail: registerResult.errorMessage || 'Arca register.do returned an error',
      };
    }

    await db.payment.update({
      where: { id: payment.id },
      data: {
        providerTransactionId: registerResult.orderId,
        providerResponse: registerResult,
      },
    });

    await db.orderEvent.create({
      data: {
        orderId: order.id,
        type: 'payment_initialized',
        data: {
          provider: 'arca',
          orderId: registerResult.orderId,
          testMode: config.testMode,
        },
      },
    });

    return NextResponse.json({
      redirectUrl: registerResult.formUrl,
      providerOrderId: registerResult.orderId,
    });
  } catch (error: unknown) {
    logger.error('Arca init error', { error });
    const apiError = toApiError(error, req.url);
    return NextResponse.json(apiError, { status: apiError.status || 500 });
  }
}
