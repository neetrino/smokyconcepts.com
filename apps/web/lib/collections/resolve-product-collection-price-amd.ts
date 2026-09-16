import { normalizeSizeCatalogCategoryTitleKey } from '@/lib/size-catalog/resolve-size-catalog-category-price-amd';

export interface ProductCollectionPriceSource {
  id?: string | null;
  title?: string | null;
  priceAmd?: number | null;
}

export interface CollectionLivePriceMaps {
  byId?: Map<string, number>;
  byTitle?: Map<string, number>;
}

function toAmd(value: number | null | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.round(value));
}

/**
 * Highest collection surcharge among a product's collections.
 * Live admin tree prices win over a stale product payload.
 */
export function resolveProductCollectionPriceAmd(
  collections: ProductCollectionPriceSource[] | undefined,
  livePrices?: CollectionLivePriceMaps
): { priceAmd: number; categoryTitle: string | null } {
  if (!collections?.length) {
    return { priceAmd: 0, categoryTitle: null };
  }

  let maxPrice = 0;
  let matchedTitle: string | null = null;
  for (const collection of collections) {
    const title = collection.title?.trim() ?? '';
    const titleKey = normalizeSizeCatalogCategoryTitleKey(title);
    const id = collection.id?.trim() ?? '';
    const priceAmd = Math.max(
      toAmd(id !== '' ? livePrices?.byId?.get(id) : 0),
      toAmd(titleKey !== '' ? livePrices?.byTitle?.get(titleKey) : 0),
      toAmd(collection.priceAmd)
    );
    if (priceAmd > maxPrice) {
      maxPrice = priceAmd;
      matchedTitle = title !== '' ? title : matchedTitle;
    }
  }

  return { priceAmd: maxPrice, categoryTitle: matchedTitle };
}
