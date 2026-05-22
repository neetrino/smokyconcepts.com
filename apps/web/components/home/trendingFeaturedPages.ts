import {
  getCategoryLabel,
  getSectionLabel,
  toCatalogProduct,
  type CatalogProduct,
} from '../../app/products/components/catalogProductLabels';
import { HOME_ASSET_PATHS } from './homePage.data';
import { ITEMS_PER_PAGE } from './trendingFeatured.constants';
import type { ApiProduct, TrendingPage } from './trendingFeatured.types';

const PLACEHOLDER_IMAGE = HOME_ASSET_PATHS.packMark;

export function mapApiProductToCatalogProduct(product: ApiProduct): CatalogProduct {
  const base = toCatalogProduct({
    id: product.id,
    slug: product.slug,
    title: product.title,
    price: product.price ?? 0,
    image: product.image,
    images: product.images,
    inStock: product.inStock,
    originalPrice: product.originalPrice ?? null,
    defaultVariantId: product.defaultVariantId ?? null,
    defaultVariantStock: product.defaultVariantStock ?? 0,
    defaultSku: product.defaultSku ?? '',
    categories: product.categories,
    skus: product.skus,
    colors: product.colors,
  });
  if (!base.image && (base.images?.length ?? 0) === 0) {
    return { ...base, image: PLACEHOLDER_IMAGE };
  }
  return base;
}

/** Group items by category label so same-category items become one page. */
export function groupCatalogByCategory(products: CatalogProduct[]): CatalogProduct[] {
  const byCategory = new Map<string, CatalogProduct[]>();
  for (const product of products) {
    const section = getSectionLabel(product);
    const key = getCategoryLabel(product, section) || 'Other';
    if (!byCategory.has(key)) {
      byCategory.set(key, []);
    }
    byCategory.get(key)!.push(product);
  }
  const result: CatalogProduct[] = [];
  byCategory.forEach((group) => result.push(...group));
  return result;
}

/** Slice catalog into 3-card pages; pad short tail by wrapping so each page always has 3 cards. */
export function buildTrendingPages(items: CatalogProduct[]): TrendingPage[] {
  if (items.length === 0) {
    return [];
  }
  const pages: TrendingPage[] = [];
  for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
    const slice = items.slice(i, i + ITEMS_PER_PAGE);
    while (slice.length < ITEMS_PER_PAGE) {
      slice.push(items[slice.length % items.length]);
    }
    const anchor = slice[1] ?? slice[0];
    const section = anchor ? getSectionLabel(anchor) : '';
    const rawLabel = anchor ? getCategoryLabel(anchor, section) : '';
    const categoryLabel = rawLabel && rawLabel !== 'Featured' ? rawLabel : section || 'Featured';
    pages.push({ key: `trending-page-${i}`, items: slice, categoryLabel });
  }
  return pages;
}

export { PLACEHOLDER_IMAGE };
