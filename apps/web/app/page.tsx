import { HomePageContent } from '../components/home/HomePageContent';
import { categoriesService } from '../lib/services/categories.service';
import { getHomeHeroSlidesForStorefront } from '../lib/services/home-hero.service';

export default async function HomePage() {
  const [coverCollections, heroSlides] = await Promise.all([
    categoriesService.getHomeCollections(),
    getHomeHeroSlidesForStorefront(),
  ]);

  return <HomePageContent coverCollections={coverCollections} heroSlides={heroSlides} />;
}

