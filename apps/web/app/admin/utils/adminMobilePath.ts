/** Default admin screen on mobile (avoids empty dashboard hub). */
export const ADMIN_MOBILE_DEFAULT_PATH = '/supersudo/analytics' as const;

/** Tailwind `lg` breakpoint — matches sidebar visibility. */
export const ADMIN_MOBILE_MEDIA_QUERY = '(max-width: 1023px)' as const;

/** Admin dashboard paths with no mobile content (redirect to analytics). */
const ADMIN_MOBILE_HUB_PATHS = new Set(['/admin', '/supersudo']);

/**
 * Whether the current route is the admin mobile landing hub.
 */
export function isAdminMobileHubPath(path: string | null | undefined): boolean {
  if (!path) {
    return false;
  }
  const normalized = path.replace(/\/$/, '') || '/';
  return ADMIN_MOBILE_HUB_PATHS.has(normalized);
}
