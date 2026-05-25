'use client';

import { HomeActionButton } from './HomeActionButton';
import { HomeSectionTitle } from './HomeSectionTitle';
import { UPCOMING_SHOP_BUTTON_CLASS_NAME } from './upcomingProducts.constants';
import { useTranslation } from '@/lib/i18n-client';

export function UpcomingSectionHeader() {
  const { t } = useTranslation();

  return (
    <div className="relative z-30 flex w-full min-w-0 items-center justify-between gap-3 max-sm:min-h-0 sm:min-h-[4rem] sm:justify-end xl:relative">
      <div className="min-w-0 flex-1 sm:absolute sm:left-1/2 sm:top-1/2 sm:w-max sm:max-w-[min(100%,calc(100%-7rem))] sm:-translate-x-[calc(50%+3.5rem)] sm:-translate-y-[46%]">
        <HomeSectionTitle
          title={t('home.homepage.upcoming.title')}
          centered={false}
          className="gap-0 items-start text-left sm:items-center sm:text-center [&_h2]:text-left sm:[&_h2]:text-center"
          titleClassName="sm:relative sm:top-10"
        />
      </div>
      <HomeActionButton
        href="/products"
        label={t('home.homepage.upcoming.shopCta')}
        variant="outline"
        className={UPCOMING_SHOP_BUTTON_CLASS_NAME}
      />
    </div>
  );
}
