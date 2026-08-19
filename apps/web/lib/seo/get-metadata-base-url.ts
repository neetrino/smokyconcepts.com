/** Public site origin used for Open Graph / Twitter absolute URLs. */
export const CANONICAL_SITE_URL = 'https://www.smokyconcepts.com';

/**
 * Resolves metadataBase for social previews.
 * Ignores `*.vercel.app` hosts — those often 404 for crawlers when a custom domain is live.
 */
export function getMetadataBaseUrl(): URL {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    '';

  if (!configured) {
    return new URL(CANONICAL_SITE_URL);
  }

  try {
    const url = new URL(configured);
    if (url.hostname.endsWith('.vercel.app')) {
      return new URL(CANONICAL_SITE_URL);
    }
    return url;
  } catch {
    return new URL(CANONICAL_SITE_URL);
  }
}
