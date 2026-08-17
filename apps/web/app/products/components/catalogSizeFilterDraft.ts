import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';

export type CatalogSizeQueryDraft = {
  size: string;
  sizeCat: string;
};

const ALL_SIZE_QUERY = 'all';

/** Map a size-catalog item to catalog `size` / `sizeCat` query values. */
export function catalogSizeQueryFromItem(item: SizeCatalogItemDto): CatalogSizeQueryDraft {
  const packTitle = item.title.trim();
  const bandTitle = item.categoryTitle.trim();
  const sizeQueryValue = bandTitle || packTitle;
  const categoryId = item.categoryId.trim();
  return {
    size: sizeQueryValue || ALL_SIZE_QUERY,
    sizeCat: categoryId,
  };
}

/**
 * PDP href that carries the active catalog size filter so the product page
 * can preselect the same size / variant shown on the card.
 */
export function buildProductDetailHref(
  slug: string,
  options?: { size?: string | null; sizeCat?: string | null }
): string {
  const base = `/products/${slug}`;
  const size = (options?.size ?? '').trim();
  if (!size || size.toLowerCase() === ALL_SIZE_QUERY) {
    return base;
  }
  const params = new URLSearchParams();
  params.set('size', size);
  const sizeCat = (options?.sizeCat ?? '').trim();
  if (sizeCat && sizeCat.toLowerCase() !== ALL_SIZE_QUERY) {
    params.set('sizeCat', sizeCat);
  }
  return `${base}?${params.toString()}`;
}

/** Find a size-catalog item by id across categories. */
export function findSizeCatalogItemById(
  sizeCatalogCategories: SizeCatalogCategoryDto[],
  itemId: string
): SizeCatalogItemDto | null {
  const needle = itemId.trim();
  if (!needle) {
    return null;
  }
  for (const category of sizeCatalogCategories) {
    const hit = category.items.find((item) => item.id === needle);
    if (hit) {
      return hit;
    }
  }
  return null;
}

/** Resolve size-catalog item id from applied or pending size query params. */
export function resolveCatalogItemId(
  sizeCatalogCategories: SizeCatalogCategoryDto[],
  size: string,
  sizeCatalogCategoryId: string
): string | null {
  if (size === 'all') {
    return null;
  }
  const sizeNeedle = size.trim().toLowerCase();
  const categoryNeedle = sizeCatalogCategoryId.trim();
  for (const category of sizeCatalogCategories) {
    const exactTitleHit = category.items.find((item) => {
      const titleMatch = item.title.trim().toLowerCase() === sizeNeedle;
      if (!titleMatch) {
        return false;
      }
      if (!categoryNeedle) {
        return true;
      }
      return item.categoryId === categoryNeedle;
    });
    if (exactTitleHit) {
      return exactTitleHit.id;
    }
    const bandTitleHit = category.items.find((item) => {
      const bandMatch = item.categoryTitle.trim().toLowerCase() === sizeNeedle;
      if (!bandMatch) {
        return false;
      }
      if (!categoryNeedle) {
        return true;
      }
      return item.categoryId === categoryNeedle;
    });
    if (bandTitleHit) {
      return bandTitleHit.id;
    }
  }
  return null;
}
