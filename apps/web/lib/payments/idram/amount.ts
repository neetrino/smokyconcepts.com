import { IDRAM_AMOUNT_TOLERANCE_AMD } from './constants';
import { convertPrice, roundCatalogAmd } from '@/lib/currency';

export function formatIdramAmount(amount: number): string {
  const normalized = Number(amount);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new Error('Idram amount must be a positive number');
  }
  if (Number.isInteger(normalized)) {
    return String(normalized);
  }
  return normalized.toFixed(2);
}

export function parseIdramAmount(value: string): number | null {
  const trimmed = value.trim().replace(',', '.');
  if (!trimmed) {
    return null;
  }
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function amountsMatchOrderTotal(orderTotal: number, callbackAmount: string): boolean {
  const received = parseIdramAmount(callbackAmount);
  if (received == null) {
    return false;
  }
  return Math.abs(received - orderTotal) <= IDRAM_AMOUNT_TOLERANCE_AMD;
}

export function resolveOrderAmountForIdramAmd(orderTotal: number, orderCurrency: string): number {
  const normalizedCurrency = orderCurrency.trim().toUpperCase();
  if (normalizedCurrency === 'AMD') {
    return roundCatalogAmd(orderTotal);
  }
  if (normalizedCurrency === 'USD') {
    return roundCatalogAmd(convertPrice(orderTotal, 'USD', 'AMD'));
  }
  return roundCatalogAmd(orderTotal);
}
