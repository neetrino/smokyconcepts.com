'use client';

import { CultureVotingSection } from './CultureVotingSection';
import { HomeBehindCreationSection } from './HomeBehindCreationSection';
import { HomeBringingSection } from './HomeBringingSection';
import { HomeCoverCollectionsSection } from './HomeCoverCollectionsSection';
import { HomeHeroSection } from './HomeHeroSection';
import { HomePackFitSection } from './HomePackFitSection';
import { HomeRitualSection } from './HomeRitualSection';
import { HomeSayHiSection } from './HomeSayHiSection';
import { HomeSectionTitle } from './HomeSectionTitle';
import { HomeUpcomingLinesSection } from './HomeUpcomingLinesSection';
import { TrendingFeaturedSection } from './TrendingFeaturedSection';
import type { HomeCoverCollectionItem } from './homePage.types';
import type { HomeHeroSlide } from '@/lib/types/home-hero.types';
import { UpcomingProductsSection } from '@/components/home/UpcomingProductsSection';
import { useTranslation } from '@/lib/i18n-client';

/**
 * Full static homepage assembled from Figma-derived assets.
 */
interface HomePageContentProps {
  coverCollections: HomeCoverCollectionItem[];
  heroSlides: HomeHeroSlide[];
}

export function HomePageContent({ coverCollections, heroSlides }: HomePageContentProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-hidden overflow-y-hidden bg-[#efefef] text-[#414141]">
      <div className="mx-auto flex max-w-[120rem] flex-col gap-[140px] overflow-x-hidden overflow-y-hidden px-5 pb-20 pt-8 sm:px-8 sm:pb-24 sm:pt-10 lg:px-[7.5rem]">
        <section className="flex flex-col gap-4 sm:gap-5">
          <HomeSectionTitle
            title={t('home.homepage.hero.title')}
            titleMobile={t('home.homepage.hero.titleMobile')}
            descriptionEmphasis={{
              lead: t('home.homepage.hero.tagline.lead'),
              bold1: t('home.homepage.hero.tagline.bold1'),
              mid: t('home.homepage.hero.tagline.mid'),
              bold2: t('home.homepage.hero.tagline.bold2'),
              tail: t('home.homepage.hero.tagline.tail'),
            }}
          />
          <HomeHeroSection slides={heroSlides} />
        </section>

        <HomePackFitSection />

        <HomeCoverCollectionsSection coverCollections={coverCollections} />

        <HomeRitualSection />

        <div className="sm:mt-16">
          <TrendingFeaturedSection />
        </div>

        <HomeBringingSection />

        <UpcomingProductsSection />

        <HomeBehindCreationSection />

        <CultureVotingSection />

        <HomeUpcomingLinesSection />

        <HomeSayHiSection />
      </div>
    </div>
  );
}
