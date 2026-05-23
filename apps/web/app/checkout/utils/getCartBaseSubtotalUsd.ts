import { amountToUsd } from '../../../lib/currency';
import type { Cart } from '../types';

/** Full cart merchandise subtotal in USD (matches server checkout `subtotal`). */
export function getCartMerchandiseSubtotalUsd(cart: Cart | null): number | null {
  if (!cart || cart.items.length === 0) {
    return null;
  }
  const cartMoneyCurrency = cart.totals.currency?.trim() || 'USD';
  return amountToUsd(cart.totals.subtotal, cartMoneyCurrency);
}

/**
 * Cart line subtotal in USD excluding size-catalog surcharges (matches checkout order summary base).
 * Guest cart lines store variant base price only; collection is on `sizeCatalogCategoryPriceAmd`.
 */
export function getCartBaseSubtotalUsd(cart: Cart | null): number | null {
  return getCartMerchandiseSubtotalUsd(cart);
}
