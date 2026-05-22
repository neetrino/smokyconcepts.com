'use client';

import Image from 'next/image';
import Link from 'next/link';

import { HOME_ASSET_PATHS } from './homePage.data';
import { useTranslation } from '@/lib/i18n-client';

export function HomeBringingSection() {
  const { t } = useTranslation();

  return (
    <section className="grid gap-y-6 sm:gap-y-8 lg:gap-x-2 lg:grid-cols-[minmax(0,1.28fr)_minmax(30rem,33.5rem)_minmax(0,1.28fr)]">
      <div className="relative min-h-[20.5rem] overflow-hidden rounded-t-[2rem] rounded-b-[1rem] sm:min-h-[32rem] sm:rounded-[2rem] lg:rounded-r-[0.625rem]">
        <Image src={HOME_ASSET_PATHS.craftTools} alt={t('home.homepage.bringing.imageAltLeft')} fill className="object-cover object-left" sizes="472px" />
      </div>
      <div className="flex h-full min-h-[23rem] flex-col bg-white px-5 py-7 shadow-[0_8px_30px_rgba(18,42,38,0.08)] sm:min-h-[32rem] sm:px-8 sm:py-9 lg:px-9 rounded-[1.5rem] sm:rounded-[1rem]">
        <h2 className="max-w-[20rem] whitespace-pre-line text-[1.82rem] font-black leading-[1.04] tracking-[-0.01em] text-[#434347] sm:text-[2.4rem]">
          {t('home.homepage.bringing.title')}
        </h2>
        <div className="mt-5 space-y-4 text-[0.84rem] font-semibold leading-[1.48] text-[#434347] sm:mt-7 sm:space-y-5 sm:text-[0.95rem] sm:leading-[1.48] lg:text-[1rem]">
          <p>{t('home.homepage.bringing.paragraphs.first')}</p>
          <p>{t('home.homepage.bringing.paragraphs.second')}</p>
          <p>{t('home.homepage.bringing.paragraphs.third')}</p>
          <p>
            {t('home.homepage.bringing.paragraphs.fourthPrefix')}{' '}
            <Link
              href="/about"
              className="text-[#dcc090] underline-offset-2 transition-opacity hover:opacity-90 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcc090]"
            >
              {t('home.homepage.bringing.moreLabel')}
            </Link>
          </p>
          <p>{t('home.homepage.bringing.paragraphs.fifth')}</p>
        </div>
      </div>
      <div className="relative hidden min-h-[20.5rem] overflow-hidden rounded-t-[2rem] rounded-b-[1rem] sm:min-h-[32rem] sm:rounded-[2rem] lg:block lg:rounded-l-[0.625rem]">
        <Image src={HOME_ASSET_PATHS.craftTools} alt={t('home.homepage.bringing.imageAltRight')} fill className="object-cover object-right" sizes="472px" />
      </div>
    </section>
  );
}
