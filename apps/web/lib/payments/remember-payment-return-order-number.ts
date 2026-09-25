const PAYMENT_RETURN_ORDER_NUMBER_KEY = 'payment-return-order-number';

/** Keeps the shop order number in this tab when the payment gateway omits it on failure. */
export function rememberPaymentReturnOrderNumber(orderNumber: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  const trimmed = orderNumber.trim();
  if (!trimmed) {
    return;
  }
  window.sessionStorage.setItem(PAYMENT_RETURN_ORDER_NUMBER_KEY, trimmed);
}

/** Reads the order number stored before the customer left checkout for payment. */
export function readRememberedPaymentReturnOrderNumber(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const value = window.sessionStorage.getItem(PAYMENT_RETURN_ORDER_NUMBER_KEY)?.trim() ?? '';
  return value.length > 0 ? value : null;
}
