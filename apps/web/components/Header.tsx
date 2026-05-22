'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { dispatchCartDrawerOpen } from '../app/cart/constants';
import { initializeCurrencyRates } from '../lib/currency';
import { getCartCount } from '../lib/storageCounts';
import { HeaderLocaleCurrencySwitcher } from './header/HeaderLocaleCurrencySwitcher';
import {
  HEADER_ACTION_HIT_CLASS,
  HEADER_ASSET_PATHS,
  HEADER_BAG_ICON_CLASS,
  HEADER_UTILITIES_GAP_PX,
  HEADER_UTILITIES_ROW_CLASS,
} from './header/header.constants';
import { HeaderDesktopAccount } from './HeaderAccountMenu';

const NAVIGATION_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
] as const;

const MOBILE_MENU_ID = 'header-mobile-menu';

const NAV_LINK_BASE = 'text-[15px] uppercase tracking-[0.1em] transition-opacity';
const NAV_LINK_ACTIVE = 'font-extrabold text-[#dcc090]';
const NAV_LINK_INACTIVE = 'font-normal text-[#dcc090]/80 hover:text-[#dcc090]';

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

function HeaderCartButton({ cartCount, cartReady }: { cartCount: number; cartReady: boolean }) {
  return (
    <button
      type="button"
      onClick={() => dispatchCartDrawerOpen()}
      className={`relative ${HEADER_ACTION_HIT_CLASS}`}
      aria-label="Open cart"
    >
      <img src={HEADER_ASSET_PATHS.bag} alt="" className={HEADER_BAG_ICON_CLASS} aria-hidden />
      {cartReady && cartCount > 0 ? (
        <span className="absolute right-0 top-0 inline-flex h-3.5 min-w-3.5 -translate-y-1/4 translate-x-1/4 items-center justify-center rounded-full bg-[#dcc090] px-0.5 text-[8px] font-medium leading-none text-[#122a26]">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      ) : null}
    </button>
  );
}

/**
 * Main site header aligned with Figma (node 6513:232).
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
            className={`${NAV_LINK_BASE} ${isActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE}`}
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
        <div className="flex h-16 items-center justify-between py-3">
          <Link href="/" className="relative h-10 w-40 shrink-0">
            <img
              src={HEADER_ASSET_PATHS.logo}
              alt="Smoky Concepts"
              className="h-full w-full object-contain object-left"
            />
          </Link>
          {renderNavLinks('hidden items-center gap-10 md:flex', NAVIGATION_ITEMS)}
          <div className="flex items-center gap-3 md:gap-[1.8125rem]">
            <div className={`${HEADER_UTILITIES_ROW_CLASS} gap-3 md:hidden`}>
              <HeaderCartButton cartCount={cartCount} cartReady={cartReady} />
              <HeaderDesktopAccount />
            </div>
            <div
              className={`${HEADER_UTILITIES_ROW_CLASS} hidden md:flex`}
              style={{ gap: HEADER_UTILITIES_GAP_PX }}
            >
              <HeaderLocaleCurrencySwitcher />
              <HeaderCartButton cartCount={cartCount} cartReady={cartReady} />
              <HeaderDesktopAccount />
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
                    className={`border-b border-white/10 py-3.5 ${NAV_LINK_BASE} ${
                      isActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <HeaderLocaleCurrencySwitcher variant="drawer" />
          </div>
        ) : null}
      </div>
    </header>
  );
}
