/** httpOnly cookie: grants access to one order detail page without exposing id in the URL. */
export const ORDER_ACCESS_COOKIE_NAME = 'order_access';

/** How long the order-access cookie stays valid (7 days). */
export const ORDER_ACCESS_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
