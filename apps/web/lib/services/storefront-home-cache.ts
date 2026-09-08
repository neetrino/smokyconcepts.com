import { revalidateTag, unstable_cache } from 'next/cache';
import { getHomeHeroSlidesForStorefront } from '@/lib/services/home-hero.service';

/** Same window as the product/category caches — homepage reads stay warm for a minute. */
const HOME_DATA_REVALIDATE_SECONDS = 60;

export const HOME_HERO_CACHE_TAG = 'home-hero';

/**
 * Hero slides for the homepage. The page itself stays dynamic; only the settings
 * read is cached, so every navigation to `/` no longer waits on Postgres.
 */
export const getCachedHomeHeroSlides = unstable_cache(
  async () => getHomeHeroSlidesForStorefront(),
  ['storefront-home-hero'],
  {
    revalidate: HOME_DATA_REVALIDATE_SECONDS,
    tags: [HOME_HERO_CACHE_TAG],
  }
);

/** Admin hero-settings writes must surface on the homepage immediately, as before caching. */
export function revalidateHomeHeroCache(): void {
  // @ts-expect-error - revalidateTag type issue in Next.js (same call style as product cache purges)
  revalidateTag(HOME_HERO_CACHE_TAG);
}
