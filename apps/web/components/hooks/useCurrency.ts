'use client';

import { useEffect, useState } from 'react';

import type { CurrencyCode } from '../../lib/currency';
import {
  enableClientCurrencyStorageReads,
  getStoredCurrency,
  STORE_PRICE_CURRENCY,
} from '../../lib/currency';

/**
 * Storefront display currency synced with localStorage.
 * Re-renders when exchange rates refresh even if the selected currency code is unchanged.
 */
export function useCurrency(): CurrencyCode {
  const [state, setState] = useState(() => ({
    currency: STORE_PRICE_CURRENCY,
    revision: 0,
  }));

  useEffect(() => {
    enableClientCurrencyStorageReads();
    const sync = () => {
      setState((prev) => ({
        currency: getStoredCurrency(),
        revision: prev.revision + 1,
      }));
    };
    sync();
    window.addEventListener('currency-updated', sync);
    window.addEventListener('currency-rates-updated', sync);
    return () => {
      window.removeEventListener('currency-updated', sync);
      window.removeEventListener('currency-rates-updated', sync);
    };
  }, []);

  return state.currency;
}

/**
 * Subscribe to live exchange-rate updates (admin lists, etc.).
 * Pair with {@link formatOrderListTotalDisplay} so totals refresh after rates load.
 */
export function useCurrencyRatesReady(): void {
  useCurrency();
}
