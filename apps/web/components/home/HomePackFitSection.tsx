'use client';

import { HomeActionButton } from './HomeActionButton';
import { HomeSectionTitle } from './HomeSectionTitle';
import { PackFitCard } from './PackFitCard';
import { PACK_FIT_ITEMS } from './homePage.data';
import { getProductsPathWithSelectSizeAutopen } from '@/lib/constants/products-catalog.constants';
import { useTranslation } from '@/lib/i18n-client';

const PACK_FIT_KEY_BY_INDEX = ['ultraSlims', 'compact', 'superSlims', 'slims', 'kingSize', 'sticks'] as const;

export function HomePackFitSection() {
  const { t } = useTranslation();

  return (
    <section className="-mt-10 flex flex-col gap-8 pb-8 sm:mt-1 sm:gap-10 sm:pb-10">
      <HomeSectionTitle
        title={t('home.homepage.packFit.title')}
        description={t('home.homepage.packFit.description')}
      />
      <div className="sm:hidden">
        <div className="-mx-5 overflow-x-auto px-5 pb-2 scrollbar-hide">
          <div className="flex min-w-max snap-x snap-mandatory items-end gap-x-0.5">
            {PACK_FIT_ITEMS.map((item, index) => (
              <PackFitCard
                key={item.title}
                {...item}
                title={t(`home.homepage.packFit.items.${PACK_FIT_KEY_BY_INDEX[index]}.title`)}
                subtitle={t(`home.homepage.packFit.items.${PACK_FIT_KEY_BY_INDEX[index]}.subtitle`)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="hidden flex-wrap items-end justify-center gap-x-6 gap-y-6 sm:flex">
        {PACK_FIT_ITEMS.map((item, index) => (
          <PackFitCard
            key={item.title}
            {...item}
            title={t(`home.homepage.packFit.items.${PACK_FIT_KEY_BY_INDEX[index]}.title`)}
            subtitle={t(`home.homepage.packFit.items.${PACK_FIT_KEY_BY_INDEX[index]}.subtitle`)}
          />
        ))}
      </div>
      <div className="flex justify-center pt-1 sm:pt-2">
        <HomeActionButton
          href={getProductsPathWithSelectSizeAutopen()}
          label={t('home.homepage.packFit.cta')}
          className="min-w-[19rem] text-[1.2rem] font-black text-[#0f201d] sm:text-base"
        />
      </div>
    </section>
  );
}
