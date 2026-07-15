import { ADMIN_PRICE_CURRENCY, formatStoredMoney } from '@/lib/currency';
import { formatAdminDate, formatAdminDateShort } from '../utils/formatAdminDate';

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = ADMIN_PRICE_CURRENCY): string {
  return formatStoredMoney(amount, currency, ADMIN_PRICE_CURRENCY);
}

/** Full date: day, month, year. */
export function formatDate(dateString: string): string {
  return formatAdminDate(dateString);
}

/** Compact date: day + short month. */
export function formatDateShort(dateString: string): string {
  return formatAdminDateShort(dateString);
}




