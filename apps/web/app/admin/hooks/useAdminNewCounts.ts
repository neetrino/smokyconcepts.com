'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { ADMIN_NEW_COUNTS_POLL_MS } from '../constants/adminNewItems.constants';
import { readAdminLastSeenAt, subscribeAdminLastSeenUpdated } from '../utils/adminLastSeen';

interface AdminNewCounts {
  orders: number;
  messages: number;
}

const EMPTY_COUNTS: AdminNewCounts = { orders: 0, messages: 0 };

export function useAdminNewCounts(enabled = true): AdminNewCounts {
  const [counts, setCounts] = useState<AdminNewCounts>(EMPTY_COUNTS);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let cancelled = false;

    const fetchCounts = async () => {
      try {
        const messagesSince = readAdminLastSeenAt('messages') ?? '';
        const response = await apiClient.get<AdminNewCounts>('/api/v1/admin/new-counts', {
          params: { messagesSince },
        });
        if (!cancelled) {
          setCounts({
            orders: response.orders ?? 0,
            messages: response.messages ?? 0,
          });
        }
      } catch {
        if (!cancelled) {
          setCounts(EMPTY_COUNTS);
        }
      }
    };

    void fetchCounts();
    const interval = window.setInterval(() => void fetchCounts(), ADMIN_NEW_COUNTS_POLL_MS);
    const unsubscribe = subscribeAdminLastSeenUpdated(() => void fetchCounts());

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      unsubscribe();
    };
  }, [enabled]);

  return counts;
}
