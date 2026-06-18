/** @typedef {{ key: string; value: string }} SecurityHeader */

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/** Baseline CSP — permissive enough for Next.js + Tailwind; tightens clickjacking and mixed content. */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
  "media-src 'self' blob: https:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://banking.idram.am https://web.idram.am",
  "frame-ancestors 'none'",
].join('; ');

/** @type {SecurityHeader[]} */
const BASE_SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self)',
  },
  { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
];

/** @type {SecurityHeader[]} */
const PRODUCTION_ONLY_HEADERS = IS_PRODUCTION
  ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
  : [];

/** @type {SecurityHeader[]} */
const securityHeaders = [...BASE_SECURITY_HEADERS, ...PRODUCTION_ONLY_HEADERS];

module.exports = { securityHeaders };
