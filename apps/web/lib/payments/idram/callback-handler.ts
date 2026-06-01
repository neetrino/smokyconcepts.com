import { NextResponse } from 'next/server';
import { db } from '@white-shop/db';
import { Prisma } from '@prisma/client';
import { amountsMatchOrderTotal } from './amount';
import { computeIdramChecksum, isIdramChecksumValid } from './checksum';
import {
  IDRAM_CALLBACK_OK_RESPONSE,
  IDRAM_CHECKSUM_ERROR_RESPONSE,
  IDRAM_PAYMENT_PROVIDER,
} from './constants';
import { getIdramConfig } from './config';
import { isIdramPrecheckRequest, parseIdramCallbackParams } from './parse-callback';
import type { IdramCallbackParams } from './types';
import { logger } from '@/lib/utils/logger';

type OrderWithPayments = Prisma.OrderGetPayload<{
  include: { payments: true };
}>;

function plainTextResponse(body: string, status = 200): NextResponse {
  return new NextResponse(body, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

async function findOrderByBillNo(billNo: string): Promise<OrderWithPayments | null> {
  if (!billNo) {
    return null;
  }
  return db.order.findUnique({
    where: { number: billNo },
    include: {
      payments: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

function getIdramPayment(order: OrderWithPayments) {
  return order.payments.find((item) => item.provider === IDRAM_PAYMENT_PROVIDER) ?? null;
}

function isRecAccountValid(params: IdramCallbackParams, expectedRecAccount: string): boolean {
  return params.recAccount === expectedRecAccount;
}

async function handleIdramPrecheck(
  params: IdramCallbackParams,
  config: ReturnType<typeof getIdramConfig>,
): Promise<NextResponse> {
  if (!isRecAccountValid(params, config.recAccount)) {
    return plainTextResponse('EDP_REC_ACCOUNT mismatch', 400);
  }
  if (!params.billNo) {
    return plainTextResponse('EDP_BILL_NO not found', 400);
  }

  const order = await findOrderByBillNo(params.billNo);
  if (!order) {
    return plainTextResponse('EDP_BILL_NO not found', 400);
  }

  const payment = getIdramPayment(order);
  if (!payment) {
    return plainTextResponse('Payment record not found', 400);
  }

  if (order.paymentStatus === 'paid' || payment.status === 'completed') {
    return plainTextResponse(IDRAM_CALLBACK_OK_RESPONSE);
  }

  if (order.paymentStatus !== 'pending' || payment.status !== 'pending') {
    return plainTextResponse('Order is not pending payment', 400);
  }

  if (!amountsMatchOrderTotal(Number(order.total), params.amount)) {
    return plainTextResponse('EDP_AMOUNT mismatch', 400);
  }

  return plainTextResponse(IDRAM_CALLBACK_OK_RESPONSE);
}

async function markIdramOrderPaid(
  order: OrderWithPayments,
  paymentId: string,
  params: IdramCallbackParams,
): Promise<void> {
  const now = new Date();
  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'paid',
        paidAt: now,
      },
    });
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: 'completed',
        completedAt: now,
        providerTransactionId: params.transId,
        providerResponse: {
          EDP_BILL_NO: params.billNo,
          EDP_REC_ACCOUNT: params.recAccount,
          EDP_PAYER_ACCOUNT: params.payerAccount,
          EDP_AMOUNT: params.amount,
          EDP_TRANS_ID: params.transId,
          EDP_TRANS_DATE: params.transDate,
          EDP_CHECKSUM: params.checksum,
        },
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
          provider: IDRAM_PAYMENT_PROVIDER,
          status: 'paid',
          providerTransactionId: params.transId,
        },
      },
    });
  });
}

async function handleIdramPaymentConfirmation(
  params: IdramCallbackParams,
  config: ReturnType<typeof getIdramConfig>,
): Promise<NextResponse> {
  if (!isRecAccountValid(params, config.recAccount)) {
    return plainTextResponse('EDP_REC_ACCOUNT mismatch', 400);
  }
  if (!params.billNo || !params.transId || !params.transDate || !params.payerAccount) {
    return plainTextResponse('Missing required callback fields', 400);
  }

  const expectedChecksum = computeIdramChecksum({
    recAccount: params.recAccount,
    amount: params.amount,
    secretKey: config.secretKey,
    billNo: params.billNo,
    payerAccount: params.payerAccount,
    transId: params.transId,
    transDate: params.transDate,
  });
  if (!isIdramChecksumValid(params.checksum, expectedChecksum)) {
    logger.warn('Idram callback checksum mismatch', {
      billNo: params.billNo,
      transId: params.transId,
    });
    return plainTextResponse(IDRAM_CHECKSUM_ERROR_RESPONSE, 400);
  }

  const order = await findOrderByBillNo(params.billNo);
  if (!order) {
    return plainTextResponse('EDP_BILL_NO not found', 400);
  }

  const payment = getIdramPayment(order);
  if (!payment) {
    return plainTextResponse('Payment record not found', 400);
  }

  if (order.paymentStatus === 'paid' || payment.status === 'completed') {
    return plainTextResponse(IDRAM_CALLBACK_OK_RESPONSE);
  }

  if (!amountsMatchOrderTotal(Number(order.total), params.amount)) {
    return plainTextResponse('EDP_AMOUNT mismatch', 400);
  }

  await markIdramOrderPaid(order, payment.id, params);
  return plainTextResponse(IDRAM_CALLBACK_OK_RESPONSE);
}

/**
 * Handles Idram RESULT_URL server-to-server callbacks (precheck + payment confirmation).
 */
export async function handleIdramCallback(params: URLSearchParams): Promise<NextResponse> {
  const config = getIdramConfig();
  const parsed = parseIdramCallbackParams(params);

  try {
    if (isIdramPrecheckRequest(parsed)) {
      return await handleIdramPrecheck(parsed, config);
    }
    return await handleIdramPaymentConfirmation(parsed, config);
  } catch (error: unknown) {
    logger.error('Idram callback handler error', {
      error,
      billNo: parsed.billNo,
      transId: parsed.transId,
    });
    return plainTextResponse('Internal error', 500);
  }
}
