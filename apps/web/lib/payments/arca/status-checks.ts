import type { ArcaOrderStatusResponse } from './types';
import { normalizeArcaErrorCode, normalizeArcaOrderStatus } from './response-codes';

function readPaymentState(status: ArcaOrderStatusResponse): string {
  const paymentStateRaw =
    status.paymentAmountInfo?.paymentState ??
    (status as ArcaOrderStatusResponse & { paymentState?: string | number }).paymentState;
  return String(paymentStateRaw ?? '').trim().toUpperCase();
}

export function isArcaStatusPaid(status: ArcaOrderStatusResponse): boolean {
  const errorCode = normalizeArcaErrorCode(status.errorCode);
  if (errorCode !== 0) {
    return false;
  }

  const paymentState = readPaymentState(status);
  if (
    paymentState === 'DEPOSITED' ||
    paymentState === 'PAYMENT_DEPOSITED' ||
    paymentState === 'SUCCESSFUL' ||
    paymentState === '2' ||
    paymentState === '4'
  ) {
    return true;
  }

  const orderStatus = normalizeArcaOrderStatus(status.orderStatus);
  return orderStatus === 2 || orderStatus === 4;
}

export function isArcaStatusFailed(status: ArcaOrderStatusResponse): boolean {
  const paymentState = readPaymentState(status);
  if (
    paymentState.includes('DECLIN') ||
    paymentState.includes('CANCEL') ||
    paymentState.includes('FAIL') ||
    paymentState.includes('REVERS') ||
    paymentState.includes('VOID') ||
    paymentState.includes('REFUND') ||
    paymentState === '3' ||
    paymentState === '6'
  ) {
    return true;
  }

  const orderStatus = normalizeArcaOrderStatus(status.orderStatus);
  // ArCa: 3 declined/voided, 6 refunded/reversed after decline paths vary by bank.
  return orderStatus === 3 || orderStatus === 6;
}

/** True when bank payment is already cancelled (void) or refunded. */
export function isArcaStatusAlreadyReversed(status: ArcaOrderStatusResponse): boolean {
  const paymentState = readPaymentState(status);
  if (
    paymentState.includes('VOID') ||
    paymentState.includes('REFUND') ||
    paymentState.includes('REVERS') ||
    paymentState.includes('CANCEL')
  ) {
    return true;
  }

  const orderStatus = normalizeArcaOrderStatus(status.orderStatus);
  // Ameria: after successful CancelPayment, OrderStatus becomes 3 and PaymentState payment_void.
  return orderStatus === 3;
}
