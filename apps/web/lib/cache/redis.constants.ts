/** Skip repeated Redis error logs within this window. */
export const REDIS_ERROR_LOG_COOLDOWN_MS = 30_000;

/** ioredis: stop retrying after this many attempts. */
export const IOREDIS_MAX_RETRY_ATTEMPTS = 3;

/** ioredis: base retry delay in milliseconds. */
export const IOREDIS_RETRY_DELAY_MS = 50;

/** ioredis: cap retry delay in milliseconds. */
export const IOREDIS_MAX_RETRY_DELAY_MS = 2_000;

/** Ignored unless a real remote Redis is configured. */
export const LOCAL_DEFAULT_REDIS_URL = 'redis://localhost:6379';
