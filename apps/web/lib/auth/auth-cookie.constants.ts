/** httpOnly session cookie name — must match server auth middleware. */
export const AUTH_COOKIE_NAME = 'auth_token';

/** Legacy localStorage keys (migration only). */
export const LEGACY_AUTH_TOKEN_KEY = 'auth_token';
export const LEGACY_AUTH_USER_KEY = 'auth_user';

/** Fallback cookie lifetime when JWT_EXPIRES_IN is missing or invalid (7 days). */
export const DEFAULT_AUTH_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

const DURATION_MULTIPLIERS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 24 * 60 * 60,
};

/**
 * Parses JWT-style duration strings (`7d`, `24h`, `3600`) into cookie Max-Age seconds.
 */
export function parseDurationToSeconds(raw: string): number {
  const trimmed = raw.trim();
  const match = /^(\d+)([smhd])?$/i.exec(trimmed);
  if (!match) {
    return DEFAULT_AUTH_COOKIE_MAX_AGE_SECONDS;
  }

  const amount = Number(match[1]);
  const unit = (match[2] ?? 's').toLowerCase();
  const multiplier = DURATION_MULTIPLIERS[unit];
  if (!multiplier || !Number.isFinite(amount) || amount <= 0) {
    return DEFAULT_AUTH_COOKIE_MAX_AGE_SECONDS;
  }

  return amount * multiplier;
}

export function getAuthCookieMaxAgeSeconds(): number {
  const configured = process.env.JWT_EXPIRES_IN?.trim();
  if (!configured) {
    return DEFAULT_AUTH_COOKIE_MAX_AGE_SECONDS;
  }
  return parseDurationToSeconds(configured);
}
