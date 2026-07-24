import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '../../lib/api-client';
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
        page: String(page),
      },
    });
  }, []);

  const fetchUpcoming = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allItems: UpcomingApiProduct[] = [];
      const seenProductIds = new Set<string>();
      let page = 1;
      let shouldContinue = true;

      while (shouldContinue) {
        const pageResponse = await fetchUpcomingPage(page);
        const pageItems = Array.isArray(pageResponse?.data) ? pageResponse.data : [];
        let addedItemsCount = 0;

        for (const item of pageItems) {
          if (!seenProductIds.has(item.id)) {
            seenProductIds.add(item.id);
            allItems.push(item);
            addedItemsCount += 1;
          }
        }

        const totalPages = pageResponse?.meta?.totalPages;
        const hasMetaTotalPages = typeof totalPages === 'number' && totalPages > 0;
        const hasMoreByMeta = hasMetaTotalPages && page < totalPages;
        const hasMoreWithoutMeta = !hasMetaTotalPages && pageItems.length > 0 && addedItemsCount > 0;
        shouldContinue = hasMoreByMeta || hasMoreWithoutMeta;
        page += 1;

        // Safety guard against accidental infinite pagination loops.
        if (page > 100) {
          shouldContinue = false;
        }
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
