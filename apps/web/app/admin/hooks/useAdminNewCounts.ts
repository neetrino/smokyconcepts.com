'use client';

import { useEffect, useState } from 'react';
import {
  getAdminNewCountsSnapshot,
  subscribeAdminNewCounts,
  type AdminNewCounts,
} from '../utils/adminNewCountsStore';

const EMPTY_COUNTS: AdminNewCounts = { orders: 0, messages: 0 };

/**
 * Unread orders/messages badge counts. Multiple consumers share one poller.
 */
export function useAdminNewCounts(enabled = true): AdminNewCounts {
  const [counts, setCounts] = useState<AdminNewCounts>(
    enabled ? getAdminNewCountsSnapshot : () => EMPTY_COUNTS
  );

  useEffect(() => {
    if (!enabled) {
      setCounts(EMPTY_COUNTS);
      return undefined;
    }

    return subscribeAdminNewCounts(setCounts);
  }, [enabled]);

  return counts;
}
