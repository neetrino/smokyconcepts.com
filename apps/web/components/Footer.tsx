import Link from 'next/link';

import { FOOTER_LINKS, FOOTER_SOCIALS, HOME_ASSET_PATHS } from './home/homePage.data';

/**
 * Main footer aligned with the Figma homepage design.
 */
export function Footer() {
  return (
    <footer className="bg-[#122a26]">
      <div className="mx-auto flex max-w-[120rem] flex-col gap-10 px-4 py-16 text-[#dcc090] sm:px-8 lg:px-[7.5rem]">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
          <div className="flex flex-col gap-4 text-sm font-medium leading-[1.4]">
            {FOOTER_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className="w-fit transition-opacity hover:opacity-80">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm font-extrabold">Contact info</p>
            <a href="mailto:official@smokyconcepts.com" className="text-sm font-medium transition-opacity hover:opacity-80">
              official@smokyconcepts.com
            </a>
            <a href="https://wa.me/37443151551" className="text-sm font-medium transition-opacity hover:opacity-80">
              whatsup : +374 43151551
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
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <p className="text-sm font-extrabold">Designed by</p>
            <div className="relative h-12 w-24">
              <img src={HOME_ASSET_PATHS.studioLogo} alt="Gazar Studio" className="h-full w-full object-contain object-right" />
            </div>
          </div>
        </div>
        <p className="text-center text-xs font-medium">Copyright© 2026. All Rights Reserved.</p>
      </div>
    </footer>
  );
}


