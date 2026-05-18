'use client';

import { useTranslation } from '@/lib/i18n-client';
import { AboutCTA } from './sections/AboutCTA';
import { AboutHero } from './sections/AboutHero';
import { AboutKhanos } from './sections/AboutKhanos';
import { AboutMark } from './sections/AboutMark';
import { AboutNext } from './sections/AboutNext';
import { AboutPhilosophy } from './sections/AboutPhilosophy';
import { AboutPillars } from './sections/AboutPillars';

/**
 * Smoky Concepts About page — implements the Figma design 1:1
 * (target 1920px desktop spec, gracefully scales below `lg`).
 */
export function AboutContent() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#efefef] font-montserrat text-[#414141]">
      <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-8 lg:px-[72px]">
        <h1 className="pt-10 text-center text-[26px] font-extrabold text-[#414141] md:pt-12 md:text-[36px]">
          {t('about.about.page_title')}
        </h1>
        <AboutHero />
        <AboutPhilosophy />
        <AboutPillars />
        <AboutMark />
        <AboutNext />
        <AboutKhanos />
        <AboutCTA />
      </div>
    </div>
  );
}
