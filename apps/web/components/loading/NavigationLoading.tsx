'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '../../lib/i18n-client';
import { PageLoadingOverlay } from './PageLoadingOverlay';
import { shouldShowNavigationLoadingForAnchor } from './shouldShowNavigationLoadingForAnchor';

/** Clear overlay if URL never changed (preventDefault / cancelled soft-nav). */
const STUCK_NAVIGATION_LOADING_MS = 400;

/**
 * Shows the shared glass overlay while navigating between pathnames.
 * Hides when the destination pathname becomes active (no fixed minimum duration).
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

      let nextPathname: string;
      try {
        nextPathname = new URL(anchor.href, window.location.href).pathname;
      } catch {
        return;
      }

      // Must set in capture (before Next.js Link preventDefault) so real navigations show overlay.
      const pathnameAtClick = window.location.pathname;
      setPendingPathname(nextPathname);

      window.setTimeout(() => {
        if (window.location.pathname !== pathnameAtClick) {
          return;
        }
        setPendingPathname((current) => (current === nextPathname ? null : current));
      }, STUCK_NAVIGATION_LOADING_MS);
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
