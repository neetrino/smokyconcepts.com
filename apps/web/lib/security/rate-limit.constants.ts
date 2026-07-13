/** Default sliding-window size for auth endpoints (15 minutes). */
export const AUTH_RATE_LIMIT_WINDOW_SECONDS = 15 * 60;

/** Max login attempts per IP within {@link AUTH_RATE_LIMIT_WINDOW_SECONDS}. */
export const AUTH_LOGIN_MAX_ATTEMPTS = 10;

/** Max registration attempts per IP within {@link AUTH_RATE_LIMIT_WINDOW_SECONDS}. */
export const AUTH_REGISTER_MAX_ATTEMPTS = 5;

/** Forgot-password window (10 minutes). */
export const AUTH_FORGOT_PASSWORD_WINDOW_SECONDS = 10 * 60;

/** Max forgot-password requests per IP within the forgot window. */
export const AUTH_FORGOT_PASSWORD_MAX_ATTEMPTS = 5;

/** Max password-reset submissions per IP within {@link AUTH_RATE_LIMIT_WINDOW_SECONDS}. */
export const AUTH_RESET_PASSWORD_MAX_ATTEMPTS = 5;

/** Default sliding-window size for contact form (1 hour). */
export const CONTACT_RATE_LIMIT_WINDOW_SECONDS = 60 * 60;

/** Max contact submissions per IP within {@link CONTACT_RATE_LIMIT_WINDOW_SECONDS}. */
export const CONTACT_MAX_ATTEMPTS = 5;

/** Max custom size order submissions per IP within {@link CONTACT_RATE_LIMIT_WINDOW_SECONDS}. */
export const CUSTOM_SIZE_ORDER_MAX_ATTEMPTS = 10;

export const RATE_LIMIT_HTTP_STATUS = 429;
