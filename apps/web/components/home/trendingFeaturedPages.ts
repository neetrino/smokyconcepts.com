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

/** Build category pages without cross-category filler products (max 3 items per category page). */
export function buildTrendingPages(items: CatalogProduct[]): TrendingPage[] {
  if (items.length === 0) {
    return [];
  }

  const itemsByCategory = new Map<string, CatalogProduct[]>();
  for (const product of items) {
    const section = getSectionLabel(product);
    const rawLabel = getCategoryLabel(product, section);
    const categoryLabel = rawLabel && rawLabel !== 'Featured' ? rawLabel : section || 'Featured';
    if (!itemsByCategory.has(categoryLabel)) {
      itemsByCategory.set(categoryLabel, []);
    }
    itemsByCategory.get(categoryLabel)!.push(product);
  }

  const pages: TrendingPage[] = [];
  let pageIndex = 0;

  for (const [categoryLabel, categoryItems] of itemsByCategory.entries()) {
    for (let itemIndex = 0; itemIndex < categoryItems.length; itemIndex += ITEMS_PER_PAGE) {
      pages.push({
        key: `trending-page-${pageIndex}`,
        items: categoryItems.slice(itemIndex, itemIndex + ITEMS_PER_PAGE),
        categoryLabel,
      });
      pageIndex += 1;
    }
  }

  return pages;
}

export { PLACEHOLDER_IMAGE };
