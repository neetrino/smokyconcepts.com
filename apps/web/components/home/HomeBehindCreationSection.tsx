'use client';

import Image from 'next/image';

import { HomeActionButton } from './HomeActionButton';
import { HomeSectionTitle } from './HomeSectionTitle';
import { useTranslation } from '@/lib/i18n-client';

export function HomeBehindCreationSection() {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-6 sm:gap-7">
      <div className="mx-auto w-full max-w-4xl">
        <HomeSectionTitle
          title={t('home.homepage.behindCreation.title')}
          description={t('home.homepage.behindCreation.description')}
          className="gap-3 [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_p]:text-sm [&_p]:sm:text-base"
        />
        <div className="relative mt-4 sm:mt-5">
          <div className="overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
            <div className="relative h-[170.812px] sm:h-[26rem] lg:h-[28rem]">
              <Image
                src="/assets/home/concepts/behind-creation.webp"
                alt={t('home.homepage.behindCreation.imageAlt')}
                fill
                className="object-cover object-[58%_center] sm:object-center"
                sizes="(max-width: 896px) 100vw, 896px"
              />
              <div className="absolute inset-0 bg-black/15" />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              className="pointer-events-auto flex min-h-[3.4rem] min-w-[3.4rem] translate-x-6 items-center justify-center rounded-full p-2 transition-transform hover:scale-105 sm:min-h-[4.7rem] sm:min-w-[4.7rem] sm:translate-x-7 sm:p-3"
            >
              <span
                aria-hidden="true"
                className="relative flex h-[3.15rem] w-[3.15rem] items-center justify-center rounded-full bg-[#dcc090] drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:h-[4.25rem] sm:w-[4.25rem]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="ml-[0.3rem] h-[2.7rem] w-[2.7rem] sm:ml-[0.34rem] sm:h-[3.2rem] sm:w-[3.2rem]"
                  aria-hidden="true"
                >
                  <path
                    d="M8 6.5c0-.83.94-1.3 1.6-.8l7.2 5.5a1 1 0 0 1 0 1.6l-7.2 5.5A1 1 0 0 1 8 17.5v-11Z"
                    fill="#1f2442"
                    stroke="#1f2442"
                    strokeWidth="0.9"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="sr-only">{t('home.homepage.behindCreation.youtubeAlt')}</span>
            </button>
          </div>
        </div>
        <div className="mt-4 flex justify-center sm:mt-5">
          <HomeActionButton
            href="/about"
            label={t('home.homepage.behindCreation.cta')}
            className="min-w-[13.75rem] !rounded-[0.55rem] !px-7 !text-[1.08rem] !font-semibold !tracking-[0.14em] sm:min-w-[14.25rem] sm:!text-[1.12rem] sm:!tracking-[0.16em]"
          />
        </div>
      </div>
    </section>
  );
}
