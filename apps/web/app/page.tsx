import { HomePageContent } from '../components/home/HomePageContent';
import { categoriesService } from '../lib/services/categories.service';

export default async function HomePage() {
  const coverCollections = await categoriesService.getHomeCollections();

  return <HomePageContent coverCollections={coverCollections} />;
}

