import { sortSizeCatalogCategoriesByDisplayOrder } from '@/lib/constants/size-catalog-display-order.constants';
import type { SizeCatalogCategoryDto } from '@/lib/types/size-catalog';

import type { CatalogProductCardItem } from './productsCatalogCard.types';

/** Section pill colors — same tokens as {@link ProductsCatalogCard} PDP/catalog. */
export const PRODUCT_SECTION_BADGE_CLASS_NAMES: Record<string, string> = {
  Classic: 'bg-[#122a26] text-white',
  Special: 'bg-[#dcc090] text-white',
  Atelier: 'bg-[#731818] text-white',
  Premium: 'bg-[#414141] text-white',
};

const SECTION_NAME_BY_CATEGORY_SLUG: Record<string, string> = {
  classic: 'Classic',
  'special-edition': 'Special',
  atelier: 'Atelier',
  premium: 'Premium',
};

const CLIENT_SIDE_COLLECTION_VALUES = new Set<string>([
  'all',
  'Classic',
  'Special',
  'Atelier',
  'Premium',
  ...Object.keys(SECTION_NAME_BY_CATEGORY_SLUG),
]);

const COLOR_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: 'Forest Green', pattern: /(forest|green)/i },
  { label: 'Deep Red', pattern: /(deep|red|wine|burgundy)/i },
  { label: 'Mystique Black', pattern: /(mystique|black|charcoal)/i },
];

export interface CatalogProduct extends CatalogProductCardItem {
  categories: Array<{
    id: string;
    slug: string;
    title: string;
  }>;
  skus: string[];
  colors?: string[];
  sizeLabel?: string | null;
  /** All variant size labels/values — used with size-catalog filter (PDP parity). */
  sizeLabels?: string[];
  /** Size-catalog template category ids from variant attributes (default pricing / PDP). */
  sizeCatalogCategoryIds?: string[];
  /** Same source as ids — `__size_catalog_category_title__` values for title-only matching. */
  sizeCatalogCategoryTitles?: string[];
}

/** Partial product payloads from API or legacy grids → full `CatalogProduct` for `ProductsCatalogCard`. */
export function toCatalogProduct(input: {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string | null;
  images?: string[];
  inStock?: boolean;
  originalPrice?: number | null;
  defaultVariantId?: string | null;
  defaultVariantStock?: number;
  defaultSku?: string;
  categories?: Array<{ id: string; slug: string; title: string }>;
  skus?: string[];
  colors?: string[];
  sizeLabel?: string | null;
  sizeLabels?: string[];
  sizeCatalogCategoryIds?: string[];
  sizeCatalogCategoryTitles?: string[];
}): CatalogProduct {
  return {
    id: input.id,
    slug: input.slug,
    title: input.title,
    price: input.price ?? 0,
    image: input.image ?? null,
    images: Array.isArray(input.images) ? input.images : [],
    inStock: input.inStock ?? true,
    originalPrice: input.originalPrice ?? null,
    defaultVariantId: input.defaultVariantId ?? null,
    defaultVariantStock: input.defaultVariantStock ?? 0,
    defaultSku: input.defaultSku ?? '',
    categories: Array.isArray(input.categories) ? input.categories : [],
    skus: Array.isArray(input.skus) ? input.skus : [],
    colors: input.colors,
    sizeLabel: input.sizeLabel ?? null,
    sizeLabels: Array.isArray(input.sizeLabels) ? input.sizeLabels : undefined,
    sizeCatalogCategoryIds: Array.isArray(input.sizeCatalogCategoryIds)
      ? input.sizeCatalogCategoryIds
      : undefined,
    sizeCatalogCategoryTitles: Array.isArray(input.sizeCatalogCategoryTitles)
      ? input.sizeCatalogCategoryTitles
      : undefined,
  };
}

export function getProductSectionLabelsForCategories(
  categories: CatalogProduct['categories']
): string[] {
  const labels = categories
    .map((category) => SECTION_NAME_BY_CATEGORY_SLUG[category.slug] ?? category.title)
    .filter((label): label is string => Boolean(label?.trim()));

  return Array.from(new Set(labels));
}

export function getProductSectionLabels(product: CatalogProduct): string[] {
  const labels = getProductSectionLabelsForCategories(product.categories);
  if (labels.length === 0) {
    return ['Classic'];
  }
  return labels;
}

/**
 * Collection pills for PDP — matches catalog card section colors and labels (no fake Classic when there are no categories).
 */
export function getProductCollectionBadgeItems(product: {
  categories?: CatalogProduct['categories'];
}): Array<{ sectionLabel: string; text: string }> {
  const categories = product.categories ?? [];
  if (categories.length === 0) {
    return [];
  }
  const catalogProduct = toCatalogProduct({
    id: '_pdp',
    slug: '_pdp',
    title: '_',
    price: 0,
    image: null,
    categories,
  });
  const sections = getProductSectionLabelsForCategories(catalogProduct.categories);
  return sections.map((sectionTitle) => ({
    sectionLabel: sectionTitle,
    text: getCategoryLabel(catalogProduct, sectionTitle),
  }));
}

/**
 * Match catalog `category` query (slug from links or section title from dropdown) to products.
 */
export function productMatchesCategoryFilter(
  product: CatalogProduct,
  selectedCollection: string
): boolean {
  if (selectedCollection === 'all') {
    return true;
  }

  if (product.categories.some((c) => c.slug === selectedCollection)) {
    return true;
  }

  const sectionLabels = getProductSectionLabels(product);
  if (sectionLabels.includes(selectedCollection)) {
    return true;
  }

  const labelFromKnownSlug = SECTION_NAME_BY_CATEGORY_SLUG[selectedCollection];
  if (labelFromKnownSlug && sectionLabels.includes(labelFromKnownSlug)) {
    return true;
  }

  return false;
}

export function isClientSideCollectionFilterValue(selectedCollection: string): boolean {
  return CLIENT_SIDE_COLLECTION_VALUES.has(selectedCollection);
}

export function resolveSectionLabelFromCollectionValue(
  selectedCollection: string
): string | null {
  if (selectedCollection === 'all') {
    return null;
  }

  if (SECTION_NAME_BY_CATEGORY_SLUG[selectedCollection]) {
    return SECTION_NAME_BY_CATEGORY_SLUG[selectedCollection];
  }

  if (Object.values(SECTION_NAME_BY_CATEGORY_SLUG).includes(selectedCollection)) {
    return selectedCollection;
  }

  return null;
}

export function getSectionLabel(product: CatalogProduct): string {
  return getProductSectionLabels(product)[0] ?? 'Classic';
}

export function getCategoryLabel(product: CatalogProduct, sectionTitle: string): string {
  const matchingCategory = product.categories.find((category) => {
    return (SECTION_NAME_BY_CATEGORY_SLUG[category.slug] ?? category.title) === sectionTitle;
  });

  return matchingCategory?.title?.trim() || sectionTitle;
}

export function getColorLabel(product: CatalogProduct): string {
  const explicitColor = product.colors?.find(
    (color) => typeof color === 'string' && color.trim().length > 0
  );
  if (explicitColor) return explicitColor;

  const source = `${product.title} ${product.slug}`;
  const matchedPattern = COLOR_PATTERNS.find(({ pattern }) => pattern.test(source));

  return matchedPattern?.label ?? 'Signature';
}

export function getSizeLabel(product: CatalogProduct): string {
  if (typeof product.sizeLabel === 'string' && product.sizeLabel.trim().length > 0) {
    return product.sizeLabel.trim();
  }

  const source = `${product.title} ${product.slug} ${product.skus.join(' ')}`;

  if (/compact|mini|small/i.test(source)) return 'Compact';
  if (/king|large|max/i.test(source)) return 'King Size';

  return 'King Size';
}

/** Variant size strings used for catalog size-picker and filters (not collection titles). */
export function getVariantSizeLabelsForCatalogFilter(product: CatalogProduct): string[] {
  const fromApi = product.sizeLabels?.filter((s) => typeof s === 'string' && s.trim().length > 0);
  if (fromApi && fromApi.length > 0) {
    return fromApi.map((s) => s.trim());
  }
  if (typeof product.sizeLabel === 'string' && product.sizeLabel.trim().length > 0) {
    return [product.sizeLabel.trim()];
  }
  return [];
}

/** True when variant data lists this size-catalog template id/title (admin sizes / collections). */
export function productAllowsSizeCatalogCategory(
  product: CatalogProduct,
  sizeCatalogCategoryId: string,
  sizeCatalogCategoryTitle?: string | null
): boolean {
  const idKey = sizeCatalogCategoryId.trim();
  const titleKey = (sizeCatalogCategoryTitle ?? '').trim().toLowerCase();

  const ids = product.sizeCatalogCategoryIds ?? [];
  const titles = product.sizeCatalogCategoryTitles ?? [];

  if (idKey && ids.includes(idKey)) {
    return true;
  }
  if (titleKey && titles.some((t) => t.trim().toLowerCase() === titleKey)) {
    return true;
  }
  /** Require explicit admin assignment on variants; do not treat “unset” as “all collections”. */
  return false;
}

/**
 * Published size-catalog categories/items relevant to the given products (size title + template category).
 */
export function filterSizeCatalogByProducts(
  categories: SizeCatalogCategoryDto[],
  products: CatalogProduct[]
): SizeCatalogCategoryDto[] {
  if (products.length === 0) {
    return categories;
  }
  const next = categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        products.some((product) => {
          const labels = getVariantSizeLabelsForCatalogFilter(product);
          if (labels.length === 0) {
            return false;
          }
          return (
            catalogItemTitleMatchesAnySizeLabel(item.title, labels) &&
            productAllowsSizeCatalogCategory(product, item.categoryId, item.categoryTitle)
          );
        })
      ),
    }))
    .filter((category) => category.items.length > 0);
  return sortSizeCatalogCategoriesByDisplayOrder(next.length > 0 ? next : categories);
}

/**
 * Whether the product should appear when filtering by storefront size (catalog band title, catalog item title, or variant label).
 * When `selectedSize` equals the size-catalog band title and `selectedSizeCatalogCategoryId` is set, all products in that template category match.
 * Otherwise, when `selectedSizeCatalogCategoryId` is set, variant label must match `selectedSize` and the product must allow that template category.
 */
export function productMatchesSizeFilter(
  product: CatalogProduct,
  selectedSize: string,
  selectedSizeCatalogCategoryId?: string | null,
  selectedSizeCatalogCategoryTitle?: string | null
): boolean {
  if (selectedSize === 'all') {
    return true;
  }
  const needle = selectedSize.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  const categoryKey = selectedSizeCatalogCategoryId?.trim() ?? '';
  const categoryTitleNorm = (selectedSizeCatalogCategoryTitle ?? '').trim().toLowerCase();

  /** URL `size` stores the size-catalog band title (e.g. Slims), not each pack template name. */
  if (categoryKey && categoryTitleNorm && needle === categoryTitleNorm) {
    return productAllowsSizeCatalogCategory(product, categoryKey, selectedSizeCatalogCategoryTitle);
  }

  const labels = getVariantSizeLabelsForCatalogFilter(product);
  if (!labels.some((s) => s.trim().toLowerCase() === needle)) {
    return false;
  }
  if (!categoryKey) {
    return true;
  }
  return productAllowsSizeCatalogCategory(product, categoryKey, selectedSizeCatalogCategoryTitle);
}

export function catalogItemTitleMatchesAnySizeLabel(
  catalogTitle: string,
  productSizeLabels: ReadonlyArray<string>
): boolean {
  const normalizedTitle = catalogTitle.trim().toLowerCase();
  if (!normalizedTitle) {
    return false;
  }
  return productSizeLabels.some((label) => label.trim().toLowerCase() === normalizedTitle);
}

/** Same count as `ITEMS_PER_SECTION_PAGE` on the products catalog (one horizontal row page). */
export const CATALOG_SECTION_PAGE_SIZE = 6;

/** Keeps hero vertical alignment uniform across catalog cards. */
export function shouldNudgeCatalogProductImage(index: number): boolean {
  void index;
  return false;
}
