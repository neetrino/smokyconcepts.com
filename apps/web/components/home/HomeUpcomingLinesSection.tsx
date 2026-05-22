'use client';

import { useCallback, useMemo } from 'react';

import { HomeActionButton } from './HomeActionButton';
import { HomeSectionTitle } from './HomeSectionTitle';
import { UPCOMING_LINES } from './homePage.data';
import { UpcomingLineCard } from './UpcomingLineCard';
import type { UpcomingLineMasonryTile } from './UpcomingLineCard';
import {
  MASONRY_ROW1_LEFT,
  MASONRY_ROW1_RIGHT,
  MASONRY_ROW2_LEFT,
  MASONRY_ROW2_RIGHT,
  MASONRY_ROW3_LEFT,
  MASONRY_ROW3_RIGHT,
  UPCOMING_LINES_MASONRY_ROW_CLASS,
  UPCOMING_LINES_MASONRY_ROW3_CLASS,
  UPCOMING_LINES_MASONRY_STACK_CLASS,
} from './upcomingLinesLayout.constants';
import { useTranslation } from '@/lib/i18n-client';

const UPCOMING_LINE_KEY_BY_TITLE: Record<string, string> = {
  Notebooks: 'notebooks',
  Knifes: 'knifes',
  Phones: 'phones',
  Wallets: 'wallets',
  Documents: 'documents',
  Keys: 'keys',
};

const EMPHASIZED_UPCOMING_TITLES = new Set(['Notebooks', 'Knifes', 'Phones', 'Keys', 'Wallets']);

export function HomeUpcomingLinesSection() {
  const { t } = useTranslation();

  const upcomingLineByTitle = useMemo(
    () => Object.fromEntries(UPCOMING_LINES.map((it) => [it.title, it])),
    [],
  );

  const renderUpcomingLineCard = useCallback(
    (lineTitle: string, options?: { masonryTile?: UpcomingLineMasonryTile }) => {
      const item = upcomingLineByTitle[lineTitle];
      if (!item) {
        return null;
      }

      return (
        <UpcomingLineCard
          {...item}
          emphasizeImage={EMPHASIZED_UPCOMING_TITLES.has(item.title)}
          imageNudgeDown={item.title === 'Notebooks'}
          imageKeysLayout={item.title === 'Keys'}
          imagePhonesLayout={item.title === 'Phones'}
          imageKnifesLayout={item.title === 'Knifes'}
          imageDocumentsLayout={item.title === 'Documents'}
          imageWalletsLayout={item.title === 'Wallets'}
          title={t(`home.homepage.upcomingLines.cards.${UPCOMING_LINE_KEY_BY_TITLE[item.title] ?? 'documents'}`)}
          masonryTile={options?.masonryTile}
        />
      );
    },
    [t, upcomingLineByTitle],
  );

  return (
    <section className="grid gap-8 overflow-visible sm:gap-10 xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
      <div className="flex flex-col justify-start gap-6 pt-5 sm:gap-8 sm:pt-7 xl:pt-12">
        <HomeSectionTitle
          title={t('home.homepage.upcomingLines.title')}
          description={t('home.homepage.upcomingLines.description')}
          descriptionMobile={t('home.homepage.upcomingLines.descriptionMobile')}
          centerOnMobileOnly
          className="gap-4 sm:gap-5 [&_h2]:text-[2.125rem] [&_h2]:leading-[1.18] [&_h2]:sm:text-6xl [&_p]:text-sm [&_p]:sm:text-base [&_p]:leading-relaxed"
        />
        <HomeActionButton
          href="/contact"
          label={t('home.homepage.upcomingLines.cta')}
          className="mx-auto hidden w-fit !rounded-[0.55rem] !px-7 !text-[1.08rem] !font-bold !tracking-[0.14em] sm:mx-0 sm:inline-flex sm:!text-[1.12rem] sm:!font-extrabold sm:!tracking-[0.16em]"
        />
      </div>
      <div className="overflow-visible pt-3 sm:pt-10">
        <div className={UPCOMING_LINES_MASONRY_STACK_CLASS}>
          <div className={`${UPCOMING_LINES_MASONRY_ROW_CLASS} items-start`}>
            <div className={MASONRY_ROW1_LEFT}>
              {renderUpcomingLineCard('Phones', { masonryTile: 'phones' })}
            </div>
            <div className={MASONRY_ROW1_RIGHT}>
              {renderUpcomingLineCard('Notebooks', { masonryTile: 'notebooks' })}
            </div>
          </div>
          <div className={`${UPCOMING_LINES_MASONRY_ROW_CLASS} items-start`}>
            <div className={MASONRY_ROW2_LEFT}>
              {renderUpcomingLineCard('Knifes', { masonryTile: 'knifes' })}
            </div>
            <div className={MASONRY_ROW2_RIGHT}>
              {renderUpcomingLineCard('Keys', { masonryTile: 'keys' })}
            </div>
          </div>
          <div className={UPCOMING_LINES_MASONRY_ROW3_CLASS}>
            <div className={MASONRY_ROW3_LEFT}>
              {renderUpcomingLineCard('Documents', { masonryTile: 'documents' })}
            </div>
            <div className={MASONRY_ROW3_RIGHT}>
              {renderUpcomingLineCard('Wallets', { masonryTile: 'wallets' })}
            </div>
          </div>
        </div>
        <div className="hidden xl:grid xl:h-[23.5rem] xl:w-full xl:grid-cols-3 xl:gap-x-3 2xl:h-[27.5rem] 2xl:gap-x-4">
          <div className="grid h-full xl:[grid-template-rows:350fr_32fr_186fr]">
            {renderUpcomingLineCard('Notebooks')}
            <div aria-hidden="true" />
            {renderUpcomingLineCard('Wallets')}
          </div>
          <div className="grid h-full xl:[grid-template-rows:234fr_32fr_302fr]">
            {renderUpcomingLineCard('Knifes')}
            <div aria-hidden="true" />
            {renderUpcomingLineCard('Documents')}
          </div>
          <div className="grid h-full xl:[grid-template-rows:350fr_32fr_186fr]">
            {renderUpcomingLineCard('Phones')}
            <div aria-hidden="true" />
            {renderUpcomingLineCard('Keys')}
          </div>
        </div>
      </div>
      {/* Keep CTA inside section so parent `gap-[140px]` does not insert ~140px between cards and button (<sm). */}
      <div className="flex justify-center sm:hidden">
        <HomeActionButton
          href="/contact"
          label={t('home.homepage.upcomingLines.cta')}
          className="w-fit !rounded-[0.55rem] !px-7 !text-[1.08rem] !font-bold !tracking-[0.14em] sm:!text-[1.12rem] sm:!font-extrabold sm:!tracking-[0.16em]"
        />
      </div>
    </section>
  );
}
