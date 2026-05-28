import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '../../lib/api-client';
import type { CatalogProduct } from '../../app/products/components/catalogProductLabels';
import { TRENDING_FEATURED_PAGE_SIZE } from './trendingFeatured.constants';
import {
  mapApiProductToCatalogProduct,
  PLACEHOLDER_IMAGE,
} from './trendingFeaturedPages';
import type { ApiProduct, ProductsResponse } from './trendingFeatured.types';

export function useTrendingFeaturedProducts() {
  const [items, setItems] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatured = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const aggregatedItems: ApiProduct[] = [];
      let pageCursor = 1;
      let totalApiPages = 1;

      do {
        const response = await apiClient.get<ProductsResponse>('/api/v1/products', {
          params: {
            filter: 'featured',
            limit: String(TRENDING_FEATURED_PAGE_SIZE),
            page: String(pageCursor),
          },
        });
        const pageItems = Array.isArray(response?.data) ? response.data : [];
        aggregatedItems.push(...pageItems);
        totalApiPages = Math.max(1, response?.meta?.totalPages ?? 1);
        pageCursor += 1;
      } while (pageCursor <= totalApiPages);

      const seenIds = new Set<string>();
      const mapped: CatalogProduct[] = aggregatedItems
        .filter((p) => {
          const id = p.id?.trim() ?? '';
          if (!id || seenIds.has(id)) {
            return false;
          }
          seenIds.add(id);
          return true;
        })
        .map((p) => {
          const mappedProduct = mapApiProductToCatalogProduct(p);
          if (!mappedProduct.image && !mappedProduct.images?.length) {
            return { ...mappedProduct, image: PLACEHOLDER_IMAGE };
          }
          return mappedProduct;
        });
      setItems(mapped);
    } catch (err) {
      console.error('TrendingFeaturedSection: failed to load featured products', err);
      setError('load_error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFeatured();
  }, [fetchFeatured]);

  return { items, loading, error, fetchFeatured };
}
