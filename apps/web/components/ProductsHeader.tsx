'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, Suspense } from 'react';
import { Button } from './ui/buttons';
import { useTranslation } from '../lib/i18n-client';

type ViewMode = 'list' | 'grid-2' | 'grid-3';
type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

interface ProductsHeaderProps {
  /**
   * Ընդհանուր ապրանքների քանակը՝ բոլոր էջերում (from API meta.total)
   */
  total: number;
  /**
   * Մի էջում ցուցադրվող ապրանքների քանակը (from API meta.limit)
   */
  perPage: number;
}

function ProductsHeaderContent({ total, perPage }: ProductsHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('grid-2');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const mobileSortDropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'default', label: t('products.header.sort.default') },
    { value: 'price-asc', label: t('products.header.sort.priceAsc') },
    { value: 'price-desc', label: t('products.header.sort.priceDesc') },
    { value: 'name-asc', label: t('products.header.sort.nameAsc') },
    { value: 'name-desc', label: t('products.header.sort.nameDesc') },
  ];

  // Derive current "show per page" value from URL or fallback to "all" (default)
  const limitFromUrl = searchParams.get('limit');
  const parsedLimit = limitFromUrl ? parseInt(limitFromUrl, 10) : null;
  // If limit is very large (>= 1000), treat as "all"
  // If no limit in URL, default to "all"
  const currentLimit = parsedLimit 
    ? (parsedLimit >= 1000 ? 'all' : parsedLimit)
    : 'all';

  const hasActiveFilters = (() => {
    const filterKeys = ['search', 'category', 'minPrice', 'maxPrice'];
    return filterKeys.some((key) => !!searchParams.get(key));
  })();

  // Load view mode from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('products-view-mode');
    if (stored && ['list', 'grid-2', 'grid-3'].includes(stored)) {
      setViewMode(stored as ViewMode);
    } else {
      // Default to grid-2 if nothing stored
      setViewMode('grid-2');
      localStorage.setItem('products-view-mode', 'grid-2');
    }
  }, []);

  // Load sort from URL params
  useEffect(() => {
    const sortParam = searchParams.get('sort') as SortOption;
    if (sortParam && sortOptions.some(opt => opt.value === sortParam)) {
      setSortBy(sortParam);
    }
  }, [searchParams]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isClickInsideDesktop = sortDropdownRef.current?.contains(target);
      const isClickInsideMobile = mobileSortDropdownRef.current?.contains(target);
      
      if (!isClickInsideDesktop && !isClickInsideMobile) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('products-view-mode', mode);
    // Dispatch event to update grid layout
    window.dispatchEvent(new CustomEvent('view-mode-changed', { detail: mode }));
  };

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
    setShowSortDropdown(false);
    
    // Update URL with sort parameter
    const params = new URLSearchParams(searchParams.toString());
    if (option === 'default') {
      params.delete('sort');
    } else {
      params.set('sort', option);
    }
    // Reset to page 1 when sorting changes
    params.delete('page');
    
    router.push(`/products?${params.toString()}`);
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    const filterKeys = ['search', 'category', 'minPrice', 'maxPrice'];

    filterKeys.forEach((key) => params.delete(key));
    // Reset page when filters are cleared
    params.delete('page');

    const queryString = params.toString();
    router.push(queryString ? `/products?${queryString}` : '/products');
  };

  const handleLimitChange = (value: string | number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === 'all' || value === 'All') {
      // For "all", set a very large limit (9999) or remove limit to show all
      params.set('limit', '9999');
    } else {
      const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
      if (!Number.isNaN(numValue)) {
        params.set('limit', numValue.toString());
      }
    }
    
    // Reset page when page size changes
    params.delete('page');

    router.replace(`/products?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
      {/* Desktop: All elements in one horizontal line */}
      <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
        {/* Left side: Clear filters + All products title */}
        <div className="flex items-center gap-4">
          {hasActiveFilters && (
            <Button
              type="button"
              variant="goldOutline"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{t('products.header.clearFilters')}</span>
            </Button>
          )}
          
          <h1 className="text-xl font-bold text-gray-900">
            {t('products.header.allProducts').replace('{total}', total.toString())}
          </h1>
        </div>

        {/* Right side: Show + View toggles + Sort */}
        <div className="flex items-center gap-4">
          {/* Show dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-900">{t('products.header.show')}</span>
            <select
              value={currentLimit === 'all' ? 'all' : currentLimit}
              onChange={(event) => handleLimitChange(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 min-w-[70px]"
            >
              <option value="all">{t('products.header.all')}</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          {/* View Mode Icons: List, Grid (2x2), and Grid (3x3) */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="icon"
              size="icon"
              onClick={() => handleViewModeChange('list')}
              className={viewMode === 'list' ? 'border-[#dcc090] bg-[#dcc090]/10' : ''}
              aria-label={t('products.header.viewModes.list')}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="3" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="3" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Button>
            <Button
              type="button"
              variant="icon"
              size="icon"
              onClick={() => handleViewModeChange('grid-2')}
              className={viewMode === 'grid-2' ? 'border-[#dcc090] bg-[#dcc090]/10' : ''}
              aria-label={t('products.header.viewModes.grid2')}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill={viewMode === 'grid-2' ? 'currentColor' : 'none'} />
                <rect x="11" y="2" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill={viewMode === 'grid-2' ? 'currentColor' : 'none'} />
                <rect x="2" y="11" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill={viewMode === 'grid-2' ? 'currentColor' : 'none'} />
                <rect x="11" y="11" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill={viewMode === 'grid-2' ? 'currentColor' : 'none'} />
              </svg>
            </Button>
            <Button
              type="button"
              variant="icon"
              size="icon"
              onClick={() => handleViewModeChange('grid-3')}
              className={viewMode === 'grid-3' ? 'border-[#dcc090] bg-[#dcc090]/10' : ''}
              aria-label={t('products.header.viewModes.grid3')}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="4" cy="4" r="1.5" fill="currentColor" />
                <circle cx="10" cy="4" r="1.5" fill="currentColor" />
                <circle cx="16" cy="4" r="1.5" fill="currentColor" />
                <circle cx="4" cy="10" r="1.5" fill="currentColor" />
                <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                <circle cx="16" cy="10" r="1.5" fill="currentColor" />
                <circle cx="4" cy="16" r="1.5" fill="currentColor" />
                <circle cx="10" cy="16" r="1.5" fill="currentColor" />
                <circle cx="16" cy="16" r="1.5" fill="currentColor" />
              </svg>
            </Button>
          </div>

          {/* Sort dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <Button
              type="button"
              variant="goldOutline"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="min-w-[160px] justify-between"
            >
              <span>{sortOptions.find(opt => opt.value === sortBy)?.label || t('products.header.sort.default')}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`}>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>

            {showSortDropdown && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                {sortOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant="ghost"
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full justify-start rounded-none ${sortBy === option.value ? 'bg-[#dcc090]/10 font-semibold' : ''}`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Stacked layout */}
      <div className="sm:hidden flex flex-col gap-4">
        {/* Top: All Products Title + Show dropdown */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">
            {t('products.header.allProducts').replace('{total}', total.toString())}
          </h1>
          
          {/* Show dropdown - Top right */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">{t('products.header.show')}</span>
            <select
              value={currentLimit === 'all' ? 'all' : currentLimit}
              onChange={(event) => handleLimitChange(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="all">{t('products.header.all')}</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Bottom: Filters button + View Mode Icons + Sort */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Filters button */}
          <Button
            type="button"
            variant="goldOutline"
            onClick={() => window.dispatchEvent(new Event('mobile:filters-toggle'))}
            className="inline-flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <line x1="3" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>{t('products.header.filters')}</span>
          </Button>

          {/* Right: View Mode Icons + Sort */}
          <div className="flex items-center gap-2">
            {/* View Mode Icons */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="icon"
                size="icon"
                onClick={() => handleViewModeChange('list')}
                className={viewMode === 'list' ? 'border-[#dcc090] bg-[#dcc090]/10' : ''}
                aria-label={t('products.header.viewModes.list')}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <line x1="3" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="3" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </Button>
              <Button
                type="button"
                variant="icon"
                size="icon"
                onClick={() => handleViewModeChange('grid-2')}
                className={viewMode === 'grid-2' ? 'border-[#dcc090] bg-[#dcc090]/10' : ''}
                aria-label={t('products.header.viewModes.grid2')}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="2" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill={viewMode === 'grid-2' ? 'currentColor' : 'none'} />
                  <rect x="11" y="2" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill={viewMode === 'grid-2' ? 'currentColor' : 'none'} />
                  <rect x="2" y="11" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill={viewMode === 'grid-2' ? 'currentColor' : 'none'} />
                  <rect x="11" y="11" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill={viewMode === 'grid-2' ? 'currentColor' : 'none'} />
                </svg>
              </Button>
            </div>

            {/* Sort icon */}
            <div className="relative" ref={mobileSortDropdownRef}>
              <Button
                type="button"
                variant="icon"
                size="icon"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                aria-label={t('products.header.sortProducts')}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M7 8L10 5L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M7 12L10 15L13 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </Button>

              {showSortDropdown && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                  {sortOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant="ghost"
                      onClick={() => handleSortChange(option.value)}
                      className={`w-full justify-start rounded-none ${sortBy === option.value ? 'bg-[#dcc090]/10 font-semibold' : ''}`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductsHeader(props: ProductsHeaderProps) {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
        <div className="flex justify-end items-center">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    }>
      <ProductsHeaderContent {...props} />
    </Suspense>
  );
}

