import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';

export type CatalogSizeQueryDraft = {
  size: string;
  sizeCat: string;
};

/** Map a size-catalog item to catalog `size` / `sizeCat` query values. */
export function catalogSizeQueryFromItem(item: SizeCatalogItemDto): CatalogSizeQueryDraft {
  const packTitle = item.title.trim();
  const bandTitle = item.categoryTitle.trim();
  const sizeQueryValue = bandTitle || packTitle;
  const categoryId = item.categoryId.trim();
  return {
    size: sizeQueryValue ? sizeQueryValue : 'all',
    sizeCat: categoryId,
  };
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
