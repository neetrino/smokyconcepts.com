import type { CatalogProduct } from '@/app/products/components/catalogProductLabels';

/** Session-scoped cache so home trending does not refetch on carousel wrap or remount. */
let cachedItems: CatalogProduct[] | null = null;

export function getTrendingFeaturedProductsCache(): CatalogProduct[] | null {
  return cachedItems;
}

export function setTrendingFeaturedProductsCache(items: CatalogProduct[]): void {
  cachedItems = items.length > 0 ? items : null;
}
