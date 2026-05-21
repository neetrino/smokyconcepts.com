'use client';

import { useTranslation } from '@/lib/i18n-client';

/**
 * "House of Khanos" — closing brand-family note.
 * Mirrors Figma node 6466:381.
 */
export function AboutKhanos() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto mt-14 max-w-[1040px] text-center text-[#414141] lg:mt-[110px]">
      <h2 className="text-[26px] font-black tracking-[-0.02em] sm:text-[28px] lg:text-[30px]">
        {t('about.about.khanos.title')}
      </h2>
      <div className="mx-auto mt-5 max-w-[460px] space-y-1 text-[13px] font-bold leading-[1.34] tracking-[-0.01em] sm:max-w-[980px] sm:text-[14px] sm:leading-[22px] lg:mt-7 lg:text-[15px] lg:font-semibold lg:leading-[23px]">
        <p>{t('about.about.khanos.line_1')}</p>
        <p>{t('about.about.khanos.line_2')}</p>
        <p>{t('about.about.khanos.line_3')}</p>
        <p>{t('about.about.khanos.line_4')}</p>
      </div>
    </section>
  );
}
