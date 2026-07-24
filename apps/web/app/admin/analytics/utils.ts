import { ADMIN_PRICE_CURRENCY, formatStoredMoney } from '@/lib/currency';

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = ADMIN_PRICE_CURRENCY): string {
  return formatStoredMoney(amount, currency, ADMIN_PRICE_CURRENCY);
}

/**
 * Format date to full format (year, month, day)
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('hy-AM', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Format date to short format (month, day)
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('hy-AM', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}




