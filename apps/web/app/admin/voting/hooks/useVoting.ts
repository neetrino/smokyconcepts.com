'use client';

import { useCallback, useState } from 'react';

import { apiClient } from '../../../../lib/api-client';

import type { VotingItem, VotingItemsResponse } from '../types';

export function useVoting() {
  const [items, setItems] = useState<VotingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVotingItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<VotingItemsResponse>('/api/v1/admin/voting');
      setItems(Array.isArray(response.data) ? response.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    items,
    setItems,
    loading,
    fetchVotingItems,
  };
}
