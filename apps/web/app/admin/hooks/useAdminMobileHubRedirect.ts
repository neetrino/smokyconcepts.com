'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ADMIN_MOBILE_DEFAULT_PATH,
  ADMIN_MOBILE_MEDIA_QUERY,
  isAdminMobileHubPath,
} from '@/app/admin/utils/adminMobilePath';

interface UseAdminMobileHubRedirectOptions {
  enabled: boolean;
}

/**
 * On mobile, `/supersudo` has no content — send admins straight to analytics.
 */
export function useAdminMobileHubRedirect({ enabled }: UseAdminMobileHubRedirectOptions): void {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled || !pathname || !isAdminMobileHubPath(pathname)) {
      return;
    }

    const media = window.matchMedia(ADMIN_MOBILE_MEDIA_QUERY);

    const redirectIfMobile = (): void => {
      if (!media.matches) {
        return;
      }
      router.replace(ADMIN_MOBILE_DEFAULT_PATH);
    };

    redirectIfMobile();
    media.addEventListener('change', redirectIfMobile);
    return () => media.removeEventListener('change', redirectIfMobile);
  }, [enabled, pathname, router]);
}
