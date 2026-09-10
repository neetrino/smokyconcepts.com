import { cache } from 'react';
import { revalidateTag } from 'next/cache';
import { getHomeHeroSlidesForStorefront } from '@/lib/services/home-hero.service';

export const HOME_HERO_CACHE_TAG = 'home-hero';

/**
 * Hero slides for the homepage. Deduped only within a single request so the first
 * visit cannot serve a stale `unstable_cache` payload of deleted default art.
 */
export const getCachedHomeHeroSlides = cache(getHomeHeroSlidesForStorefront);

/** Admin hero-settings writes must expire any leftover tagged cache immediately. */
export function revalidateHomeHeroCache(): void {
  revalidateTag(HOME_HERO_CACHE_TAG, 'max');
}
