import {
  ADMIN_LAST_SEEN_STORAGE_PREFIX,
  type AdminNewItemKind,
} from '../constants/adminNewItems.constants';

const LAST_SEEN_UPDATED_EVENT = 'admin-last-seen-updated' as const;

function getStorageKey(kind: AdminNewItemKind): string {
  return `${ADMIN_LAST_SEEN_STORAGE_PREFIX}:${kind}`;
}

export function readAdminLastSeenAt(kind: AdminNewItemKind): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage.getItem(getStorageKey(kind));
  } catch {
    return null;
  }
}

export function writeAdminLastSeenAt(kind: AdminNewItemKind, isoTimestamp: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(getStorageKey(kind), isoTimestamp);
    window.dispatchEvent(
      new CustomEvent<{ kind: AdminNewItemKind }>(LAST_SEEN_UPDATED_EVENT, { detail: { kind } })
    );
  } catch {
    // Ignore quota / private browsing errors.
  }
}

export function isAdminItemNew(createdAt: string, kind: AdminNewItemKind): boolean {
  const lastSeen = readAdminLastSeenAt(kind);
  if (!lastSeen) {
    return false;
  }
  const createdMs = new Date(createdAt).getTime();
  const lastSeenMs = new Date(lastSeen).getTime();
  if (!Number.isFinite(createdMs) || !Number.isFinite(lastSeenMs)) {
    return false;
  }
  return createdMs > lastSeenMs;
}

export function subscribeAdminLastSeenUpdated(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }
  window.addEventListener(LAST_SEEN_UPDATED_EVENT, listener);
  return () => window.removeEventListener(LAST_SEEN_UPDATED_EVENT, listener);
}
