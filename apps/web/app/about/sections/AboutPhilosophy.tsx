'use client';

import { useTranslation } from '@/lib/i18n-client';

/**
 * "Smoky. Concepts. Two words. One intention." — bridges hero and pillars.
 * Mirrors Figma node 6466:384.
 */
export function AboutPhilosophy() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto mt-14 max-w-[500px] text-center text-[#414141] lg:mt-[96px] lg:max-w-[1360px]">
      <h2 className="text-center text-[26px] font-black leading-[1.15] sm:text-[30px] lg:text-[34px]">
        <span className="lg:hidden">
          {t('about.about.philosophy.headline_mobile_line_1')}
          <br />
          {t('about.about.philosophy.headline_mobile_line_2')}
        </span>
        <span className="hidden lg:inline">{t('about.about.philosophy.headline_desktop')}</span>
      </h2>

      <p className="mt-7 text-center text-[13px] font-bold leading-[22px] sm:text-[14px] lg:mt-[22px] lg:text-[15px] lg:font-semibold lg:leading-[24px]">
        <span className="font-extrabold">{t('about.about.philosophy.smoky_word')}</span>
        <span>{t('about.about.philosophy.smoky_lead')}</span>
      </p>

      <p className="mx-auto mt-2 max-w-[470px] whitespace-pre-line text-center text-[13px] font-bold leading-[1.42] sm:text-[14px] lg:max-w-[1300px] lg:text-[15px] lg:font-semibold lg:leading-[24px]">
        {t('about.about.philosophy.smoke_paragraph')}
      </p>

      <p className="mt-8 text-center text-[13px] font-bold leading-[22px] sm:text-[14px] lg:mt-[30px] lg:text-[15px] lg:font-semibold lg:leading-[24px]">
        <span className="font-extrabold">{t('about.about.philosophy.concepts_word')}</span>
        <span>{t('about.about.philosophy.concepts_lead')}</span>
      </p>

      <p className="mx-auto mt-2 max-w-[470px] text-center text-[13px] font-bold leading-[1.42] sm:text-[14px] lg:max-w-[980px] lg:text-[15px] lg:font-semibold lg:leading-[24px]">
        {t('about.about.philosophy.closing_1')}
        <br />
        {t('about.about.philosophy.closing_2')}
        <br />
        {t('about.about.philosophy.closing_3')}
        <br />
        {t('about.about.philosophy.closing_4')}
      </p>
    </section>
  );
}
