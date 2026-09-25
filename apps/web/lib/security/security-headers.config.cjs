/** @typedef {{ key: string; value: string }} SecurityHeader */

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * CSP is set in proxy.ts so payment return URLs can be framed by the bank
 * without dropping the rest of this policy.
 */

/** @type {SecurityHeader[]} */
const BASE_SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self)',
  },
];

/** @type {SecurityHeader[]} */
const PRODUCTION_ONLY_HEADERS = IS_PRODUCTION
  ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
  : [];

/** @type {SecurityHeader[]} */
const securityHeaders = [...BASE_SECURITY_HEADERS, ...PRODUCTION_ONLY_HEADERS];

module.exports = { securityHeaders };
