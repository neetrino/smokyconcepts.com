'use client';

import { HomeActionButton } from './HomeActionButton';
import { HomeSectionTitle } from './HomeSectionTitle';
import { useTranslation } from '@/lib/i18n-client';

export function HomeSayHiSection() {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col items-center gap-8">
      <HomeSectionTitle
        title={t('home.homepage.sayHi.title')}
        description={t('home.homepage.sayHi.description')}
      />
      <HomeActionButton
        href="/contact"
        label={t('home.homepage.sayHi.cta')}
        className="min-w-[13.75rem] !min-h-11 sm:!min-h-12 !rounded-[0.55rem] !px-7 !text-[1.08rem] !font-bold !tracking-[0.14em] sm:!text-[1.12rem] sm:!font-extrabold sm:!tracking-[0.16em]"
      />
    </section>
  );
}
