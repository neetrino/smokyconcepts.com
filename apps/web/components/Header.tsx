'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getCartCount } from '../lib/storageCounts';
import { LanguageSwitcherHeader } from './LanguageSwitcherHeader';
import { HOME_ASSET_PATHS } from './home/homePage.data';

const NAVIGATION_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Story', href: '/about' },
] as const;

/**
 * Main site header aligned with the Figma homepage design.
 */
export function Header() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [cartReady, setCartReady] = useState(false);

  useEffect(() => {
    setCartCount(getCartCount());
    setCartReady(true);
    const handleCartUpdate = () => setCartCount(getCartCount());
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#122a26]">
      <div className="mx-auto flex h-16 max-w-[120rem] items-center justify-between px-4 sm:px-8 lg:px-[7.5rem]">
        <Link href="/" className="relative h-10 w-40 shrink-0">
          <img src={HOME_ASSET_PATHS.logo} alt="Smoky Concepts" className="h-full w-full object-contain object-left" />
        </Link>
        <nav className="hidden items-center gap-10 md:flex">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-extrabold uppercase tracking-[0.16em] transition-opacity ${isActive ? 'text-[#dcc090]' : 'text-[#dcc090]/80 hover:text-[#dcc090]'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-6">
          <Link href="/cart" className="relative inline-flex h-6 w-6 items-center justify-center">
            <img src={HOME_ASSET_PATHS.bagIcon} alt="Cart" className="h-6 w-5 object-contain" />
            {cartReady && cartCount > 0 ? (
              <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#dcc090] px-1 text-[0.55rem] font-bold text-[#122a26]">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            ) : null}
          </Link>
          <LanguageSwitcherHeader />
        </div>
      </div>
    </header>
  );
}
