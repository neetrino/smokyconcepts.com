'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/api-client';
import { CATALOG_PRODUCTS_FETCH_LIMIT } from '../../../lib/constants/products-catalog.constants';
import { getStoredLanguage } from '../../../lib/language';
import type { Category } from '../utils';

interface Product {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  categories?: Array<{ slug: string }>;
}

interface ProductsResponse {
  data: Product[];
  meta: {
    total: number;
  };
}

function pickFirstWithImage(products: Product[]): Product | null {
  if (products.length === 0) {
    return null;
  }
  return products.find((product) => Boolean(product.image)) ?? products[0] ?? null;
}

/**
 * One products list request → first product (with image) per category for nav icons.
 */
export function useCategoryProducts(categories: Category[]) {
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categories.length === 0) {
      setLoading(false);
      return;
    }

    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        const language = getStoredLanguage();
        const response = await apiClient.get<ProductsResponse>('/api/v1/products', {
          params: {
            limit: String(CATALOG_PRODUCTS_FETCH_LIMIT),
            lang: language,
          },
        });

        const allProducts = response.data ?? [];
        const mapping: Record<string, Product | null> = {
          all: pickFirstWithImage(allProducts),
        };

        for (const category of categories) {
          const inCategory = allProducts.filter((product) =>
            (product.categories ?? []).some((item) => item.slug === category.slug)
          );
          mapping[category.slug] = pickFirstWithImage(inCategory);
        }

        setCategoryProducts(mapping);
      } catch (err) {
        console.error('Error fetching category products:', err);
      } finally {
        setLoading(false);
      }
    };

    void fetchCategoryProducts();
  }, [categories]);

  return { categoryProducts, loading };
}
