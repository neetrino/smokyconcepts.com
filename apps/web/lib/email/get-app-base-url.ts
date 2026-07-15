/**
 * Public site origin for absolute links in emails.
 */
export function getAppBaseUrl(requestOrigin?: string): string {
  const normalizedRequestOrigin = requestOrigin?.trim().replace(/\/$/, '') || '';
  if (normalizedRequestOrigin) {
    return normalizedRequestOrigin;
  }

  const configured =
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    '';

  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.trim().replace(/\/$/, '')}`;
  }

  return 'http://localhost:3000';
}
