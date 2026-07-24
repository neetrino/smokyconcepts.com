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
 * Customize surcharge AMD for a cart line — only when PDP customize text was saved.
 * Uses persisted line snapshot first, then category title lookup when needed.
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

/** Size-catalog / customize collection surcharge per unit (USD). */
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

/** Line total for storefront display (matches PDP when customize surcharge applies). */
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

/** Normalized category title keys present on cart lines with saved customize. */
export function getCartCustomizeCategoryTitleKeys(items: CartItem[]): string[] {
  const keys = new Set<string>();
  for (const item of items) {
    if (!orderItemHasSavedCustomize(item.variant)) {
      continue;
    }
    const title = resolveCartLineCategoryTitle(item.variant);
    const key = normalizeSizeCatalogCategoryTitleKey(title);
    if (key) {
      keys.add(key);
    }
  }
  return Array.from(keys);
}
