'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { getStoredLanguage } from '@/lib/language';
import { normalizeSizeCatalogCategoryTitleKey } from '@/lib/size-catalog/resolve-size-catalog-category-price-amd';
import type { CollectionLivePriceMaps } from './resolve-product-collection-price-amd';

interface CollectionTreeNode {
  id?: string;
  title?: string;
  priceAmd?: number;
  children?: CollectionTreeNode[];
}

function toAmd(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.round(value));
}

function collectLivePrices(nodes: CollectionTreeNode[], maps: CollectionLivePriceMaps): void {
  const byId = maps.byId ?? new Map<string, number>();
  const byTitle = maps.byTitle ?? new Map<string, number>();
  maps.byId = byId;
  maps.byTitle = byTitle;

  for (const node of nodes) {
    const priceAmd = toAmd(node.priceAmd);
    const id = typeof node.id === 'string' ? node.id.trim() : '';
    if (id !== '' && (byId.get(id) ?? 0) < priceAmd) {
      byId.set(id, priceAmd);
    }
    const titleKey = normalizeSizeCatalogCategoryTitleKey(node.title);
    if (titleKey !== '' && (byTitle.get(titleKey) ?? 0) < priceAmd) {
      byTitle.set(titleKey, priceAmd);
    }
    if (node.children?.length) {
      collectLivePrices(node.children, maps);
    }
  }
}

const EMPTY_LIVE_PRICES: CollectionLivePriceMaps = {
  byId: new Map(),
  byTitle: new Map(),
};

/** Live collection prices from the public category tree. */
export function useCollectionPrices(): CollectionLivePriceMaps {
  const [prices, setPrices] = useState<CollectionLivePriceMaps>(EMPTY_LIVE_PRICES);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiClient.get<{ data: CollectionTreeNode[] }>(
          '/api/v1/categories/tree',
          { params: { lang: getStoredLanguage() } }
        );
        if (cancelled) {
          return;
        }
        const maps: CollectionLivePriceMaps = { byId: new Map(), byTitle: new Map() };
        collectLivePrices(Array.isArray(res.data) ? res.data : [], maps);
        setPrices(maps);
      } catch {
        if (!cancelled) {
          setPrices(EMPTY_LIVE_PRICES);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return prices;
}
