'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n-client';
import { type LanguageCode } from '@/lib/language';

/** Locales where the CTA uses a smaller label size (Armenian + Russian). English stays at the default size. */
const ABOUT_CTA_BUTTON_COMPACT_LANGS: ReadonlySet<LanguageCode> = new Set(['hy', 'ru']);

function aboutCtaButtonTextClass(lang: LanguageCode): string {
  return ABOUT_CTA_BUTTON_COMPACT_LANGS.has(lang)
    ? 'text-[12px] sm:text-[12px] lg:text-[16px]'
    : 'text-[14px] sm:text-[14px] lg:text-[20px]';
}

/**
 * "Now You Know" — large heading + closing copy and primary CTA.
 * Mirrors Figma node 6466:390.
 */
export function AboutCTA() {
  const { t, lang } = useTranslation();

  return (
    <section className="mx-auto mt-20 grid max-w-[980px] grid-cols-1 gap-4 pb-16 text-[#414141] lg:mt-[118px] lg:grid-cols-[320px_1fr] lg:items-start lg:gap-[28px] lg:pb-[92px]">
      <h2 className="text-center text-[42px] font-black leading-[0.92] tracking-[-0.025em] sm:text-[46px] lg:text-left lg:text-[68px] lg:font-extrabold">
        <span className="whitespace-nowrap lg:hidden">{t('about.about.cta.title_mobile')}</span>
        <span className="hidden lg:inline">
          {t('about.about.cta.title_desktop_line_1')}
          <br />
          {t('about.about.cta.title_desktop_line_2')}
        </span>
      </h2>

      <div className="flex max-w-[520px] flex-col items-center gap-5 text-center lg:items-start lg:gap-6 lg:text-left">
        <div className="max-w-[420px] space-y-1.5 text-[14px] font-bold leading-[1.45] tracking-[-0.01em] sm:text-[15px] sm:leading-[23px] lg:max-w-[520px] lg:text-[18px] lg:font-semibold lg:leading-[30px]">
          <p>
            {t('about.about.cta.body_1_line1')}
            <br className="sm:hidden" />
            {' '}
            {t('about.about.cta.body_1_line2')}
          </p>
          <p>
            {t('about.about.cta.body_2_lead')}
            <br className="sm:hidden" />
            {' '}
            <span className="whitespace-nowrap">{t('about.about.cta.body_2_tagline')}</span>
          </p>
        </div>

        <Link
          href="/products"
          className={`mx-auto inline-flex h-[42px] w-full max-w-[286px] items-center justify-center whitespace-nowrap rounded-[10px] bg-[#dcc090] px-5 font-bold tracking-[0.1em] text-[#122a26] transition-opacity hover:opacity-90 lg:mx-0 lg:h-11 lg:max-w-[372px] lg:font-semibold ${aboutCtaButtonTextClass(lang)}`}
        >
          {t('about.about.cta.button')}
        </Link>
      </div>
    </section>
  );
}
