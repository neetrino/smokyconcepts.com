'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { buildSizeCatalogPriceAmdByTitle } from './resolve-size-catalog-category-price-amd';

interface CollectionTreeNode {
  title?: string;
  priceAmd?: number;
  children?: CollectionTreeNode[];
}

function collectCollectionPriceRows(
  nodes: CollectionTreeNode[],
  rows: Array<{ title: string; priceAmd: number }>
): void {
  for (const node of nodes) {
    const title = typeof node.title === 'string' ? node.title.trim() : '';
    const priceAmd =
      typeof node.priceAmd === 'number' && Number.isFinite(node.priceAmd)
        ? Math.max(0, Math.round(node.priceAmd))
        : 0;
    if (title) {
      rows.push({ title, priceAmd });
    }
    if (node.children?.length) {
      collectCollectionPriceRows(node.children, rows);
    }
  }
}

/** Client-side AMD customize surcharge lookup by normalized collection title. */
export function useSizeCatalogPriceByTitle(): Map<string, number> {
  const [priceByTitle, setPriceByTitle] = useState<Map<string, number>>(() => new Map());

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiClient.get<{ data: CollectionTreeNode[] }>('/api/v1/categories/tree');
        if (cancelled) {
          return;
        }
        const rows: Array<{ title: string; priceAmd: number }> = [];
        collectCollectionPriceRows(Array.isArray(res.data) ? res.data : [], rows);
        setPriceByTitle(buildSizeCatalogPriceAmdByTitle(rows));
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
