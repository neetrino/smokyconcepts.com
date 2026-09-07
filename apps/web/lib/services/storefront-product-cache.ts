import { unstable_cache } from 'next/cache';
import { productsService } from '@/lib/services/products.service';
import { CATALOG_PRODUCTS_FETCH_LIMIT } from '@/lib/constants/products-catalog.constants';

/** Shared with page `revalidate` — product/catalog payloads stay warm for a minute. */
const PRODUCT_DATA_REVALIDATE_SECONDS = 60;

/**
 * Cached PDP payload — page may still be dynamic (cookies), but DB work is cached.
 */
export const getCachedProductBySlug = unstable_cache(
  async (slug: string, lang: string) => productsService.findBySlug(slug, lang),
  ['storefront-product-by-slug'],
  {
    revalidate: PRODUCT_DATA_REVALIDATE_SECONDS,
    tags: ['products'],
  }
);

/**
 * Cached catalog list used by `/products` SSR.
 */
export const getCachedCatalogProducts = unstable_cache(
  async (lang: string, search: string | undefined, category: string | undefined) =>
    productsService.findAll({
      page: 1,
      limit: CATALOG_PRODUCTS_FETCH_LIMIT,
      lang,
      search: search?.trim() || undefined,
      category: category?.trim() || undefined,
    }),
  ['storefront-catalog-products'],
  {
    revalidate: PRODUCT_DATA_REVALIDATE_SECONDS,
    tags: ['products'],
  }
);
