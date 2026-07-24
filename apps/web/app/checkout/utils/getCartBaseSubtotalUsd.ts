import { amountToUsd } from '../../../lib/currency';
import { getCartLineUnitPriceUsd } from '../../cart/cart-line-pricing';
import type { Cart } from '../types';

/** Variant base subtotal in USD (excludes customize / size-catalog surcharges). */
export function getCartMerchandiseSubtotalUsd(cart: Cart | null): number | null {
  if (!cart || cart.items.length === 0) {
    return null;
  }
  const cartMoneyCurrency = cart.totals.currency?.trim() || 'USD';
  return amountToUsd(cart.totals.subtotal, cartMoneyCurrency);
}

/**
 * Full checkout subtotal in USD (base + customize surcharges) — matches server `orders.service` checkout.
 */
export function getCartCheckoutSubtotalUsd(
  cart: Cart | null,
  categoryPriceByTitle?: Map<string, number>
): number | null {
  if (!cart || cart.items.length === 0) {
    return null;
  }
  return cart.items.reduce(
    (sum, item) => sum + getCartLineUnitPriceUsd(item, categoryPriceByTitle) * item.quantity,
    0
  );
}

/**
 * @deprecated Prefer {@link getCartMerchandiseSubtotalUsd} (base only) or {@link getCartCheckoutSubtotalUsd} (server parity).
 */
export function getCartBaseSubtotalUsd(cart: Cart | null): number | null {
  return getCartMerchandiseSubtotalUsd(cart);
}
