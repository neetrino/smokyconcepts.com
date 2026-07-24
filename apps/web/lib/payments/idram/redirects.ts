import { getPaymentAppUrl } from './config';

function resolveRedirectBaseUrl(baseUrl?: string): string {
  const trimmedBaseUrl = baseUrl?.trim();
  if (trimmedBaseUrl && trimmedBaseUrl.length > 0) {
    return trimmedBaseUrl.endsWith('/') ? trimmedBaseUrl.slice(0, -1) : trimmedBaseUrl;
  }

  return getPaymentAppUrl();
}

export function buildIdramSuccessRedirect(orderNumber?: string, baseUrl?: string): string {
  const appUrl = resolveRedirectBaseUrl(baseUrl);
  const query = new URLSearchParams({
    clearCart: '1',
    payment: 'paid',
  });
  if (orderNumber?.trim()) {
    query.set('orderNumber', orderNumber.trim());
  }
  return `${appUrl}/checkout/thank-you?${query.toString()}`;
}

export function buildIdramFailureRedirect(orderNumber?: string, baseUrl?: string): string {
  const appUrl = resolveRedirectBaseUrl(baseUrl);
  const query = new URLSearchParams({
    payment: 'failed',
  });
  if (orderNumber) {
    query.set('orderNumber', orderNumber);
  }
  return `${appUrl}/checkout/payment-failed?${query.toString()}`;
}
