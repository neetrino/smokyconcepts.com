'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api-client';
import { getStoredLanguage, type LanguageCode } from '../../lib/language';
import { CATALOG_SECTION_PAGE_SIZE } from '../../app/products/components/catalogProductLabels';

interface RelatedProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  originalPrice?: number | null;
  compareAtPrice: number | null;
  discountPercent?: number | null;
  image: string | null;
  images?: string[];
  inStock: boolean;
  brand?: {
    id: string;
    name: string;
  } | null;
  categories?: Array<{
    id: string;
    slug: string;
    title: string;
  }>;
  skus?: string[];
  variants?: Array<{
    options?: Array<{
      key: string;
      value: string;
    }>;
  }>;
}

interface UseRelatedProductsProps {
  categorySlug?: string;
  currentProductId: string;
  language: LanguageCode;
}

/**
 * Fetches related products for the PDP — same page size as the catalog horizontal row (6).
 */
export function useRelatedProducts({ categorySlug, currentProductId, language }: UseRelatedProductsProps) {
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);

        const params: Record<string, string> = {
          limit: String(CATALOG_SECTION_PAGE_SIZE + 8),
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

        const filtered = response.data.filter((p) => p.id !== currentProductId);
        setProducts(filtered.slice(0, CATALOG_SECTION_PAGE_SIZE));
      } catch (error) {
        console.error('[RelatedProducts] Error fetching related products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [categorySlug, currentProductId, language]);

  return { products, loading };
}
