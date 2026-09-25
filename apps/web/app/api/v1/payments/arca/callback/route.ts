import { NextRequest, NextResponse } from 'next/server';
import { db } from '@white-shop/db';
import { Prisma } from '@prisma/client';
import { getArcaOrderStatus } from '@/lib/payments/arca/client';
import {
  readConfirmAttempt,
  readSettledArcaStatus,
  resolveArcaCallbackAction,
  respondToUnsettledArcaCallback,
} from '@/lib/payments/arca/callback-status';
import { isPaymentReturnProbe, paymentReturnProbeResponse } from '@/lib/payments/payment-return-probe';
import { appendOrderAccessCookie } from '@/lib/orders/order-access-cookie.server';
import { resolveOrderNumberFromAccessCookie } from '@/lib/orders/resolve-order-number-from-access-cookie';
import { restoreOrderStock, shouldRestoreOrderStock } from '@/lib/services/order-stock';
import { logger } from '@/lib/utils/logger';

const PAYMENT_PROVIDER = 'arca';

function originFromRequest(req: NextRequest): string {
  return req.nextUrl.origin.replace(/\/$/, '');
}

function buildSuccessRedirect(req: NextRequest, orderNumber: string): string {
  const query = new URLSearchParams({
    orderNumber,
    clearCart: '1',
    payment: 'paid',
  });
  return `${originFromRequest(req)}/checkout/thank-you?${query.toString()}`;
}

function buildSuccessResponse(
  req: NextRequest,
  order: { id: string; number: string },
): NextResponse {
  const response = NextResponse.redirect(buildSuccessRedirect(req, order.number));
  appendOrderAccessCookie(response, req, order.id);
  return response;
}

async function redirectToPaymentFailed(
  req: NextRequest,
  orderNumber?: string | null,
): Promise<NextResponse> {
  const trimmed = orderNumber?.trim() ?? '';
  const resolved = trimmed || (await resolveOrderNumberFromAccessCookie(req));
  return NextResponse.redirect(buildFailureRedirect(req, resolved));
}

function buildFailureRedirect(req: NextRequest, orderNumber?: string): string {
  const query = new URLSearchParams({
    payment: 'failed',
  });
  if (orderNumber?.trim()) {
    query.set('orderNumber', orderNumber.trim());
  }
  return `${originFromRequest(req)}/checkout/payment-failed?${query.toString()}`;
}

function resolveProviderOrderId(query: URLSearchParams): string {
  const candidates = [
    query.get('orderId'),
    query.get('mdOrder'),
    query.get('mdorder'),
    query.get('paymentID'),
    query.get('paymentId'),
    query.get('paymentid'),
  ];
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value) {
      return value;
    }
  }
  return '';
}

async function findOrderForCallback(orderNumber: string | null, providerOrderId: string) {
  const requestedOrder = orderNumber?.trim() ?? '';

  if (requestedOrder) {
    const order = await db.order.findUnique({
      where: { number: requestedOrder },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (order) {
      if (
        providerOrderId &&
        !order.payments.some(
          (item: { provider: string; providerTransactionId: string | null }) =>
            item.provider === PAYMENT_PROVIDER && (item.providerTransactionId ?? '') === providerOrderId,
        )
      ) {
        logger.warn('Arca callback provider id mismatch for order', {
          requestedOrder,
          providerOrderId,
        });
      }
      return order;
    }
  }

  if (!providerOrderId) {
    return null;
  }

  const payment = await db.payment.findFirst({
    where: {
      provider: PAYMENT_PROVIDER,
      providerTransactionId: providerOrderId,
    },
    include: {
      order: {
        include: {
          payments: {
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return payment?.order ?? null;
}

export function HEAD(): NextResponse {
  return paymentReturnProbeResponse();
}

export async function GET(req: NextRequest) {
  if (isPaymentReturnProbe(req)) {
    return paymentReturnProbeResponse();
  }

  const query = req.nextUrl.searchParams;
  const orderNumber = query.get('order') ?? query.get('opaque') ?? query.get('Opaque');
  const providerOrderId = resolveProviderOrderId(query);

  if (!providerOrderId && !(orderNumber?.trim() ?? '')) {
    return redirectToPaymentFailed(req, orderNumber);
  }

  try {
    const order = await findOrderForCallback(orderNumber, providerOrderId);
    if (!order) {
      logger.warn('Arca callback order not found', {
        providerOrderId,
        orderNumber,
      });
      return redirectToPaymentFailed(req, orderNumber);
    }

    const payment = order.payments.find((item: { provider: string }) => item.provider === PAYMENT_PROVIDER);
    if (!payment) {
      logger.warn('Arca callback payment record missing', {
        orderId: order.id,
        orderNumber: order.number,
      });
      return redirectToPaymentFailed(req, order.number);
    }

    if (order.paymentStatus === 'paid' || payment.status === 'completed') {
      return buildSuccessResponse(req, order);
    }

    const statusOrderId = providerOrderId || payment.providerTransactionId?.trim() || '';
    if (!statusOrderId) {
      logger.warn('Arca callback missing provider order id after order lookup', {
        orderNumber: order.number,
      });
      return redirectToPaymentFailed(req, order.number);
    }

    const isIframe = req.headers.get('sec-fetch-dest') === 'iframe';
    const confirmAttempt = readConfirmAttempt(query.get('confirmAttempt'));
    const statusResponse = isIframe
      ? await getArcaOrderStatus(statusOrderId)
      : await readSettledArcaStatus(statusOrderId);
    logger.info('Arca callback status response', {
      orderNumber: order.number,
      statusOrderId,
      errorCode: statusResponse.errorCode,
      orderStatus: statusResponse.orderStatus,
      paymentState: statusResponse.paymentAmountInfo?.paymentState,
      errorMessage: statusResponse.errorMessage,
      confirmAttempt,
    });
    const action = resolveArcaCallbackAction({
      status: statusResponse,
      confirmAttempt,
      isIframe,
    });
    const unsettledResponse = respondToUnsettledArcaCallback({
      req,
      action,
      confirmAttempt,
      orderNumber: order.number,
      origin: originFromRequest(req),
    });
    if (unsettledResponse) {
      return unsettledResponse;
    }

    const now = new Date();

    if (action === 'paid') {
      await db.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'paid',
            paidAt: now,
          },
        });
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            completedAt: now,
            providerTransactionId: statusOrderId,
            providerResponse: statusResponse,
            errorCode: null,
            errorMessage: null,
            failedAt: null,
          },
        });
        await tx.orderEvent.create({
          data: {
            orderId: order.id,
            type: 'payment_callback',
            data: {
              provider: PAYMENT_PROVIDER,
              status: 'paid',
              providerOrderId: statusOrderId,
            },
          },
        });
      });

      return buildSuccessResponse(req, order);
    }

    const shouldRestoreStock = shouldRestoreOrderStock({
      existingStatus: order.status,
      existingPaymentStatus: order.paymentStatus,
      nextPaymentStatus: 'failed',
    });

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'failed',
        },
      });
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'failed',
          failedAt: now,
          providerTransactionId: statusOrderId,
          providerResponse: statusResponse,
          errorCode: String(statusResponse.errorCode ?? ''),
          errorMessage: statusResponse.errorMessage ?? 'Arca returned non-success payment state',
        },
      });
      if (shouldRestoreStock) {
        await restoreOrderStock(tx, order.id);
      }
      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          type: 'payment_callback',
          data: {
            provider: PAYMENT_PROVIDER,
            status: 'failed',
            providerOrderId: statusOrderId,
            stockRestored: shouldRestoreStock,
          },
        },
      });
    });

    return redirectToPaymentFailed(req, order.number);
  } catch (error: unknown) {
    logger.error('Arca callback error', {
      error,
      providerOrderId,
      orderNumber,
    });
    return redirectToPaymentFailed(req, orderNumber);
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
