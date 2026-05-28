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
  return `${appUrl}/checkout?${query.toString()}`;
}

async function findOrderForCallback(orderNumber: string | null, providerOrderId: string) {
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

  const order = payment?.order ?? null;
  if (!order) {
    return null;
  }

  const requestedOrder = orderNumber?.trim();
  if (requestedOrder && requestedOrder !== order.number) {
    logger.warn('Arca callback order mismatch', {
      requestedOrder,
      actualOrder: order.number,
      providerOrderId,
    });
    return null;
  }

  return order;
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams;
  const orderNumber = query.get('order');
  const providerOrderId = query.get('orderId')?.trim() ?? '';

  if (!providerOrderId) {
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

    const statusResponse = await getArcaOrderStatus(providerOrderId);
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
            providerTransactionId: providerOrderId,
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
              providerOrderId,
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
          providerTransactionId: providerOrderId,
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
            providerOrderId,
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
