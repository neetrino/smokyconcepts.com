import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '../../lib/api-client';
import { UPCOMING_LIMIT } from './upcomingProducts.constants';
import type { UpcomingApiProduct, UpcomingProductsResponse } from './upcomingProducts.types';

export function useUpcomingProducts() {
  const [items, setItems] = useState<UpcomingApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchGeneration, setFetchGeneration] = useState(0);

  const fetchUpcoming = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<UpcomingProductsResponse>('/api/v1/products', {
        params: {
          filter: 'upcoming',
          limit: String(UPCOMING_LIMIT),
          page: '1',
        },
      });
      const list = Array.isArray(response?.data) ? response.data : [];
      setItems(list);
      setFetchGeneration((g) => g + 1);
    } catch (err) {
      console.error('UpcomingProductsSection: failed to load upcoming products', err);
      setError('load_error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUpcoming();
  }, [fetchUpcoming]);

  return { items, loading, error, fetchUpcoming, fetchGeneration };
}
