import { unstable_cache } from 'next/cache';
import { CATEGORIES_CACHE_TAG } from '@/lib/services/storefront-category-cache';
import { adminCategoriesService } from './admin-categories.service';

/** Same window as the storefront category caches. */
const ADMIN_CATEGORY_LIST_REVALIDATE_SECONDS = 60;

/**
 * The admin category list is refetched on mount by the products, categories,
 * quick-settings and product-form screens, so every navigation paid a Postgres
 * round-trip for data that only changes on an explicit admin write.
 *
 * Shares `CATEGORIES_CACHE_TAG`, so the existing `revalidateCategoriesCache()`
 * call in every category mutation purges this entry too — admin edits stay
 * immediately visible.
 */
export const getCachedAdminCategories = unstable_cache(
  async () => adminCategoriesService.getCategories(),
  ['admin-category-list'],
  {
    revalidate: ADMIN_CATEGORY_LIST_REVALIDATE_SECONDS,
    tags: [CATEGORIES_CACHE_TAG],
  }
);
