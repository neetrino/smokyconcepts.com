'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { useTranslation } from '@/lib/i18n-client';

const HERO_BANNER_KEYS = [
  {
    src: '/assets/about/banner-1.png',
    imageClassName: 'object-cover scale-x-[-1]',
    altKey: 'about.about.hero.banner_1_alt',
  },
  {
    src: '/assets/about/banner-2.png',
    imageClassName: 'object-cover object-[70%_center]',
    altKey: 'about.about.hero.banner_2_alt',
  },
  {
    src: '/assets/about/banner-3.png',
    imageClassName: 'object-cover object-[42%_center]',
    altKey: 'about.about.hero.banner_3_alt',
  },
] as const;

const HERO_PARAGRAPH_KEYS = [
  'about.about.hero.paragraph_1',
  'about.about.hero.paragraph_2',
  'about.about.hero.paragraph_3',
  'about.about.hero.paragraph_4',
  'about.about.hero.paragraph_5',
] as const;

function getBannerRadiusClass(index: number): string {
  if (index === 0) {
    return 'rounded-l-[30px] rounded-r-none';
  }

  if (index === HERO_BANNER_KEYS.length - 1) {
    return 'rounded-r-[30px] rounded-l-none lg:rounded-r-[12px]';
  }

  return 'rounded-none';
}

/**
 * Hero — three vertical banners on the left, white "ritual" card on the right.
 * Mirrors Figma node 6466:286 (1680 × 648 desktop block).
 */
export function AboutHero() {
  const { t } = useTranslation();
  const heroParagraphs = useMemo(
    () => HERO_PARAGRAPH_KEYS.map((key) => t(key)),
    [t],
  );

  return (
    <section className="mx-auto mt-8 grid max-w-[1460px] grid-cols-1 gap-4 lg:mt-[56px] lg:grid-cols-2 lg:gap-1.5 xl:gap-2.5 lg:h-[500px]">
      <div className="grid grid-cols-3 gap-2 lg:gap-[9px]">
        {HERO_BANNER_KEYS.map((banner, index) => (
          <div
            key={banner.src}
            className={`relative h-[420px] overflow-hidden sm:h-[420px] lg:h-[500px] ${getBannerRadiusClass(index)}`}
          >
            <Image
              src={banner.src}
              alt={t(banner.altKey)}
              fill
              priority
              sizes="(min-width: 1024px) 272px, 33vw"
              className={banner.imageClassName}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col rounded-[12px] bg-white p-5 sm:p-8 lg:rounded-[12px_28px_28px_12px] lg:p-[38px]">
        <h2 className="text-[22px] font-extrabold leading-tight text-[#414141] sm:text-[28px] lg:text-[30px]">
          {t('about.about.hero.title')}
        </h2>
        <div className="mt-3 space-y-2.5 text-[13px] font-semibold leading-[21px] text-[#414141] sm:text-[15px] lg:mt-4 lg:space-y-3 lg:text-[15px] lg:leading-[22px] lg:font-medium">
          {heroParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
