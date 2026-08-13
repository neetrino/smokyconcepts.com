'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import { PRODUCT_FILTERS_DROPDOWN_LAYER_CLASS } from '../constants/productFilters.constants';
import type { Category } from '../types';

interface ProductFiltersProps {
  search: string;
  setSearch: (search: string) => void;
  skuSearch: string;
  setSkuSearch: (sku: string) => void;
  selectedCategories: Set<string>;
  setSelectedCategories: (categories: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  categories: Category[];
  categoriesLoading: boolean;
  categoriesExpanded: boolean;
  setCategoriesExpanded: (expanded: boolean) => void;
  stockFilter: 'all' | 'inStock' | 'outOfStock';
  setStockFilter: (filter: 'all' | 'inStock' | 'outOfStock') => void;
  minPrice: string;
  setMinPrice: (price: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  setPage: (page: number | ((prev: number) => number)) => void;
}

export function ProductFilters({
  search,
  setSearch,
  skuSearch,
  setSkuSearch,
  selectedCategories,
  setSelectedCategories,
  categories,
  categoriesLoading,
  categoriesExpanded,
  setCategoriesExpanded,
  stockFilter,
  setStockFilter,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  setPage,
}: ProductFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className={`relative space-y-4 mb-6 ${categoriesExpanded ? PRODUCT_FILTERS_DROPDOWN_LAYER_CLASS : ''}`}>
      {/* Search Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[#414141]/75 mb-1.5">
            {t('admin.products.searchByTitleOrSlug')}
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setPage(1);
              }
            }}
            placeholder={t('admin.products.searchPlaceholder')}
            className="w-full px-4 py-2.5 border border-[#dcc090]/35 rounded-md focus:outline-none focus:ring-2 focus:ring-[#dcc090] focus:border-[#dcc090] text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[#414141]/75 mb-1.5">
            {t('admin.products.searchBySku')}
          </label>
          <input
            type="text"
            value={skuSearch}
            onChange={(e) => {
              setSkuSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t('admin.products.skuPlaceholder')}
            className="w-full px-4 py-2.5 border border-[#dcc090]/35 rounded-md focus:outline-none focus:ring-2 focus:ring-[#dcc090] focus:border-[#dcc090] text-sm"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-[#414141]/75 mb-1.5">
            {t('admin.products.filterByCategory')}
          </label>
          <div
            className={`relative ${categoriesExpanded ? PRODUCT_FILTERS_DROPDOWN_LAYER_CLASS : ''}`}
            data-category-dropdown
          >
            <button
              type="button"
              onClick={() => setCategoriesExpanded(!categoriesExpanded)}
              className="w-full px-4 py-2.5 text-left border border-[#dcc090]/35 rounded-md focus:outline-none focus:ring-2 focus:ring-[#dcc090] focus:border-[#dcc090] bg-white text-sm flex items-center justify-between"
            >
              <span className="text-[#414141]/75">
                {selectedCategories.size === 0
                  ? t('admin.products.allCategories')
                  : selectedCategories.size === 1
                  ? categories.find(c => selectedCategories.has(c.id))?.title || '1 category'
                  : `${selectedCategories.size} categories`}
              </span>
              <svg
                  className={`w-4 h-4 text-[#414141]/55 transition-transform duration-200 ${
                  categoriesExpanded ? 'transform rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {categoriesExpanded && (
              <div className={`absolute ${PRODUCT_FILTERS_DROPDOWN_LAYER_CLASS} w-full mt-1 bg-white border border-[#dcc090]/35 rounded-md shadow-lg max-h-60 overflow-y-auto`}>
                {categoriesLoading ? (
                  <div className="p-3 text-sm text-[#414141]/60 text-center">{t('admin.products.loadingCategories')}</div>
                ) : categories.length === 0 ? (
                  <div className="p-3 text-sm text-[#414141]/60 text-center">{t('admin.products.noCategoriesAvailable')}</div>
                ) : (
                  <div className="p-2">
                    <div className="space-y-1">
                      <label className="flex items-center space-x-2 cursor-pointer hover:bg-[#dcc090]/10 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedCategories.size === 0}
                          onChange={() => {
                            setSelectedCategories(new Set());
                            setPage(1);
                          }}
                          className="w-4 h-4 text-[#122a26] border-[#dcc090]/40 rounded focus:ring-[#dcc090]"
                        />
                        <span className="text-sm text-[#414141]/75">{t('admin.products.allCategories')}</span>
                      </label>
                      {categories.map((category) => (
                        <label
                          key={category.id}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-[#dcc090]/10 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.has(category.id)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedCategories);
                              if (e.target.checked) {
                                newSelected.add(category.id);
                              } else {
                                newSelected.delete(category.id);
                              }
                              setSelectedCategories(newSelected);
                              setPage(1);
                            }}
                            className="w-4 h-4 text-[#122a26] border-[#dcc090]/40 rounded focus:ring-[#dcc090]"
                          />
                          <span className="text-sm text-[#414141]/75">{category.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Stock Filter */}
        <div>
          <label className="block text-sm font-medium text-[#414141]/75 mb-1.5">
            {t('admin.products.filterByStock')}
          </label>
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value as 'all' | 'inStock' | 'outOfStock');
              setPage(1);
            }}
            className="w-full px-4 py-2.5 border border-[#dcc090]/35 rounded-md focus:outline-none focus:ring-2 focus:ring-[#dcc090] focus:border-[#dcc090] bg-white text-sm"
          >
            <option value="all">{t('admin.products.allProducts')}</option>
            <option value="inStock">{t('admin.products.inStock')}</option>
            <option value="outOfStock">{t('admin.products.outOfStock')}</option>
          </select>
        </div>
      </div>

    </div>
  );
}






