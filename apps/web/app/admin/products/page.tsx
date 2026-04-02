'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth/AuthContext';
import { apiClient } from '../../../lib/api-client';
import { useTranslation } from '../../../lib/i18n-client';
import { ProductFilters } from './components/ProductFilters';
import { ProductsTable } from './components/ProductsTable';
import { useProductHandlers } from './hooks/useProductHandlers';
import type { Product, ProductsResponse, Category } from './types';
import { ADMIN_CENTERED_LOADING_CLASS, ADMIN_PAGE_SHELL_CLASS } from '../constants/adminShell.constants';

export default function ProductsPage() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [skuSearch, setSkuSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'outOfStock'>('all');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<ProductsResponse['meta'] | null>(null);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt-desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [togglingAllFeatured, setTogglingAllFeatured] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn || !isAdmin) {
        router.push('/admin');
        return;
      }
    }
  }, [isLoggedIn, isAdmin, isLoading, router]);

  // Fetch categories on mount
  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchCategories();
    }
  }, [isLoggedIn, isAdmin]);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (categoriesExpanded && !target.closest('[data-category-dropdown]')) {
        setCategoriesExpanded(false);
      }
    };

    if (categoriesExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [categoriesExpanded]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      console.log('📂 [ADMIN] Fetching categories...');
      const response = await apiClient.get<{ data: Category[] }>('/api/v1/admin/categories');
      setCategories(response.data || []);
      console.log('✅ [ADMIN] Categories loaded:', response.data?.length || 0);
    } catch (err: any) {
      console.error('❌ [ADMIN] Error fetching categories:', err);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, isAdmin, page, search, selectedCategories, skuSearch, stockFilter, sortBy, minPrice, maxPrice]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '20',
      };
      
      if (search.trim()) {
        params.search = search.trim();
      }

      if (selectedCategories.size > 0) {
        params.category = Array.from(selectedCategories).join(',');
      }

      if (skuSearch.trim()) {
        params.sku = skuSearch.trim();
      }

      if (minPrice.trim()) {
        params.minPrice = minPrice.trim();
      }

      if (maxPrice.trim()) {
        params.maxPrice = maxPrice.trim();
      }

      if (sortBy && sortBy.startsWith('createdAt')) {
        params.sort = sortBy;
      }

      const response = await apiClient.get<ProductsResponse>('/api/v1/admin/products', {
        params,
      });
      
      let filteredProducts = response.data || [];

      // Stock filter (client-side)
      if (stockFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => {
          const getTotalStock = (p: Product) => {
            if (p.colorStocks && p.colorStocks.length > 0) {
              return p.colorStocks.reduce((sum, cs) => sum + (cs.stock || 0), 0);
            }
            return p.stock ?? 0;
          };
          const totalStock = getTotalStock(product);
          if (stockFilter === 'inStock') {
            return totalStock > 0;
          } else if (stockFilter === 'outOfStock') {
            return totalStock === 0;
          }
          return true;
        });
      }

      setProducts(filteredProducts);
      setMeta(response.meta || null);
    } catch (err: any) {
      console.error('❌ [ADMIN] Error fetching products:', err);
      alert(t('admin.products.errorLoading').replace('{message}', err.message || t('admin.common.unknownErrorFallback')));
    } finally {
      setLoading(false);
    }
  };

  // Client-side sorting for Product / Price / Stock columns
  const sortedProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    if (!sortBy || sortBy.startsWith('createdAt')) {
      return products;
    }

    const [field, directionRaw] = sortBy.split('-');
    const direction = directionRaw === 'asc' ? 1 : -1;

    console.log('📊 [ADMIN] Applying client-side sort:', { field, direction: directionRaw });

    const cloned = [...products];

    if (field === 'price') {
      cloned.sort((a, b) => {
        const aPrice = a.price ?? 0;
        const bPrice = b.price ?? 0;
        if (aPrice === bPrice) return 0;
        return aPrice > bPrice ? direction : -direction;
      });
    } else if (field === 'title') {
      cloned.sort((a, b) => {
        const aTitle = (a.title || '').toLowerCase();
        const bTitle = (b.title || '').toLowerCase();
        if (aTitle === bTitle) return 0;
        return aTitle > bTitle ? direction : -direction;
      });
    } else if (field === 'stock') {
      cloned.sort((a, b) => {
        const getTotalStock = (product: Product) => {
          if (product.colorStocks && product.colorStocks.length > 0) {
            return product.colorStocks.reduce((sum, cs) => sum + (cs.stock || 0), 0);
          }
          return product.stock ?? 0;
        };
        const aStock = getTotalStock(a);
        const bStock = getTotalStock(b);
        if (aStock === bStock) return 0;
        return aStock > bStock ? direction : -direction;
      });
    }

    return cloned;
  }, [products, sortBy]);

  const handleHeaderSort = (field: 'price' | 'createdAt' | 'title' | 'stock') => {
    setPage(1);

    setSortBy((current) => {
      let next = current;

      if (field === 'price') {
        if (current === 'price-asc') {
          next = 'price-desc';
        } else {
          next = 'price-asc';
        }
      }

      if (field === 'createdAt') {
        if (current === 'createdAt-asc') {
          next = 'createdAt-desc';
        } else {
          next = 'createdAt-asc';
        }
      }

      if (field === 'title') {
        if (current === 'title-asc') {
          next = 'title-desc';
        } else {
          next = 'title-asc';
        }
      }

      if (field === 'stock') {
        if (current === 'stock-asc') {
          next = 'stock-desc';
        } else {
          next = 'stock-asc';
        }
      }

      console.log('📊 [ADMIN] Sort changed from', current, 'to', next, 'by header click');
      return next;
    });
  };

  const handlers = useProductHandlers({
    products,
    setProducts,
    fetchProducts,
    selectedIds,
    setSelectedIds,
    setPage,
    setBulkDeleting,
    setTogglingAllFeatured,
  });

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategories(new Set());
    setSkuSearch('');
    setStockFilter('all');
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className={ADMIN_CENTERED_LOADING_CLASS}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">{t('admin.common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  return (
    <div className={ADMIN_PAGE_SHELL_CLASS}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="text-gray-600 hover:text-gray-900 mb-2 flex items-center text-sm"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('admin.products.backToAdmin')}
          </button>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('admin.products.title')}</h1>
            {(search || selectedCategories.size > 0 || skuSearch || stockFilter !== 'all') && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                {t('admin.products.clearAll')}
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="min-w-0">
            <ProductFilters
              search={search}
              setSearch={setSearch}
              skuSearch={skuSearch}
              setSkuSearch={setSkuSearch}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              categories={categories}
              categoriesLoading={categoriesLoading}
              categoriesExpanded={categoriesExpanded}
              setCategoriesExpanded={setCategoriesExpanded}
              stockFilter={stockFilter}
              setStockFilter={setStockFilter}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              selectedIds={selectedIds}
              handleSearch={handlers.handleSearch}
              handleBulkDelete={handlers.handleBulkDelete}
              handleClearFilters={handleClearFilters}
              bulkDeleting={bulkDeleting}
              setPage={setPage}
            />

            {/* Add New Product Button */}
            <div className="mb-6">
              <button
                onClick={() => router.push('/admin/products/add')}
                className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('admin.products.addNewProduct')}
              </button>
            </div>

            {/* Products Table */}
            <ProductsTable
              loading={loading}
              sortedProducts={sortedProducts}
              products={products}
              selectedIds={selectedIds}
              toggleSelect={handlers.toggleSelect}
              toggleSelectAll={handlers.toggleSelectAll}
              sortBy={sortBy}
              handleHeaderSort={handleHeaderSort}
              handleDeleteProduct={handlers.handleDeleteProduct}
              handleDuplicateProduct={handlers.handleDuplicateProduct}
              handleTogglePublished={handlers.handleTogglePublished}
              handleToggleFeatured={handlers.handleToggleFeatured}
              handleToggleUpcoming={handlers.handleToggleUpcoming}
              meta={meta}
              page={page}
              setPage={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
