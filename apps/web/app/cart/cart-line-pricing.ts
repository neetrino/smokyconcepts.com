import { adminInputAmdToUsd } from '@/lib/currency';
import type { CartItem } from './types';

/** Size-catalog / customize collection surcharge per unit (USD). */
export function getCartLineCollectionUnitUsd(item: CartItem): number {
  const priceAmd = item.variant.sizeCatalogCategoryPriceAmd;
  if (typeof priceAmd !== 'number' || !Number.isFinite(priceAmd) || priceAmd <= 0) {
    return 0;
  }
  return adminInputAmdToUsd(priceAmd);
}

/** Unit price for storefront display (base variant + collection). */
export function getCartLineUnitPriceUsd(item: CartItem): number {
  return item.price + getCartLineCollectionUnitUsd(item);
}

/** Line total for storefront display (matches PDP when customize surcharge applies). */
export function getCartLineTotalUsd(item: CartItem): number {
  return getCartLineUnitPriceUsd(item) * item.quantity;
}

export function getCartDisplaySubtotalUsd(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + getCartLineTotalUsd(item), 0);
}
