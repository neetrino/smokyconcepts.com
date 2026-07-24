import { ADMIN_PRICE_CURRENCY, formatStoredMoney } from '@/lib/currency';

/**
 * Dashboard utility functions
 */

/**
 * Formats currency amount
 */
export function formatCurrency(amount: number, currency: string = ADMIN_PRICE_CURRENCY): string {
  return formatStoredMoney(amount, currency, ADMIN_PRICE_CURRENCY);
}

/**
 * Formats date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('hy-AM', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

