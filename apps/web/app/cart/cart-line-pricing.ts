import { adminInputAmdToUsd } from '@/lib/currency';
import { orderItemHasSavedCustomize } from '@/lib/orders/order-item-has-saved-customize';
import {
  normalizeSizeCatalogCategoryTitleKey,
  resolveSizeCatalogCategoryPriceAmd,
} from '@/lib/size-catalog/resolve-size-catalog-category-price-amd';
import type { CartItem } from './types';

type CartLineVariant = CartItem['variant'];

function resolveCartLineCategoryTitle(variant: CartLineVariant): string | undefined {
  const categoryTitle = variant.sizeCatalogCategoryTitle?.trim();
  if (categoryTitle) {
    return categoryTitle;
  }
  const sizeTitle = variant.sizeCatalogTitle?.trim();
  return sizeTitle || undefined;
}

/**
 * Collection surcharge AMD for a cart line.
 * Applied only when the line has customize text; uses snapshot, then title lookup.
 */
export function resolveCartLineCollectionPriceAmd(
  item: CartItem,
  categoryPriceByTitle?: Map<string, number>
): number {
  if (!orderItemHasSavedCustomize(item.variant)) {
    return 0;
  }

  const stored = item.variant.sizeCatalogCategoryPriceAmd;
  if (typeof stored === 'number' && Number.isFinite(stored) && stored > 0) {
    return Math.round(stored);
  }

  const categoryTitle = resolveCartLineCategoryTitle(item.variant);
  if (!categoryTitle) {
    return 0;
  }

  return resolveSizeCatalogCategoryPriceAmd({
    categoryTitle,
    clientPriceAmd: null,
    priceAmdByCategoryTitle: categoryPriceByTitle ?? new Map(),
  });
}

/** Collection surcharge per unit (USD). */
export function getCartLineCollectionUnitUsd(
  item: CartItem,
  categoryPriceByTitle?: Map<string, number>
): number {
  const priceAmd = resolveCartLineCollectionPriceAmd(item, categoryPriceByTitle);
  if (priceAmd <= 0) {
    return 0;
  }
  return adminInputAmdToUsd(priceAmd);
}

/** Unit price for storefront display (base variant + collection). */
export function getCartLineUnitPriceUsd(
  item: CartItem,
  categoryPriceByTitle?: Map<string, number>
): number {
  return item.price + getCartLineCollectionUnitUsd(item, categoryPriceByTitle);
}

/** Line total for storefront display (base variant + collection surcharge). */
export function getCartLineTotalUsd(
  item: CartItem,
  categoryPriceByTitle?: Map<string, number>
): number {
  return getCartLineUnitPriceUsd(item, categoryPriceByTitle) * item.quantity;
}

export function getCartDisplaySubtotalUsd(
  items: CartItem[],
  categoryPriceByTitle?: Map<string, number>
): number {
  return items.reduce((sum, item) => sum + getCartLineTotalUsd(item, categoryPriceByTitle), 0);
}

const CART_CUSTOMIZATION_SUMMARY_TITLE = 'Customization';

/** Line total without collection surcharge (product row display). */
export function getCartLineMerchandiseTotalUsd(item: CartItem): number {
  return item.price * item.quantity;
}

/** Merchandise subtotal without collection surcharge. */
export function getCartMerchandiseDisplayUsd(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + getCartLineMerchandiseTotalUsd(item), 0);
}

/** Customization surcharge row for the cart summary (single label + USD). */
export function getCartCollectionSummaryRows(
  items: CartItem[],
  categoryPriceByTitle?: Map<string, number>
): Array<{ title: string; usd: number }> {
  let usd = 0;
  for (const item of items) {
    const unitUsd = getCartLineCollectionUnitUsd(item, categoryPriceByTitle);
    if (unitUsd <= 0) {
      continue;
    }
    usd += unitUsd * item.quantity;
  }
  if (usd <= 0) {
    return [];
  }
  return [{ title: CART_CUSTOMIZATION_SUMMARY_TITLE, usd }];
}

/** Normalized category title keys present on cart lines with a collection surcharge context. */
export function getCartCustomizeCategoryTitleKeys(items: CartItem[]): string[] {
  const keys = new Set<string>();
  for (const item of items) {
    const title = resolveCartLineCategoryTitle(item.variant);
    const key = normalizeSizeCatalogCategoryTitleKey(title);
    if (key) {
      keys.add(key);
    }
  }
  return Array.from(keys);
}
