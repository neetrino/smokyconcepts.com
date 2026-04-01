import type { CatalogProductCardItem } from './ProductsCatalogCard';

const SECTION_NAME_BY_CATEGORY_SLUG: Record<string, string> = {
  classic: 'Classic',
  'special-edition': 'Special',
  atelier: 'Atelier',
  premium: 'Premium',
};

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
  };
}

export function getProductSectionLabels(product: CatalogProduct): string[] {
  const labels = product.categories
    .map((category) => SECTION_NAME_BY_CATEGORY_SLUG[category.slug] ?? category.title)
    .filter((label): label is string => Boolean(label?.trim()));

  if (labels.length === 0) {
    return ['Classic'];
  }

  return Array.from(new Set(labels));
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
  const source = `${product.title} ${product.slug} ${product.skus.join(' ')}`;

  if (/compact|mini|small/i.test(source)) return 'Compact';
  if (/king|large|max/i.test(source)) return 'King Size';

  return 'King Size';
}

/** Same count as `ITEMS_PER_SECTION_PAGE` on the products catalog (one horizontal row page). */
export const CATALOG_SECTION_PAGE_SIZE = 6;

/** Image nudge on positions 2 and 5 within each group of six — matches catalog sections. */
export function shouldNudgeCatalogProductImage(index: number): boolean {
  const positionInRow = (index % CATALOG_SECTION_PAGE_SIZE) + 1;
  return positionInRow === 2 || positionInRow === 5;
}
