import { revalidateTag, unstable_cache } from 'next/cache';
import { categoriesService } from '@/lib/services/categories.service';

/** Same window as the product caches — category reads stay warm for a minute. */
const CATEGORY_DATA_REVALIDATE_SECONDS = 60;

export const CATEGORIES_CACHE_TAG = 'categories';

/**
 * Cover collections for the homepage. The page itself stays dynamic; only the DB
 * round-trip is cached, so every navigation to `/` no longer waits on Postgres.
 */
export const getCachedHomeCollections = unstable_cache(
  async () => categoriesService.getHomeCollections(),
  ['storefront-home-collections'],
  {
    revalidate: CATEGORY_DATA_REVALIDATE_SECONDS,
    tags: [CATEGORIES_CACHE_TAG],
  }
);

/**
 * Category tree used by the public `/api/v1/categories/tree` endpoint. Route handlers
 * are never cached by Next, so the DB work is cached here instead.
 */
export const getCachedCategoryTree = unstable_cache(
  async (lang: string) => categoriesService.getTree(lang),
  ['storefront-category-tree'],
  {
    revalidate: CATEGORY_DATA_REVALIDATE_SECONDS,
    tags: [CATEGORIES_CACHE_TAG],
  }
);

/** Admin category writes must surface on the storefront immediately, as before caching. */
export function revalidateCategoriesCache(): void {
  // @ts-expect-error - revalidateTag type issue in Next.js (same call style as product cache purges)
  revalidateTag(CATEGORIES_CACHE_TAG);
}
