/**
 * Resolves order number from payment-return or thank-you query params.
 */
export function resolvePaymentReturnOrderNumber(searchParams: URLSearchParams): string | null {
  const candidates = [
    searchParams.get('orderNumber'),
    searchParams.get('order_number'),
    searchParams.get('order'),
    searchParams.get('EDP_BILL_NO'),
  ];
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value) {
      return value;
    }
  }
  return null;
}
