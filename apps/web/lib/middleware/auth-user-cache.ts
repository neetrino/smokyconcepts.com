import type { AuthUser } from "./auth";

/**
 * Every admin screen fires several API calls at once and each one used to repeat
 * the same `users` lookup, so a single page load cost one database round-trip per
 * request before any domain query could start. This cache collapses that burst
 * into one lookup: concurrent requests share the in-flight promise, and the
 * resolved session is reused for a short window afterwards.
 */
const AUTH_USER_CACHE_TTL_MS = 5_000;

/** Bounds memory for long-lived server processes; oldest keys are evicted first. */
const AUTH_USER_CACHE_MAX_ENTRIES = 1_000;

interface CacheEntry {
  user: AuthUser | null;
  expiresAt: number;
}

const resolvedSessions = new Map<string, CacheEntry>();
const pendingSessions = new Map<string, Promise<AuthUser | null>>();

function evictOldestWhenFull(): void {
  if (resolvedSessions.size < AUTH_USER_CACHE_MAX_ENTRIES) {
    return;
  }

  const oldestKey = resolvedSessions.keys().next().value;
  if (oldestKey !== undefined) {
    resolvedSessions.delete(oldestKey);
  }
}

function readFresh(token: string): CacheEntry | null {
  const entry = resolvedSessions.get(token);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    resolvedSessions.delete(token);
    return null;
  }

  return entry;
}

/**
 * Resolve the session behind a token, deduplicating concurrent lookups.
 *
 * @param token Raw JWT; used only as an in-memory map key and never logged.
 * @param loadUser Performs the real verification when nothing is cached.
 */
export async function resolveCachedAuthUser(
  token: string,
  loadUser: () => Promise<AuthUser | null>
): Promise<AuthUser | null> {
  const cached = readFresh(token);
  if (cached) {
    return cached.user;
  }

  const pending = pendingSessions.get(token);
  if (pending) {
    return pending;
  }

  const lookup = loadUser()
    .then((user) => {
      evictOldestWhenFull();
      resolvedSessions.set(token, { user, expiresAt: Date.now() + AUTH_USER_CACHE_TTL_MS });
      return user;
    })
    .finally(() => {
      pendingSessions.delete(token);
    });

  pendingSessions.set(token, lookup);
  return lookup;
}

/** Drops a cached session immediately, e.g. after logout or a role change. */
export function invalidateCachedAuthUser(token: string): void {
  resolvedSessions.delete(token);
  pendingSessions.delete(token);
}
