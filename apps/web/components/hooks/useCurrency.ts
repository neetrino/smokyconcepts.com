'use client';

import type { CurrencyCode } from '../../lib/currency';
import { STORE_PRICE_CURRENCY } from '../../lib/currency';

/**
 * Storefront currency is fixed to USD.
 */
export function useCurrency(): CurrencyCode {
  return STORE_PRICE_CURRENCY;
}
