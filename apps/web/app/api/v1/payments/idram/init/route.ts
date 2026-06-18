import { NextRequest, NextResponse } from 'next/server';
import { db } from '@white-shop/db';
import type { Payment } from '@prisma/client';
import { authenticateToken } from '@/lib/middleware/auth';
import { formatIdramAmount, resolveOrderAmountForIdramAmd } from '@/lib/payments/idram/amount';
import { getIdramConfig } from '@/lib/payments/idram/config';
import { IDRAM_FORM_ACTION_URL, IDRAM_PAYMENT_PROVIDER } from '@/lib/payments/idram/constants';
import type { IdramFormFields, IdramLanguageCode } from '@/lib/payments/idram/types';
import { verifyPaymentInitToken } from '@/lib/payments/payment-init-token';
import { toApiError } from '@/lib/types/errors';
import { logger } from '@/lib/utils/logger';

type InitIdramRequestBody = {
  orderNumber?: string;
  initToken?: string;
};

const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_FORBIDDEN = 403;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_FAILED_DEPENDENCY = 424;

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

function resolveIdramLanguage(customerLocale: string | null | undefined): IdramLanguageCode {
  const normalized = customerLocale?.trim().toLowerCase() ?? '';
  if (normalized.startsWith('hy')) {
    return 'AM';
  }
  if (normalized.startsWith('ru')) {
    return 'RU';
  }
  return 'EN';
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateToken(req);
    const payload = (await req.json()) as InitIdramRequestBody;
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
      tokenClaims.paymentMethod !== IDRAM_PAYMENT_PROVIDER ||
      tokenClaims.userId !== (user?.id ?? null)
    ) {
      throw {
        status: HTTP_STATUS_FORBIDDEN,
        type: 'https://api.shop.am/problems/forbidden',
        title: 'Forbidden',
        detail: 'Invalid payment initialization token',
      };
    }

    const payment = order.payments.find((item: Payment) => item.provider === IDRAM_PAYMENT_PROVIDER);
    if (!payment) {
      throw {
        status: HTTP_STATUS_FAILED_DEPENDENCY,
        type: 'https://api.shop.am/problems/validation-error',
        title: 'Validation Error',
        detail: 'Idram payment record was not found for this order',
      };
    }

    if (order.paymentStatus === 'paid' || payment.status === 'completed') {
      throw {
        status: HTTP_STATUS_FAILED_DEPENDENCY,
        type: 'https://api.shop.am/problems/validation-error',
        title: 'Validation Error',
        detail: 'Order is already paid',
      };
    }

    if (payment.status !== 'pending' || order.paymentStatus !== 'pending') {
      throw {
        status: HTTP_STATUS_FAILED_DEPENDENCY,
        type: 'https://api.shop.am/problems/validation-error',
        title: 'Validation Error',
        detail: 'Order is not pending payment',
      };
    }

    const config = getIdramConfig();
    const amountAmd = resolveOrderAmountForIdramAmd(Number(order.total), String(order.currency ?? 'USD'));
    const formFields: IdramFormFields = {
      EDP_LANGUAGE: resolveIdramLanguage(order.customerLocale),
      EDP_REC_ACCOUNT: config.recAccount,
      EDP_DESCRIPTION: `Order ${order.number}`,
      EDP_AMOUNT: formatIdramAmount(amountAmd),
      EDP_BILL_NO: order.number,
    };

    await db.payment.update({
      where: { id: payment.id },
      data: {
        providerResponse: {
          formAction: IDRAM_FORM_ACTION_URL,
          ...formFields,
        },
      },
    });

    await db.orderEvent.create({
      data: {
        orderId: order.id,
        type: 'payment_initialized',
        data: {
          provider: IDRAM_PAYMENT_PROVIDER,
          amountAmd,
          testMode: config.testMode,
        },
      },
    });

    return NextResponse.json({
      formAction: IDRAM_FORM_ACTION_URL,
      formData: formFields,
    });
  } catch (error: unknown) {
    logger.error('Idram init error', { error });
    const apiError = toApiError(error, req.url);
    return NextResponse.json(apiError, { status: apiError.status || 500 });
  }
}
