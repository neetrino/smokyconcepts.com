import { HomePageContent } from '../components/home/HomePageContent';
import type { HomeCoverCollectionItem } from '../components/home/homePage.types';
import { getCachedHomeCollections } from '../lib/services/storefront-category-cache';
import { getCachedHomeHeroSlides } from '../lib/services/storefront-home-cache';

/**
 * Hero and collections must reflect admin/DB changes on the first visit
 * (avoid stale SSG / stale-while-revalidate on Vercel).
 */
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [rawCoverCollections, heroSlides] = await Promise.all([
    getCachedHomeCollections(),
    getCachedHomeHeroSlides(),
  ]);
  const coverCollections: HomeCoverCollectionItem[] = rawCoverCollections
    .filter((item): item is NonNullable<(typeof rawCoverCollections)[number]> => item !== null)
    .map((item) => ({
      title: item.title,
      slug: item.slug,
      imageSrc: item.imageSrc,
    }));

  return <HomePageContent coverCollections={coverCollections} heroSlides={heroSlides} />;
}

