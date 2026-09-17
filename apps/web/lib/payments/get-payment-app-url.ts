import { CANONICAL_SITE_URL } from '@/lib/seo/get-metadata-base-url';

const LOCAL_APP_URL = 'http://localhost:3000';

function normalizeAppUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function isUnusablePaymentHost(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith('.vercel.app');
  } catch {
    return true;
  }
}

function readConfiguredAppUrl(): string {
  const explicitUrl = process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || '';
  if (!explicitUrl || isUnusablePaymentHost(explicitUrl)) {
    return '';
  }
  return normalizeAppUrl(explicitUrl);
}

/** Live site origin. Never `*.vercel.app` (those deployments 404). */
export function getPublicSiteAppUrl(): string {
  return readConfiguredAppUrl() || CANONICAL_SITE_URL;
}

/**
 * Origin sent to the payment provider as the customer return URL.
 * Locally this is localhost so the browser comes back to this Next process.
 */
export function getPaymentReturnAppUrl(): string {
  if (process.env.NODE_ENV === 'development') {
    return LOCAL_APP_URL;
  }

  return getPublicSiteAppUrl();
}
