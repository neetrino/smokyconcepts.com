'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { apiClient } from '../../../../lib/api-client';
import { useDebouncedValue } from '../../../../lib/utils/use-debounced-value';
import { PRODUCTS_PAGE_LIMIT } from '../constants/productsList.constants';
import type { Product, ProductsResponse, StockFilter } from '../types';
import { getProductTotalStock, sortProductsClientSide } from '../utils/productsListSorting';

export type SortableProductField = 'price' | 'createdAt' | 'title' | 'stock';

interface UseAdminProductsListParams {
  /** Fetching starts only once an admin session is confirmed. */
  enabled: boolean;
  onError: (error: unknown) => void;
}

function matchesStockFilter(product: Product, stockFilter: StockFilter): boolean {
  if (stockFilter === 'all') {
    return true;
  }

  const totalStock = getProductTotalStock(product);
  return stockFilter === 'inStock' ? totalStock > 0 : totalStock === 0;
}

function getNextSort(field: SortableProductField, currentSort: string): string {
  const ascending = `${field}-asc`;
  return currentSort === ascending ? `${field}-desc` : ascending;
}

/**
 * Owns the admin products list: filters, paging, sorting and data fetching.
 *
 * Text filters are debounced so typing does not fire a request per keystroke,
 * and out-of-order responses are discarded so the newest query always wins.
 */
export function useAdminProductsList({ enabled, onError }: UseAdminProductsListParams) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<ProductsResponse['meta'] | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [skuSearch, setSkuSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('createdAt-desc');

  const debouncedSearch = useDebouncedValue(search);
  const debouncedSkuSearch = useDebouncedValue(skuSearch);
  const debouncedMinPrice = useDebouncedValue(minPrice);
  const debouncedMaxPrice = useDebouncedValue(maxPrice);

  const latestRequestIdRef = useRef(0);

  const buildRequestParams = useCallback((): Record<string, string> => {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: PRODUCTS_PAGE_LIMIT.toString(),
    };

    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }
    if (selectedCategories.size > 0) {
      params.category = Array.from(selectedCategories).join(',');
    }
    if (debouncedSkuSearch.trim()) {
      params.sku = debouncedSkuSearch.trim();
    }
    if (debouncedMinPrice.trim()) {
      params.minPrice = debouncedMinPrice.trim();
    }
    if (debouncedMaxPrice.trim()) {
      params.maxPrice = debouncedMaxPrice.trim();
    }
    if (sortBy.startsWith('createdAt')) {
      params.sort = sortBy;
    }

    return params;
  }, [
    debouncedMaxPrice,
    debouncedMinPrice,
    debouncedSearch,
    debouncedSkuSearch,
    page,
    selectedCategories,
    sortBy,
  ]);

  const fetchProducts = useCallback(async () => {
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;
    setLoading(true);

    try {
      const response = await apiClient.get<ProductsResponse>('/api/v1/admin/products', {
        params: buildRequestParams(),
      });

      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      setProducts(response.data || []);
      setMeta(response.meta || null);
    } catch (error: unknown) {
      if (requestId !== latestRequestIdRef.current) {
        return;
      }
      onError(error);
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [buildRequestParams, onError]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void fetchProducts();
  }, [enabled, fetchProducts]);

  const visibleProducts = useMemo(
    () =>
      sortProductsClientSide(
        products.filter((product) => matchesStockFilter(product, stockFilter)),
        sortBy,
      ),
    [products, sortBy, stockFilter],
  );

  const handleHeaderSort = useCallback((field: SortableProductField) => {
    setPage(1);
    setSortBy((current) => getNextSort(field, current));
  }, []);

  const clearFilters = useCallback(() => {
    setSearch('');
    setSkuSearch('');
    setSelectedCategories(new Set());
    setStockFilter('all');
    setPage(1);
  }, []);

  const hasActiveFilters =
    search.length > 0 || skuSearch.length > 0 || selectedCategories.size > 0 || stockFilter !== 'all';

  return {
    products,
    visibleProducts,
    loading,
    meta,
    page,
    setPage,
    search,
    setSearch,
    skuSearch,
    setSkuSearch,
    selectedCategories,
    setSelectedCategories,
    stockFilter,
    setStockFilter,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    sortBy,
    handleHeaderSort,
    clearFilters,
    hasActiveFilters,
    fetchProducts,
  };
}
