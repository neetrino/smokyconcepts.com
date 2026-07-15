'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '../../lib/i18n-client';
import { PageLoadingOverlay } from './PageLoadingOverlay';
import { shouldShowNavigationLoadingForAnchor } from './shouldShowNavigationLoadingForAnchor';

/**
 * Shows the shared glass overlay while navigating between pathnames.
 * Hides in the same render as the destination pathname becomes active
 * (no fixed timer) so page-level loaders are not stacked on top.
 */
export function NavigationLoading() {
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
      if (!shouldShowNavigationLoadingForAnchor(anchor, event, pathname)) {
        return;
      }

      try {
        const nextUrl = new URL(anchor.href, window.location.href);
        setPendingPathname(nextUrl.pathname);
      } catch {
        return;
      }
    };

    const onPopState = () => {
      setPendingPathname(window.location.pathname);
    };

    document.addEventListener('click', onClickCapture, true);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('popstate', onPopState);
    };
  }, [pathname]);

  return (
    <PageLoadingOverlay visible={visible} label={t('common.messages.loading')} />
  );
}
