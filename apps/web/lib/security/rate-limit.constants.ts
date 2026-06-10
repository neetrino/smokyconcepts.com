/** Default sliding-window size for auth endpoints (15 minutes). */
export const AUTH_RATE_LIMIT_WINDOW_SECONDS = 15 * 60;

/** Max login attempts per IP within {@link AUTH_RATE_LIMIT_WINDOW_SECONDS}. */
export const AUTH_LOGIN_MAX_ATTEMPTS = 10;

/** Max registration attempts per IP within {@link AUTH_RATE_LIMIT_WINDOW_SECONDS}. */
export const AUTH_REGISTER_MAX_ATTEMPTS = 5;

/** Default sliding-window size for contact form (1 hour). */
export const CONTACT_RATE_LIMIT_WINDOW_SECONDS = 60 * 60;

/** Max contact submissions per IP within {@link CONTACT_RATE_LIMIT_WINDOW_SECONDS}. */
export const CONTACT_MAX_ATTEMPTS = 5;

export const RATE_LIMIT_HTTP_STATUS = 429;
