'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AdminNewItemKind } from '../constants/adminNewItems.constants';
import {
  isAdminItemNew,
  readAdminLastSeenAt,
  subscribeAdminLastSeenUpdated,
  writeAdminLastSeenAt,
} from '../utils/adminLastSeen';

export function useAdminLastSeen(kind: AdminNewItemKind) {
  const [, bump] = useState(0);

  useEffect(() => subscribeAdminLastSeenUpdated(() => bump((value) => value + 1)), []);

  const isNew = useCallback((createdAt: string) => isAdminItemNew(createdAt, kind), [kind]);

  const markSeen = useCallback(() => {
    writeAdminLastSeenAt(kind, new Date().toISOString());
  }, [kind]);

  const lastSeenAt = readAdminLastSeenAt(kind);

  return { isNew, markSeen, lastSeenAt };
}

/** Marks the section as seen when the admin leaves the page. */
export function useMarkAdminSectionSeenOnLeave(kind: AdminNewItemKind): void {
  const { markSeen } = useAdminLastSeen(kind);

  useEffect(() => () => markSeen(), [markSeen]);
}

/**
 * On first visit (no stored timestamp), seeds last-seen from loaded items so new
 * entries can be highlighted immediately after the initial list is shown.
 */
export function useSeedAdminLastSeenBaseline(
  kind: AdminNewItemKind,
  createdAtValues: string[],
  enabled: boolean
): void {
  useEffect(() => {
    if (!enabled || createdAtValues.length === 0 || readAdminLastSeenAt(kind) !== null) {
      return;
    }

    const timestamps = createdAtValues
      .map((value) => new Date(value).getTime())
      .filter(Number.isFinite);
    if (timestamps.length === 0) {
      return;
    }

    writeAdminLastSeenAt(kind, new Date(Math.max(...timestamps)).toISOString());
  }, [kind, createdAtValues, enabled]);
}
