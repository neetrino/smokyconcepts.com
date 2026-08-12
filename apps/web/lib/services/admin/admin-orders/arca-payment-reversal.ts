import { convertPrice, roundCatalogAmd } from '@/lib/currency';
import { getArcaConfig } from '@/lib/payments/arca/config';
import { getArcaOrderStatus, reverseOrRefundArcaPayment } from '@/lib/payments/arca/client';
import { normalizeArcaErrorCode } from '@/lib/payments/arca/response-codes';
import { isArcaStatusAlreadyReversed } from '@/lib/payments/arca/status-checks';
import { logger } from '../../utils/logger';

const ARCA_PROVIDER = 'arca';
const ARCA_TEST_MODE_REQUIRED_AMOUNT_AMD = 10;

type ArcaPaymentRecord = {
  id: string;
  provider: string;
  providerTransactionId: string | null;
  status: string;
  amount: number;
  currency: string;
};

type OrderForArcaReversal = {
  id: string;
  number: string;
  total: number;
  currency: string;
  paymentStatus: string;
  payments: ArcaPaymentRecord[];
};

function resolveRefundAmountAmd(orderTotal: number, orderCurrency: string, testMode: boolean): number {
  if (testMode) {
    return ARCA_TEST_MODE_REQUIRED_AMOUNT_AMD;
  }

  const normalizedCurrency = orderCurrency.trim().toUpperCase();
  if (normalizedCurrency === 'AMD') {
    return roundCatalogAmd(orderTotal);
  }
  if (normalizedCurrency === 'USD') {
    return roundCatalogAmd(convertPrice(orderTotal, 'USD', 'AMD'));
  }

  return roundCatalogAmd(orderTotal);
}

function findCompletedArcaPayment(order: OrderForArcaReversal): ArcaPaymentRecord | null {
  const payment = order.payments.find(
    (item) =>
      item.provider === ARCA_PROVIDER &&
      (item.status === 'completed' || order.paymentStatus === 'paid') &&
      Boolean(item.providerTransactionId?.trim()),
  );
  return payment ?? null;
}

async function resolveBankRefundAmount(
  providerOrderId: string,
  order: OrderForArcaReversal,
): Promise<number> {
  const config = getArcaConfig();
  const fallbackAmount = resolveRefundAmountAmd(
    Number(order.total),
    String(order.currency ?? 'USD'),
    config.testMode,
  );

  try {
    const details = await getArcaOrderStatus(providerOrderId);
    const bankAmount = details.depositedAmount ?? details.amount;
    if (bankAmount != null && Number.isFinite(bankAmount) && bankAmount > 0) {
      return bankAmount;
    }
  } catch (error: unknown) {
    logger.warn('Failed to load Arca payment details for refund amount', {
      orderNumber: order.number,
      providerOrderId,
      error,
    });
  }

  return fallbackAmount;
}

export function shouldReverseArcaPayment(params: {
  existingPaymentStatus: string;
  nextStatus?: string;
  nextPaymentStatus?: string;
  existingStatus: string;
}): boolean {
  const isPaid = params.existingPaymentStatus === 'paid';
  if (!isPaid) {
    return false;
  }

  const refundRequested = params.nextPaymentStatus === 'refunded';
  const cancelPaidOrder =
    params.nextStatus === 'cancelled' && params.existingStatus !== 'cancelled';

  return refundRequested || cancelPaidOrder;
}

/**
 * Calls Ameria/ArCa Cancel (reverse) or Refund for a paid Arca order.
 * Returns provider payload for persistence; throws API-shaped errors on failure.
 */
export async function reverseArcaPaymentForOrder(order: OrderForArcaReversal): Promise<{
  paymentId: string;
  providerOrderId: string;
  action: 'cancel' | 'refund';
  providerResponse: Record<string, unknown>;
}> {
  const payment = findCompletedArcaPayment(order);
  if (!payment?.providerTransactionId) {
    throw {
      status: 409,
      type: 'https://api.shop.am/problems/conflict',
      title: 'Cannot reverse payment',
      detail: 'Paid Arca payment with provider transaction id was not found',
    };
  }

  const providerOrderId = payment.providerTransactionId.trim();
  const amount = await resolveBankRefundAmount(providerOrderId, order);

  try {
    const currentStatus = await getArcaOrderStatus(providerOrderId);
    if (isArcaStatusAlreadyReversed(currentStatus)) {
      logger.info('Arca payment already reversed/refunded at bank', {
        orderNumber: order.number,
        providerOrderId,
        orderStatus: currentStatus.orderStatus,
        paymentState: currentStatus.paymentAmountInfo?.paymentState,
      });
      return {
        paymentId: payment.id,
        providerOrderId,
        action: 'cancel',
        providerResponse: {
          action: 'cancel',
          errorCode: 0,
          errorMessage: 'Already reversed or refunded at bank',
          amount: currentStatus.depositedAmount ?? amount,
          alreadyReversed: true,
        },
      };
    }
  } catch (error: unknown) {
    logger.warn('Failed to pre-check Arca status before reverse/refund', {
      orderNumber: order.number,
      providerOrderId,
      error,
    });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw {
      status: 400,
      type: 'https://api.shop.am/problems/validation-error',
      title: 'Validation Error',
      detail: 'Refund amount must be greater than zero',
    };
  }

  const result = await reverseOrRefundArcaPayment(providerOrderId, amount);
  if (normalizeArcaErrorCode(result.errorCode) !== 0) {
    logger.error('Arca reverse/refund failed', {
      orderNumber: order.number,
      providerOrderId,
      action: result.action,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
    });
    throw {
      status: 502,
      type: 'https://api.shop.am/problems/upstream-error',
      title: 'Arca Reverse/Refund Failed',
      detail: result.errorMessage || `Arca ${result.action} failed (code ${String(result.errorCode)})`,
    };
  }

  logger.info('Arca reverse/refund succeeded', {
    orderNumber: order.number,
    providerOrderId,
    action: result.action,
    amount,
  });

  return {
    paymentId: payment.id,
    providerOrderId,
    action: result.action,
    providerResponse: {
      action: result.action,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
      amount,
    },
  };
}
