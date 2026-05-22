'use client';

import { CoverCollectionProductCard } from './CoverCollectionProductCard';
import { HomeSectionTitle } from './HomeSectionTitle';
import type { HomeCoverCollectionItem } from './homePage.types';
import {
  COVER_COLLECTIONS_MOBILE_GRID_GAP_X_CLASS,
  COVER_COLLECTIONS_MOBILE_GRID_GAP_Y_CLASS,
  COVER_COLLECTIONS_MOBILE_GRID_MARGIN_TOP_CLASS,
  COVER_COLLECTIONS_MOBILE_SECTION_GAP_CLASS,
} from './upcomingLinesLayout.constants';
import { useTranslation } from '@/lib/i18n-client';

interface HomeCoverCollectionsSectionProps {
  coverCollections: HomeCoverCollectionItem[];
}

export function HomeCoverCollectionsSection({ coverCollections }: HomeCoverCollectionsSectionProps) {
  const { t } = useTranslation();

  if (coverCollections.length === 0) {
    return null;
  }

  return (
    <section
      className={`flex flex-col gap-8 overflow-visible pt-3 sm:gap-10 sm:pt-6 ${COVER_COLLECTIONS_MOBILE_SECTION_GAP_CLASS}`}
    >
      <HomeSectionTitle
        title={t('home.homepage.coverCollections.title')}
        className="-translate-y-10 sm:-translate-y-4 lg:-translate-y-6"
      />
      <div
        className={`mt-4 grid w-full min-w-0 auto-rows-fr grid-cols-[repeat(2,minmax(0,1fr))] items-stretch justify-items-stretch gap-x-2 gap-y-16 overflow-visible sm:mt-0 sm:grid-cols-4 sm:items-start sm:gap-8 ${COVER_COLLECTIONS_MOBILE_GRID_MARGIN_TOP_CLASS} ${COVER_COLLECTIONS_MOBILE_GRID_GAP_X_CLASS} ${COVER_COLLECTIONS_MOBILE_GRID_GAP_Y_CLASS}`}
      >
        {coverCollections.map((item) => (
          <CoverCollectionProductCard key={item.slug} item={item} />
        ))}
      </div>
    </section>
  );
}
