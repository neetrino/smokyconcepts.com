'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { SizeCatalogCategoryDto } from '@/lib/types/size-catalog';
import { buildSizeCatalogPriceAmdByTitle } from './resolve-size-catalog-category-price-amd';

/** Client-side AMD customize surcharge lookup by normalized category title. */
export function useSizeCatalogPriceByTitle(): Map<string, number> {
  const [priceByTitle, setPriceByTitle] = useState<Map<string, number>>(() => new Map());

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiClient.get<{ data: SizeCatalogCategoryDto[] }>('/api/v1/size-catalog');
        if (cancelled) {
          return;
        }
        const categories = res.data ?? [];
        setPriceByTitle(
          buildSizeCatalogPriceAmdByTitle(
            categories.map((category) => ({
              title: category.title,
              priceAmd: category.priceAmd,
            }))
          )
        );
      } catch {
        if (!cancelled) {
          setPriceByTitle(new Map());
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return priceByTitle;
}
