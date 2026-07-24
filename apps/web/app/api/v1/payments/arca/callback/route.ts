import { NextRequest, NextResponse } from 'next/server';
import { db } from '@white-shop/db';
import { Prisma } from '@prisma/client';
import { getArcaOrderStatus, isArcaStatusPaid } from '@/lib/payments/arca/client';
import { getArcaConfig } from '@/lib/payments/arca/config';
import { logger } from '@/lib/utils/logger';

const PAYMENT_PROVIDER = 'arca';

function buildSuccessRedirect(orderNumber: string): string {
  const { appUrl } = getArcaConfig();
  const query = new URLSearchParams({
    orderNumber,
    clearCart: '1',
    payment: 'paid',
  });
  return `${appUrl}/checkout/thank-you?${query.toString()}`;
}

function buildFailureRedirect(orderNumber?: string): string {
  const { appUrl } = getArcaConfig();
  const query = new URLSearchParams({
    payment: 'failed',
  });
  if (orderNumber) {
    query.set('orderNumber', orderNumber);
  }
  return `${appUrl}/checkout/payment-failed?${query.toString()}`;
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

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams;
  const orderNumber = query.get('order');
  const providerOrderId = resolveProviderOrderId(query);

  if (!providerOrderId && !(orderNumber?.trim() ?? '')) {
    return NextResponse.redirect(buildFailureRedirect(orderNumber ?? undefined));
  }

  try {
    const order = await findOrderForCallback(orderNumber, providerOrderId);
    if (!order) {
      logger.warn('Arca callback order not found', {
        providerOrderId,
        orderNumber,
      });
      return NextResponse.redirect(buildFailureRedirect(orderNumber ?? undefined));
    }

    const payment = order.payments.find((item: { provider: string }) => item.provider === PAYMENT_PROVIDER);
    if (!payment) {
      logger.warn('Arca callback payment record missing', {
        orderId: order.id,
        orderNumber: order.number,
      });
      return NextResponse.redirect(buildFailureRedirect(order.number));
    }

    if (order.paymentStatus === 'paid' || payment.status === 'completed') {
      return NextResponse.redirect(buildSuccessRedirect(order.number));
    }

    const statusOrderId = providerOrderId || payment.providerTransactionId?.trim() || '';
    if (!statusOrderId) {
      logger.warn('Arca callback missing provider order id after order lookup', {
        orderNumber: order.number,
      });
      return NextResponse.redirect(buildFailureRedirect(order.number));
    }

    const statusResponse = await getArcaOrderStatus(statusOrderId);
    logger.info('Arca callback status response', {
      orderNumber: order.number,
      statusOrderId,
      errorCode: statusResponse.errorCode,
      orderStatus: statusResponse.orderStatus,
      paymentState: statusResponse.paymentAmountInfo?.paymentState,
      errorMessage: statusResponse.errorMessage,
    });
    const isPaid = isArcaStatusPaid(statusResponse);
    const now = new Date();

    if (isPaid) {
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

      return NextResponse.redirect(buildSuccessRedirect(order.number));
    }

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
      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          type: 'payment_callback',
          data: {
            provider: PAYMENT_PROVIDER,
            status: 'failed',
            providerOrderId: statusOrderId,
          },
        },
      });
    });

    return NextResponse.redirect(buildFailureRedirect(order.number));
  } catch (error: unknown) {
    logger.error('Arca callback error', {
      error,
      providerOrderId,
      orderNumber,
    });
    return NextResponse.redirect(buildFailureRedirect(orderNumber ?? undefined));
  }
}
