/**
 * Normalizes collection title for size-catalog price lookup (matches orders.service).
 */
export function normalizeSizeCatalogCategoryTitleKey(value: string | null | undefined): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

/**
 * Resolves AMD collection price: prefer server map by category title, else validated client value.
 */
export function resolveSizeCatalogCategoryPriceAmd(params: {
  categoryTitle?: string | null;
  clientPriceAmd?: number | null;
  priceAmdByCategoryTitle: Map<string, number>;
}): number {
  const titleKey = normalizeSizeCatalogCategoryTitleKey(params.categoryTitle);
  if (titleKey !== '') {
    const fromCatalog = params.priceAmdByCategoryTitle.get(titleKey);
    if (typeof fromCatalog === 'number' && Number.isFinite(fromCatalog) && fromCatalog >= 0) {
      return Math.round(fromCatalog);
    }
  }

  const client = params.clientPriceAmd;
  if (typeof client === 'number' && Number.isFinite(client) && client >= 0) {
    return Math.round(client);
  }

  return 0;
}

/** Builds max priceAmd per normalized category title from DB rows. */
export function buildSizeCatalogPriceAmdByTitle(
  categories: Array<{ title: string; priceAmd: number }>
): Map<string, number> {
  const map = new Map<string, number>();
  for (const category of categories) {
    const key = normalizeSizeCatalogCategoryTitleKey(category.title);
    if (!key) {
      continue;
    }
    const existing = map.get(key);
    if (existing === undefined || category.priceAmd > existing) {
      map.set(key, category.priceAmd);
    }
  }
  return map;
}
