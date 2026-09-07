'use client';

import { useEffect, useState } from 'react';
import { loadSizeCatalogCategories } from '@/lib/size-catalog-client-cache';
import { buildSizeCatalogPriceAmdByTitle } from './resolve-size-catalog-category-price-amd';

/** Client-side AMD customize surcharge lookup by normalized category title. */
export function useSizeCatalogPriceByTitle(): Map<string, number> {
  const [priceByTitle, setPriceByTitle] = useState<Map<string, number>>(() => new Map());

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const categories = await loadSizeCatalogCategories();
        if (cancelled) {
          return;
        }
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
