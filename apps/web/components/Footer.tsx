'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  FOOTER_LINKS,
  FOOTER_SOCIALS,
  GAZZAR_STUDIO_HREF,
  HOME_ASSET_PATHS,
  NEETRINO_PARTNER_HREF,
} from './home/homePage.data';
import { useTranslation } from '@/lib/i18n-client';

/**
 * Main footer aligned with the Figma homepage design.
 */
export function Footer() {
  const pathname = usePathname();
  const { t } = useTranslation();
  if (pathname?.startsWith('/supersudo')) {
    return null;
  }

  return (
    <footer className="bg-[#122a26]">
      <div className="mx-auto flex max-w-[120rem] flex-col gap-10 px-4 py-16 text-[#dcc090] sm:px-8 lg:px-[7.5rem]">
        <div className="grid justify-items-center gap-10 text-center lg:grid-cols-[1fr_auto_1fr] lg:items-start lg:justify-items-stretch lg:text-left">
          <div className="order-2 flex flex-col items-center gap-4 text-sm font-medium leading-[1.4] lg:order-1 lg:items-start">
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
          <div className="order-1 flex flex-col items-center gap-4 text-center lg:order-2">
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
          <div className="order-3 flex flex-col items-center gap-4 lg:order-3 lg:items-end lg:text-right">
            <div className="flex w-full flex-col items-center gap-8 lg:items-end">
              <div className="flex max-w-[10rem] translate-x-1 flex-col items-center self-end sm:translate-x-2 lg:items-end">
                <p className="mb-2 text-sm font-extrabold lg:-translate-x-6">{t('home.homepage.footer.createdBy')}</p>
                <a
                  href={NEETRINO_PARTNER_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full transition-opacity hover:opacity-80"
                  aria-label="Neetrino"
                >
                  <img
                    src={HOME_ASSET_PATHS.neetrinoPartnerLogo}
                    alt=""
                    className="h-6 w-full max-h-8 object-contain object-center lg:object-right"
                    aria-hidden="true"
                  />
                </a>
              </div>
              <div className="flex flex-col items-center lg:items-end">
                <p className="mb-2 text-sm font-extrabold">{t('home.homepage.footer.designedBy')}</p>
                <a
                  href={GAZZAR_STUDIO_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative h-12 w-24 transition-opacity hover:opacity-80"
                  aria-label="Gazzar Studio"
                >
                  <img
                    src={HOME_ASSET_PATHS.studioLogo}
                    alt="Gazar Studio"
                    className="h-full w-full object-contain object-center lg:object-right"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-xs font-medium">{t('home.homepage.footer.copyright')}</p>
      </div>
    </footer>
  );
}


