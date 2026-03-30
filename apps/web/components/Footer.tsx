'use client';

import Link from 'next/link';

import { FOOTER_LINKS, FOOTER_SOCIALS, HOME_ASSET_PATHS } from './home/homePage.data';
import { useTranslation } from '@/lib/i18n-client';

/**
 * Main footer aligned with the Figma homepage design.
 */
export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-[#122a26]">
      <div className="mx-auto flex max-w-[120rem] flex-col gap-10 px-4 py-16 text-[#dcc090] sm:px-8 lg:px-[7.5rem]">
        <div className="grid justify-items-center gap-10 text-center lg:grid-cols-[1fr_auto_1fr] lg:items-start lg:justify-items-stretch lg:text-left">
          <div className="flex flex-col items-center gap-4 text-sm font-medium leading-[1.4] lg:items-start">
            {FOOTER_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className="transition-opacity hover:opacity-80">
                {item.href === '/privacy'
                  ? t('home.homepage.footer.links.privacy')
                  : item.href === '/terms'
                    ? t('home.homepage.footer.links.terms')
                    : item.href === '/delivery-terms'
                      ? t('home.homepage.footer.links.deliveryTerms')
                    : t('home.homepage.footer.links.refund')}
              </Link>
            ))}
          </div>
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm font-extrabold">{t('home.homepage.footer.contactTitle')}</p>
            <a href="mailto:official@smokyconcepts.com" className="text-sm font-medium transition-opacity hover:opacity-80">
              official@smokyconcepts.com
            </a>
            <a href="https://wa.me/37443151551" className="text-sm font-medium transition-opacity hover:opacity-80">
              {t('home.homepage.footer.whatsappLabel')} +374 43151551
            </a>
            <div className="flex items-center gap-6">
              {FOOTER_SOCIALS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="inline-flex h-8 w-8 items-center justify-center transition-transform hover:scale-105"
                >
                  <img src={item.iconSrc} alt="" className="h-8 w-8 object-contain" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 lg:items-end lg:text-right">
            <p className="text-sm font-extrabold">{t('home.homepage.footer.designedBy')}</p>
            <div className="relative h-12 w-24">
              <img
                src={HOME_ASSET_PATHS.studioLogo}
                alt="Gazar Studio"
                className="h-full w-full object-contain object-center lg:object-right"
              />
            </div>
          </div>
        </div>
        <p className="text-center text-xs font-medium">{t('home.homepage.footer.copyright')}</p>
      </div>
    </footer>
  );
}


