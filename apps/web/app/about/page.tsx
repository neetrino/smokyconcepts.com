import { AboutContent } from './AboutContent';

export const revalidate = 90;

/**
 * About Us page (server segment with 90s cache; content is client for i18n/carousel).
 */
export default function AboutPage() {
  return <AboutContent />;
}
