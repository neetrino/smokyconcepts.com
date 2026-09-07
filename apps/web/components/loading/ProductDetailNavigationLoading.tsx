'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '../../lib/i18n-client';
import { PageLoadingOverlay } from './PageLoadingOverlay';
import {
  isProductDetailPathname,
  shouldShowProductDetailNavigationLoading,
} from './shouldShowProductDetailNavigationLoading';

/** Clear overlay if soft-nav was cancelled / URL never changed. */
const STUCK_PRODUCT_NAVIGATION_LOADING_MS = 400;

/**
 * Glass overlay only when opening a product detail page (typically slow SSR).
 * Other routes stay without global loading.
 */
export function ProductDetailNavigationLoading() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [pendingPathname, setPendingPathname] = useState<string | null>(null);

  const visible = pendingPathname !== null && pendingPathname !== pathname;

  useEffect(() => {
    if (pendingPathname !== null && pendingPathname === pathname) {
      setPendingPathname(null);
    }
  }, [pathname, pendingPathname]);

  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const anchor = target.closest('a');
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }
      if (!shouldShowProductDetailNavigationLoading(anchor, event, pathname)) {
        return;
      }

      let nextPathname: string;
      try {
        nextPathname = new URL(anchor.href, window.location.href).pathname;
      } catch {
        return;
      }

      if (!isProductDetailPathname(nextPathname)) {
        return;
      }

      const pathnameAtClick = window.location.pathname;
      setPendingPathname(nextPathname);

      window.setTimeout(() => {
        if (window.location.pathname !== pathnameAtClick) {
          return;
        }
        setPendingPathname((current) => (current === nextPathname ? null : current));
      }, STUCK_PRODUCT_NAVIGATION_LOADING_MS);
    };

    document.addEventListener('click', onClickCapture, true);
    return () => {
      document.removeEventListener('click', onClickCapture, true);
    };
  }, [pathname]);

  return (
    <PageLoadingOverlay visible={visible} label={t('common.messages.loading')} />
  );
}
