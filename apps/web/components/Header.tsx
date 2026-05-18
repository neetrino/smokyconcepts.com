'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { dispatchCartDrawerOpen } from '../app/cart/constants';
import { initializeCurrencyRates } from '../lib/currency';
import { getCartCount } from '../lib/storageCounts';
import { CurrencySwitcherHeader } from './CurrencySwitcherHeader';
import { HeaderDesktopAccount } from './HeaderAccountMenu';
import { LanguageSwitcherHeader } from './LanguageSwitcherHeader';
import { HOME_ASSET_PATHS } from './home/homePage.data';

const NAVIGATION_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
] as const;

const MOBILE_MENU_ID = 'header-mobile-menu';

function MobileMenuButton({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      id="header-mobile-menu-button"
      aria-expanded={open}
      aria-controls={MOBILE_MENU_ID}
      onClick={onToggle}
      className="inline-flex h-10 w-10 items-center justify-center md:hidden"
      aria-label={open ? 'Close menu' : 'Open menu'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={34}
        height={34}
        viewBox="0 0 34 34"
        fill="none"
        className="shrink-0"
        aria-hidden="true"
      >
        <rect width="34" height="34" fill="#122A26" />
        <path
          d="M9.20312 8.5H31.8698"
          stroke="#DCC090"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <path
          d="M16.2891 25.5L31.8724 25.5"
          stroke="#DCC090"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <path
          d="M2.82812 17H31.8698"
          stroke="#DCC090"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

/**
 * Main site header aligned with the Figma homepage design.
 */
export function Header() {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith('/supersudo') ?? false;

  const [cartCount, setCartCount] = useState(0);
  const [cartReady, setCartReady] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAdminPath) return;
    void initializeCurrencyRates();
  }, [isAdminPath]);

  useEffect(() => {
    if (isAdminPath) return;
    setCartCount(getCartCount());
    setCartReady(true);
    const handleCartUpdate = () => setCartCount(getCartCount());
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, [isAdminPath]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  if (isAdminPath) {
    return null;
  }

  const renderNavLinks = (
    className: string,
    items: readonly { readonly label: string; readonly href: string }[]
  ) => (
    <nav className={className}>
      {items.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`font-extrabold uppercase tracking-[0.16em] transition-opacity ${isActive ? 'text-[#dcc090]' : 'text-[#dcc090]/80 hover:text-[#dcc090]'}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 bg-[#122a26]">
      <div className="mx-auto flex max-w-[120rem] flex-col px-4 sm:px-8 lg:px-[7.5rem]">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="relative h-10 w-40 shrink-0">
            <img src={HOME_ASSET_PATHS.logo} alt="Smoky Concepts" className="h-full w-full object-contain object-left" />
          </Link>
          {renderNavLinks('hidden items-center gap-10 text-sm md:flex', NAVIGATION_ITEMS)}
          <div className="flex items-center gap-5 md:gap-6">
            <div className="flex items-center gap-3 md:hidden">
              <button
                type="button"
                onClick={() => dispatchCartDrawerOpen()}
                className="relative inline-flex h-6 w-6 items-center justify-center"
                aria-label="Open cart"
              >
                <img src={HOME_ASSET_PATHS.bagIcon} alt="" className="h-6 w-5 object-contain" aria-hidden />
                {cartReady && cartCount > 0 ? (
                  <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#dcc090] px-1 text-[0.55rem] font-bold text-[#122a26]">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                ) : null}
              </button>
              <div className="mt-1.5">
                <HeaderDesktopAccount />
              </div>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <CurrencySwitcherHeader />
              <LanguageSwitcherHeader />
              <button
                type="button"
                onClick={() => dispatchCartDrawerOpen()}
                className="relative inline-flex h-6 w-6 items-center justify-center"
                aria-label="Open cart"
              >
                <img src={HOME_ASSET_PATHS.bagIcon} alt="" className="h-6 w-5 object-contain" aria-hidden />
                {cartReady && cartCount > 0 ? (
                  <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#dcc090] px-1 text-[0.55rem] font-bold text-[#122a26]">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                ) : null}
              </button>
              <div className="ml-3 mt-1.5">
                <HeaderDesktopAccount />
              </div>
            </div>
            <MobileMenuButton open={mobileMenuOpen} onToggle={() => setMobileMenuOpen((v) => !v)} />
          </div>
        </div>
        {mobileMenuOpen ? (
          <div id={MOBILE_MENU_ID} className="flex flex-col border-t border-white/10 pb-4 pt-1 md:hidden">
            <nav className="flex flex-col" aria-label="Mobile primary">
              {NAVIGATION_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`border-b border-white/10 py-3.5 text-xs font-extrabold uppercase tracking-[0.16em] transition-opacity ${
                      isActive ? 'text-[#dcc090]' : 'text-[#dcc090]/80 hover:text-[#dcc090]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <CurrencySwitcherHeader variant="drawer" />
            <LanguageSwitcherHeader variant="drawer" />
          </div>
        ) : null}
      </div>
    </header>
  );
}
