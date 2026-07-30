'use client';

import { useState, useEffect, useLayoutEffect } from 'react';
import { apiClient } from '../../lib/api-client';
import { type LanguageCode } from '../../lib/language';
import {
  getRelatedProductsCache,
  setRelatedProductsCache,
  type RelatedProductCacheItem,
} from '../../lib/related-products-cache';
import { preloadCatalogProductImages } from '../../lib/home/catalog-product-image-cache';

const RELATED_PRODUCTS_MAX = 12;

type RelatedProduct = RelatedProductCacheItem;

interface UseRelatedProductsProps {
  categorySlug?: string;
  currentProductId: string;
  language: LanguageCode;
}

function pickRelatedProducts(
  items: RelatedProduct[],
  currentProductId: string
): RelatedProduct[] {
  return items.filter((product) => product.id !== currentProductId).slice(0, RELATED_PRODUCTS_MAX);
}

/**
 * Fetches related products for the PDP — cap list to 12 items.
 * Hydrates from session cache before paint so reload shows the strip immediately.
 */
export function useRelatedProducts({ categorySlug, currentProductId, language }: UseRelatedProductsProps) {
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    const cached = getRelatedProductsCache(categorySlug, language);
    if (!cached) {
      return;
    }

    const cachedPick = pickRelatedProducts(cached, currentProductId);
    if (cachedPick.length === 0) {
      return;
    }

    setProducts(cachedPick);
    setLoading(false);
    void preloadCatalogProductImages(cachedPick);
  }, [categorySlug, currentProductId, language]);

  useEffect(() => {
    let cancelled = false;

    const cached = getRelatedProductsCache(categorySlug, language);
    const hasFreshCache =
      Boolean(cached) && pickRelatedProducts(cached!, currentProductId).length > 0;

    if (!hasFreshCache) {
      setLoading(true);
    }

    const fetchRelatedProducts = async () => {
      try {
        const params: Record<string, string> = {
          limit: String(RELATED_PRODUCTS_MAX + 8),
          lang: language,
        };

        if (categorySlug) {
          params.category = categorySlug;
        }

        const response = await apiClient.get<{
          data: RelatedProduct[];
          meta: {
            total: number;
          };
        }>('/api/v1/products', {
          params,
        });

        if (cancelled) {
          return;
        }

        setRelatedProductsCache(categorySlug, language, response.data);
        const filtered = pickRelatedProducts(response.data, currentProductId);
        setProducts(filtered);
        void preloadCatalogProductImages(filtered);
      } catch (error) {
        if (cancelled) {
          return;
        }
        console.error('[RelatedProducts] Error fetching related products:', error);
        if (!hasFreshCache) {
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchRelatedProducts();

    return () => {
      cancelled = true;
    };
  }, [categorySlug, currentProductId, language]);

  return { products, loading };
}
