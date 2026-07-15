/** Password reset link lifetime. */
export const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

/** Raw token byte length before hex encoding. */
export const PASSWORD_RESET_TOKEN_BYTES = 32;

/** Brand name shown in reset emails and UI. */
export const PASSWORD_RESET_BRAND_NAME = 'Smoky Concepts';

/** Public logo path (R2-backed via Next rewrite). Prefer raster for email clients. */
export const PASSWORD_RESET_LOGO_PATH = '/assets/home/Asset%202@4x-8.webp';
