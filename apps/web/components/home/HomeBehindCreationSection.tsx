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
            {/* Temporary: play button replaced with Coming Soon until video is ready */}
            <p className="text-center text-2xl font-semibold tracking-[0.14em] text-[#dcc090] drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:text-4xl sm:tracking-[0.16em]">
              Coming Soon
            </p>
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
