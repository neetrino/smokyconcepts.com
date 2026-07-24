'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Input } from '@shop/ui';

import { apiClient } from '@/lib/api-client';
import { useTranslation } from '@/lib/i18n-client';

import type { VotingFormData } from '../types';

const ALL_CATEGORIES_VALUE = '__all__';
const ADMIN_PRODUCTS_PAGE_SIZE = 100;

interface VotingPickerProduct {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  categories: string[];
  published: boolean;
}

interface AdminProductsResponse {
  data: VotingPickerProduct[];
  meta?: {
    totalPages?: number;
  };
}

interface VotingFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  formData: VotingFormData;
  saving: boolean;
  onClose: () => void;
  onFormDataChange: (data: VotingFormData) => void;
  onSubmit: () => Promise<void>;
}

export function VotingFormModal({
  isOpen,
  mode,
  formData,
  saving,
  onClose,
  onFormDataChange,
  onSubmit,
}: VotingFormModalProps) {
  const { t } = useTranslation();
  const [products, setProducts] = useState<VotingPickerProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsLoadError, setProductsLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES_VALUE);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsLoadError(null);
    try {
      const mergedProducts: VotingPickerProduct[] = [];
      let page = 1;
      let totalPages = 1;

      do {
        const response = await apiClient.get<AdminProductsResponse>('/api/v1/admin/products', {
          params: {
            page: String(page),
            limit: String(ADMIN_PRODUCTS_PAGE_SIZE),
          },
        });

        const responseRows = Array.isArray(response?.data) ? response.data : [];
        responseRows.forEach((row) => {
          const slug = row.slug?.trim();
          const title = row.title?.trim();
          if (!slug || !title) {
            return;
          }

          mergedProducts.push({
            id: row.id,
            slug,
            title,
            image: row.image?.trim() || null,
            categories: Array.isArray(row.categories)
              ? row.categories.map((item) => item.trim()).filter(Boolean)
              : [],
            published: row.published === true,
          });
        });

        totalPages = Math.max(1, response?.meta?.totalPages ?? 1);
        page += 1;
      } while (page <= totalPages);

      const uniqueProducts = new Map<string, VotingPickerProduct>();
      mergedProducts.forEach((product) => {
        if (product.published && !uniqueProducts.has(product.id)) {
          uniqueProducts.set(product.id, product);
        }
      });
      setProducts(Array.from(uniqueProducts.values()));
    } catch {
      setProducts([]);
      setProductsLoadError(t('admin.voting.productsLoadError'));
    } finally {
      setProductsLoading(false);
    }
  }, [t]);

  const selectedProduct = products.find(
    (product) => product.slug.toLowerCase() === formData.productSlug.trim().toLowerCase(),
  );
  const categoryOptions = useMemo(() => {
    const unique = new Set<string>();
    products.forEach((product) => {
      product.categories.forEach((category) => {
        unique.add(category);
      });
    });
    return [ALL_CATEGORIES_VALUE, ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [products]);
  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return products
      .filter((product) => {
        if (
          selectedCategory !== ALL_CATEGORIES_VALUE &&
          !product.categories.some((category) => category === selectedCategory)
        ) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        return (
          product.title.toLowerCase().includes(normalizedQuery) ||
          product.slug.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [products, searchQuery, selectedCategory]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    fetchProducts().catch(() => undefined);
  }, [fetchProducts, isOpen]);

  const handleSelectProduct = (product: VotingPickerProduct) => {
    onFormDataChange({
      ...formData,
      title: product.title,
      productSlug: product.slug,
      imageUrls: product.image ? [product.image] : [],
    });
  };

  const isCreateMode = mode === 'create';

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          {isCreateMode ? t('admin.voting.addChoice') : t('admin.voting.editChoice')}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('admin.voting.selectedProduct')} *
            </label>
            {selectedProduct ? (
              <div className="flex items-center gap-3 rounded-lg border border-[#dcc090]/30 bg-[#dcc090]/10 p-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-[#dcc090]/35 bg-white">
                  {selectedProduct.image ? (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                      {t('admin.voting.noImage')}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#122a26]">
                    {selectedProduct.title}
                  </p>
                  <p className="truncate text-xs text-gray-600">{selectedProduct.slug}</p>
                </div>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-[#dcc090]/45 bg-[#dcc090]/10 px-3 py-2 text-sm text-gray-600">
                {t('admin.voting.noProductSelected')}
              </p>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs text-gray-500">{t('admin.voting.chooseProductHint')}</p>
            <div className="grid gap-3 sm:grid-cols-[16rem_minmax(0,1fr)]">
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                disabled={saving || productsLoading}
                className="h-11 w-full rounded-md border border-[#dcc090]/35 bg-white px-3 text-sm text-[#122a26] outline-none focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30"
              >
                <option value={ALL_CATEGORIES_VALUE}>{t('admin.voting.allCategories')}</option>
                {categoryOptions
                  .filter((value) => value !== ALL_CATEGORIES_VALUE)
                  .map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t('admin.voting.productSearchPlaceholder')}
                disabled={saving || productsLoading}
              />
            </div>
          </div>

          {productsLoadError ? <p className="text-sm text-red-600">{productsLoadError}</p> : null}

          {productsLoading ? (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#dcc090]/25 p-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-36 animate-pulse rounded-lg bg-[#f5f5f5]" />
              ))}
            </div>
          ) : (
            <div className="max-h-[26rem] overflow-y-auto rounded-lg border border-[#dcc090]/25 p-3">
              {filteredProducts.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-600">{t('admin.voting.noProductsFound')}</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {filteredProducts.map((product) => {
                    const isActive =
                      product.slug.toLowerCase() === formData.productSlug.trim().toLowerCase();
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleSelectProduct(product)}
                        className={`rounded-lg border p-2 text-left transition-colors ${
                          isActive
                            ? 'border-[#122a26] bg-[#122a26]/5'
                            : 'border-[#dcc090]/25 hover:border-[#dcc090]'
                        }`}
                        disabled={saving}
                      >
                        <div className="h-24 overflow-hidden rounded-md border border-[#dcc090]/20 bg-[#f5f5f5]">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                              {t('admin.voting.noImage')}
                            </div>
                          )}
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm font-semibold text-[#122a26]">
                          {product.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-500">{product.slug}</p>
                        <p className="mt-1 text-[11px] font-medium text-[#414141]/70">
                          {isActive ? t('admin.voting.selected') : t('admin.voting.selectForVoting')}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            variant="primary"
            onClick={() => onSubmit()}
            disabled={saving || productsLoading || !formData.productSlug.trim()}
            className="flex-1"
          >
            {saving
              ? isCreateMode
                ? t('admin.voting.creating')
                : t('admin.voting.updating')
              : isCreateMode
                ? t('admin.voting.createChoice')
                : t('admin.voting.updateChoice')}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving || productsLoading}>
            {t('admin.common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}
