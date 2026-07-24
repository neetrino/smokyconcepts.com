'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Input } from '@shop/ui';

import { apiClient } from '@/lib/api-client';
import { useTranslation } from '@/lib/i18n-client';

import type { VotingFormData } from '../types';

const ALL_CATEGORIES_VALUE = '__all__';
const ALL_PUBLISH_STATUSES_VALUE = '__all__';
const PUBLISH_FILTER_ACTIVE = 'active';
const PUBLISH_FILTER_DRAFT = 'draft';
const ADMIN_PRODUCTS_PAGE_SIZE = 100;

const VOTING_PRODUCT_FILTER_SELECT_CLASS_NAME =
  'h-11 w-full rounded-md border border-[#dcc090]/35 bg-white px-3 text-sm text-[#122a26] outline-none focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30';

const VOTING_MODAL_CLOSE_BUTTON_CLASS_NAME =
  'flex size-9 shrink-0 items-center justify-center rounded-md text-[#414141]/70 transition hover:bg-[#efefef] hover:text-[#122a26] disabled:cursor-not-allowed disabled:opacity-50';

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
  const [selectedPublishStatus, setSelectedPublishStatus] = useState(ALL_PUBLISH_STATUSES_VALUE);

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
        if (!uniqueProducts.has(product.id)) {
          uniqueProducts.set(product.id, product);
        }
      });
      setProducts(
        Array.from(uniqueProducts.values()).sort((a, b) => {
          if (a.published !== b.published) {
            return a.published ? -1 : 1;
          }
          return a.title.localeCompare(b.title);
        }),
      );
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

        if (selectedPublishStatus === PUBLISH_FILTER_ACTIVE && !product.published) {
          return false;
        }

        if (selectedPublishStatus === PUBLISH_FILTER_DRAFT && product.published) {
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
  }, [products, searchQuery, selectedCategory, selectedPublishStatus]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedCategory(ALL_CATEGORIES_VALUE);
      setSelectedPublishStatus(ALL_PUBLISH_STATUSES_VALUE);
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

  const modalTitle = isCreateMode ? t('admin.voting.addChoice') : t('admin.voting.editChoice');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={saving || productsLoading ? undefined : onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="voting-form-modal-title"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 id="voting-form-modal-title" className="text-lg font-semibold text-gray-900">
            {modalTitle}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={saving || productsLoading}
            className={VOTING_MODAL_CLOSE_BUTTON_CLASS_NAME}
            aria-label={t('admin.common.close')}
          >
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-[#122a26]">
                      {selectedProduct.title}
                    </p>
                    {!selectedProduct.published ? (
                      <span className="shrink-0 rounded-full bg-[#414141]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#414141]">
                        {t('admin.products.draft')}
                      </span>
                    ) : null}
                  </div>
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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[12rem_11rem_minmax(0,1fr)]">
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                disabled={saving || productsLoading}
                className={VOTING_PRODUCT_FILTER_SELECT_CLASS_NAME}
                aria-label={t('admin.voting.allCategories')}
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
              <select
                value={selectedPublishStatus}
                onChange={(event) => setSelectedPublishStatus(event.target.value)}
                disabled={saving || productsLoading}
                className={VOTING_PRODUCT_FILTER_SELECT_CLASS_NAME}
                aria-label={t('admin.voting.allPublishStatuses')}
              >
                <option value={ALL_PUBLISH_STATUSES_VALUE}>{t('admin.voting.allPublishStatuses')}</option>
                <option value={PUBLISH_FILTER_ACTIVE}>{t('admin.products.published')}</option>
                <option value={PUBLISH_FILTER_DRAFT}>{t('admin.products.draft')}</option>
              </select>
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t('admin.voting.productSearchPlaceholder')}
                disabled={saving || productsLoading}
                className="sm:col-span-2 lg:col-span-1"
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
                        {!product.published ? (
                          <span className="mt-1 inline-block rounded-full bg-[#414141]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#414141]">
                            {t('admin.products.draft')}
                          </span>
                        ) : null}
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
