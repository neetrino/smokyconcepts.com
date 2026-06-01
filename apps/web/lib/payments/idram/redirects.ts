import { getPaymentAppUrl } from './config';

export function buildIdramSuccessRedirect(orderNumber?: string): string {
  const appUrl = getPaymentAppUrl();
  const query = new URLSearchParams({
    clearCart: '1',
    payment: 'paid',
  });
  if (orderNumber?.trim()) {
    query.set('orderNumber', orderNumber.trim());
  }
  return `${appUrl}/checkout/thank-you?${query.toString()}`;
}

export function buildIdramFailureRedirect(orderNumber?: string): string {
  const appUrl = getPaymentAppUrl();
  const query = new URLSearchParams({
    payment: 'failed',
  });
  if (orderNumber) {
    query.set('orderNumber', orderNumber);
  }
  return `${appUrl}/checkout/payment-failed?${query.toString()}`;
}
