import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '../../lib/api-client';
import { UPCOMING_LIMIT } from './upcomingProducts.constants';
import type { UpcomingApiProduct, UpcomingProductsResponse } from './upcomingProducts.types';

export function useUpcomingProducts() {
  const [items, setItems] = useState<UpcomingApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchGeneration, setFetchGeneration] = useState(0);

  const fetchUpcomingPage = useCallback(async (page: number) => {
    return apiClient.get<UpcomingProductsResponse>('/api/v1/products', {
      params: {
        filter: 'upcoming',
        limit: String(UPCOMING_LIMIT),
        page: String(page),
      },
    });
  }, []);

  const fetchUpcoming = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const firstPageResponse = await fetchUpcomingPage(1);
      const firstPageItems = Array.isArray(firstPageResponse?.data) ? firstPageResponse.data : [];
      const totalPages = Math.max(1, firstPageResponse?.meta?.totalPages ?? 1);

      if (totalPages <= 1) {
        setItems(firstPageItems);
        setFetchGeneration((g) => g + 1);
        return;
      }

      const allItems = [...firstPageItems];
      for (let page = 2; page <= totalPages; page += 1) {
        const pageResponse = await fetchUpcomingPage(page);
        const pageItems = Array.isArray(pageResponse?.data) ? pageResponse.data : [];
        allItems.push(...pageItems);
      }

      setItems(allItems);
      setFetchGeneration((g) => g + 1);
    } catch (err) {
      console.error('UpcomingProductsSection: failed to load upcoming products', err);
      setError('load_error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [fetchUpcomingPage]);

  useEffect(() => {
    void fetchUpcoming();
  }, [fetchUpcoming]);

  return { items, loading, error, fetchUpcoming, fetchGeneration };
}
