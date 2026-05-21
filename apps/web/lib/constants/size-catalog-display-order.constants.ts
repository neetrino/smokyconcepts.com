import type { SizeCatalogCategoryDto } from '@/lib/types/size-catalog';

/**
 * Storefront “Select size” modal section order (top → bottom).
 * Titles are matched case-insensitively after whitespace normalization.
 */
export const SIZE_CATALOG_CATEGORY_DISPLAY_ORDER = [
  'ultra slims',
  'compact',
  'super slims',
  'slims',
  'king size',
  'sticks',
] as const;

const UNKNOWN_RANK = SIZE_CATALOG_CATEGORY_DISPLAY_ORDER.length;

export function normalizeSizeCatalogCategoryTitle(title: string): string {
  return title
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Lower rank = appears earlier in the size picker.
 */
export function getSizeCatalogCategoryDisplayRank(title: string): number {
  const normalized = normalizeSizeCatalogCategoryTitle(title);

  const exactIndex = SIZE_CATALOG_CATEGORY_DISPLAY_ORDER.findIndex((key) => key === normalized);
  if (exactIndex >= 0) {
    return exactIndex;
  }

  if (/ultra\s*slims?/.test(normalized)) {
    return 0;
  }
  if (normalized === 'compact') {
    return 1;
  }
  if (/super\s*slims?/.test(normalized)) {
    return 2;
  }
  if (/^slims?$/.test(normalized)) {
    return 3;
  }
  if (/king\s*size/.test(normalized)) {
    return 4;
  }
  if (/^sticks?$/.test(normalized)) {
    return 5;
  }

  return UNKNOWN_RANK;
}

export function sortSizeCatalogCategoriesByDisplayOrder(
  categories: SizeCatalogCategoryDto[]
): SizeCatalogCategoryDto[] {
  return [...categories].sort((a, b) => {
    const rankDiff =
      getSizeCatalogCategoryDisplayRank(a.title) - getSizeCatalogCategoryDisplayRank(b.title);
    if (rankDiff !== 0) {
      return rankDiff;
    }
    return a.position - b.position;
  });
}
