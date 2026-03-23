'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Home, UserRound, Store } from 'lucide-react';
import { getCartCount } from '../lib/storageCounts';
import { CartIcon } from './icons/CartIcon';

interface MobileNavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

/**
 * Ստեղծում է հաստատուն mobile նավիգացիոն վահանակ՝ էջի ներքևում,
 * որպեսզի հիմնական գործողությունները միշտ լինեն ձեռքի տակ փոքր էկրաններում։
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartCount());
    };

    updateCartCount();
    window.addEventListener('cart-updated', updateCartCount);

    return () => {
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, []);

  const navItems: MobileNavItem[] = useMemo(
    () => [
      { label: 'Home', href: '/', icon: Home },
      { label: 'Shop', href: '/products', icon: Store },
      { label: 'Cart', href: '/cart', icon: CartIcon },
      { label: 'My account', href: '/profile', icon: UserRound },
    ],
    []
  );

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2 py-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = href ? pathname === href : false;
          const badgeValue = href === '/cart' ? cartCount : 0;

          const content = (
            <>
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} />
                {badgeValue > 0 && (
                  <span className="absolute -top-2 -right-2 rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
                    {badgeValue > 99 ? '99+' : badgeValue}
                  </span>
                )}
              </div>
              <span className="mt-1 text-[11px]">{label}</span>
            </>
          );

          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-1 flex-col items-center rounded-xl px-2 py-1 text-xs font-medium transition ${
                isActive ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

