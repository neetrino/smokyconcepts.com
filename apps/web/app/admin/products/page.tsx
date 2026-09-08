'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth/AuthContext';
import { apiClient } from '../../../lib/api-client';
import { useTranslation } from '../../../lib/i18n-client';
import { ProductFilters } from './components/ProductFilters';
import { ProductsTable } from './components/ProductsTable';
import { BulkSelectionControls } from '../orders/components/BulkSelectionControls';
import { useProductHandlers } from './hooks/useProductHandlers';
import { useAdminProductsList } from './hooks/useAdminProductsList';
import type { Category } from './types';
import { AdminShell } from '../components/AdminShell';
import { ADMIN_CENTERED_LOADING_CLASS, ADMIN_PAGE_SHELL_CLASS } from '../constants/adminShell.constants';

export default function ProductsPage() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const isAdminSession = Boolean(isLoggedIn && isAdmin);

  const handleListError = useCallback(
    (error: unknown) => {
      const message = error instanceof Error ? error.message : t('admin.common.unknownErrorFallback');
      alert(t('admin.products.errorLoading').replace('{message}', message));
    },
    [t],
  );

  const list = useAdminProductsList({ enabled: isAdminSession, onError: handleListError });

  useEffect(() => {
    if (!isLoading && !isAdminSession) {
      router.push('/supersudo');
    }
  }, [isAdminSession, isLoading, router]);

  useEffect(() => {
    if (!isAdminSession) {
      return;
    }

    let cancelled = false;

    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await apiClient.get<{ data: Category[] }>('/api/v1/admin/categories');
        if (!cancelled) {
          setCategories(response.data || []);
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    };

    void fetchCategories();

    return () => {
      cancelled = true;
    };
  }, [isAdminSession]);

  // Close category dropdown when clicking outside
  useEffect(() => {
    if (!categoriesExpanded) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-category-dropdown]')) {
        setCategoriesExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [categoriesExpanded]);

  const handlers = useProductHandlers({
    products: list.visibleProducts,
    fetchProducts: list.fetchProducts,
    selectedIds,
    setSelectedIds,
    setBulkDeleting,
  });

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

  if (!isAdminSession) {
    return null;
  }

  return (
    <div className={ADMIN_PAGE_SHELL_CLASS}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <AdminShell>
          {list.hasActiveFilters && (
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={list.clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                {t('admin.products.clearAll')}
              </button>
            </div>
          )}

            <ProductFilters
              search={list.search}
              setSearch={list.setSearch}
              skuSearch={list.skuSearch}
              setSkuSearch={list.setSkuSearch}
              selectedCategories={list.selectedCategories}
              setSelectedCategories={list.setSelectedCategories}
              categories={categories}
              categoriesLoading={categoriesLoading}
              categoriesExpanded={categoriesExpanded}
              setCategoriesExpanded={setCategoriesExpanded}
              stockFilter={list.stockFilter}
              setStockFilter={list.setStockFilter}
              minPrice={list.minPrice}
              setMinPrice={list.setMinPrice}
              maxPrice={list.maxPrice}
              setMaxPrice={list.setMaxPrice}
              setPage={list.setPage}
            />

            {/* Add New Product Button */}
            <div className="mb-6">
              <button
                onClick={() => router.push('/supersudo/products/add')}
                className="w-full px-4 py-3 bg-[#122a26] text-[#dcc090] rounded-lg hover:bg-[#18352f] transition-colors flex items-center justify-center gap-2 font-medium text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('admin.products.addNewProduct')}
              </button>
            </div>

            <BulkSelectionControls
              selectedCount={selectedIds.size}
              onBulkDelete={handlers.handleBulkDelete}
              bulkDeleting={bulkDeleting}
              selectedLabel={t('admin.products.selectedProducts').replace('{count}', selectedIds.size.toString())}
              deleteLabel={t('admin.products.deleteSelected')}
              deletingLabel={t('admin.products.deleting')}
            />

            {/* Products Table */}
            <ProductsTable
              loading={list.loading}
              products={list.visibleProducts}
              selectedIds={selectedIds}
              toggleSelect={handlers.toggleSelect}
              toggleSelectAll={handlers.toggleSelectAll}
              sortBy={list.sortBy}
              handleHeaderSort={list.handleHeaderSort}
              handleDeleteProduct={handlers.handleDeleteProduct}
              handleDuplicateProduct={handlers.handleDuplicateProduct}
              handleTogglePublished={handlers.handleTogglePublished}
              handleToggleFeatured={handlers.handleToggleFeatured}
              handleToggleUpcoming={handlers.handleToggleUpcoming}
              meta={list.meta}
              page={list.page}
              setPage={list.setPage}
            />
        </AdminShell>
      </div>
    </div>
  );
}
