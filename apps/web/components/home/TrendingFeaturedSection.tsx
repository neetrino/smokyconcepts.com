'use client';

import { useMemo } from 'react';

import { HomeActionButton } from './HomeActionButton';
import { HomeSectionTitle } from './HomeSectionTitle';
import { TrendingCoverflowTrack } from './TrendingCoverflowTrack';
import {
  TrendingFeaturedEmptyState,
  TrendingFeaturedErrorState,
  TrendingFeaturedLoadingState,
} from './TrendingFeaturedSectionStates';
import { TrendingPageSlider } from './TrendingPageSlider';
import { buildTrendingPages } from './trendingFeaturedPages';
import { useTrendingCarouselNavigation } from './useTrendingCarouselNavigation';
import { useTrendingFeaturedProducts } from './useTrendingFeaturedProducts';
import { useTrendingXlBreakpoint } from './useTrendingXlBreakpoint';
import { useTranslation } from '@/lib/i18n-client';

/**
 * Trending section that displays featured (favorite) products from API.
 * Coverflow: previous category cluster on the left (faded), focal cluster centered,
 * next on the right — slides with arrows on all breakpoints; `xl` uses wide cards,
 * below `xl` keeps the compact staggered mobile card layout.
 */
export function TrendingFeaturedSection() {
  const { t } = useTranslation();
  const isXl = useTrendingXlBreakpoint();
  const { items, loading, error, fetchFeatured } = useTrendingFeaturedProducts();
  const pages = useMemo(() => buildTrendingPages(items), [items]);
  const navigation = useTrendingCarouselNavigation(pages, items.length);

  if (error) {
    return <TrendingFeaturedErrorState error={error} onRetry={fetchFeatured} />;
  }

  if (loading) {
    return <TrendingFeaturedLoadingState />;
  }

  if (items.length === 0) {
    return <TrendingFeaturedEmptyState />;
  }

  return (
    <section className="relative isolate flex min-w-0 flex-col gap-3 overflow-x-clip overflow-y-visible pb-6 max-sm:overflow-x-visible sm:gap-8 xl:left-1/2 xl:w-screen xl:max-w-none xl:-translate-x-1/2 xl:gap-5">
      <div className="relative z-30 flex min-w-0 items-center justify-between gap-3 max-sm:min-h-0 sm:min-h-[4rem] xl:relative xl:z-20 xl:-translate-y-1 xl:justify-center">
        <HomeSectionTitle
          title={t('home.homepage.trending.title')}
          centered={false}
          className="gap-0 xl:items-center xl:text-center"
          titleClassName="xl:whitespace-nowrap"
        />
        <HomeActionButton
          href="/products"
          label={t('home.homepage.trending.shopCta')}
          variant="outline"
          className="!w-fit !min-h-8 !translate-y-0 !rounded-[0.5rem] !border-[2.5px] !border-[#dcc090] !px-2.5 !py-2 !text-[0.75rem] !font-black !uppercase !leading-tight !tracking-[0.07em] sm:!w-auto sm:!min-h-9 sm:!translate-y-0 sm:!rounded-[0.5rem] sm:!border-[2.5px] sm:!border-[#dcc090] sm:!px-5 sm:!py-0 sm:!text-[0.75rem] sm:!font-black sm:!leading-tight sm:!tracking-[0.14em] xl:absolute xl:!top-[46%] xl:right-[7.5rem] xl:z-30 xl:!-translate-y-1/2"
        />
      </div>

      <TrendingCoverflowTrack
        pages={pages}
        currentDisplayIndex={navigation.safeDisplayIndex}
        currentLogicalIndex={navigation.safeCurrent}
        suppressTransition={navigation.suppressTransition}
        isXl={isXl}
      />

      <TrendingPageSlider
        prevLabel={navigation.prevLabel}
        currentLabel={navigation.currentLabel}
        nextLabel={navigation.nextLabel}
        onPrev={navigation.goPrev}
        onNext={navigation.goNext}
        disabled={!navigation.hasMultiplePages}
        prevAria={t('home.homepage.trending.previousAria')}
        nextAria={t('home.homepage.trending.nextAria')}
      />
    </section>
  );
}
