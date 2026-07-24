/** localStorage prefix for admin "last seen" timestamps (orders / messages). */
export const ADMIN_LAST_SEEN_STORAGE_PREFIX = 'smoky-admin-last-seen' as const;

export type AdminNewItemKind = 'orders' | 'messages';

/** Sidebar poll interval for unread counts. */
export const ADMIN_NEW_COUNTS_POLL_MS = 60_000 as const;
