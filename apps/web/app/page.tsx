import { HomePageContent } from '../components/home/HomePageContent';
import type { HomeCoverCollectionItem } from '../components/home/homePage.types';
import { categoriesService } from '../lib/services/categories.service';
import { getHomeHeroSlidesForStorefront } from '../lib/services/home-hero.service';

export default async function HomePage() {
  const [rawCoverCollections, heroSlides] = await Promise.all([
    categoriesService.getHomeCollections(),
    getHomeHeroSlidesForStorefront(),
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

