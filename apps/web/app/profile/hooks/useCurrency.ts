import type { CurrencyCode } from '../../../lib/currency';
import { STORE_PRICE_CURRENCY } from '../../../lib/currency';

export function useCurrency(): { currency: CurrencyCode } {
  return { currency: STORE_PRICE_CURRENCY };
}
