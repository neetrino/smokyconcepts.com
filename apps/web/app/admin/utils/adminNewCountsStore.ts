import { ADMIN_NEW_COUNTS_POLL_MS } from '../constants/adminNewItems.constants';
import { apiClient } from '@/lib/api-client';
import { readAdminLastSeenAt, subscribeAdminLastSeenUpdated } from './adminLastSeen';

export interface AdminNewCounts {
  orders: number;
  messages: number;
}

const EMPTY_COUNTS: AdminNewCounts = { orders: 0, messages: 0 };

type Listener = (counts: AdminNewCounts) => void;

let cachedCounts: AdminNewCounts = EMPTY_COUNTS;
const listeners = new Set<Listener>();
let pollIntervalId: number | null = null;
let unsubscribeLastSeen: (() => void) | null = null;
let inFlightFetch: Promise<void> | null = null;

function notifyListeners(): void {
  for (const listener of listeners) {
    listener(cachedCounts);
  }
}

async function fetchCounts(): Promise<void> {
  if (inFlightFetch) {
    await inFlightFetch;
    return;
  }

  inFlightFetch = (async () => {
    try {
      const messagesSince = readAdminLastSeenAt('messages') ?? '';
      const response = await apiClient.get<AdminNewCounts>('/api/v1/admin/new-counts', {
        params: { messagesSince },
      });
      cachedCounts = {
        orders: response.orders ?? 0,
        messages: response.messages ?? 0,
      };
    } catch {
      cachedCounts = EMPTY_COUNTS;
    } finally {
      inFlightFetch = null;
      notifyListeners();
    }
  })();

  await inFlightFetch;
}

function startPolling(): void {
  if (typeof window === 'undefined' || pollIntervalId !== null) {
    return;
  }

  void fetchCounts();
  pollIntervalId = window.setInterval(() => void fetchCounts(), ADMIN_NEW_COUNTS_POLL_MS);
  unsubscribeLastSeen = subscribeAdminLastSeenUpdated(() => void fetchCounts());
}

function stopPolling(): void {
  if (pollIntervalId !== null) {
    window.clearInterval(pollIntervalId);
    pollIntervalId = null;
  }
  unsubscribeLastSeen?.();
  unsubscribeLastSeen = null;
}

/** Current cached badge counts (sync read for hook initial state). */
export function getAdminNewCountsSnapshot(): AdminNewCounts {
  return cachedCounts;
}

/**
 * Shared new-counts subscription — one network poll for all admin nav surfaces.
 */
export function subscribeAdminNewCounts(listener: Listener): () => void {
  listeners.add(listener);
  listener(cachedCounts);
  startPolling();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stopPolling();
    }
  };
}
