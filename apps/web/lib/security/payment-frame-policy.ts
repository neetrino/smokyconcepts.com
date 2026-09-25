const GOOGLE_FONTS_STYLE_ORIGIN = 'https://fonts.googleapis.com';
const GOOGLE_FONTS_FONT_ORIGIN = 'https://fonts.gstatic.com';

const BASE_CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  `style-src 'self' 'unsafe-inline' ${GOOGLE_FONTS_STYLE_ORIGIN}`,
  "img-src 'self' data: blob: https:",
  `font-src 'self' data: ${GOOGLE_FONTS_FONT_ORIGIN}`,
  "connect-src 'self' https: wss:",
  "media-src 'self' blob: https:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://banking.idram.am https://web.idram.am",
];

/** Origins that load our payment return URL inside their 3DS / checkout iframe. */
const PAYMENT_FRAME_ANCESTORS = [
  'https://banking.idram.am',
  'https://web.idram.am',
  'https://www.idram.am',
  'https://idram.am',
  'https://services.ameriabank.am',
  'https://servicestest.ameriabank.am',
  'https://ipay.arca.am',
  'https://testepg.arca.am',
  'https://pg.inecoecom.am',
].join(' ');

const FRAMABLE_PAYMENT_PATHS = [
  '/api/v1/payments/idram/fail',
  '/api/v1/payments/idram/success',
  '/api/v1/payments/arca/callback',
];

export function isFramablePaymentReturn(pathname: string): boolean {
  return FRAMABLE_PAYMENT_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function paymentFrameCsp(): string {
  return [...BASE_CSP_DIRECTIVES, `frame-ancestors ${PAYMENT_FRAME_ANCESTORS}`].join('; ');
}

export const SITE_FRAME_CSP = [...BASE_CSP_DIRECTIVES, "frame-ancestors 'none'"].join('; ');
