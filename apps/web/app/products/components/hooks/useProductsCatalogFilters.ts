'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getStoredLanguage, type LanguageCode } from '../../../../lib/language';
import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';
import { preloadSizeCatalogCategories } from '@/lib/size-catalog-image-cache';
import { loadSizeCatalogCategories } from '@/lib/size-catalog-client-cache';
import {
  CATALOG_SELECT_SIZE_AUTOOPEN_QUERY,
  CATALOG_SELECT_SIZE_AUTOOPEN_VALUE,
} from '@/lib/constants/products-catalog.constants';
import {
  type CatalogProduct,
  filterSizeCatalogByProducts,
  getProductSectionLabels,
  getColorLabel,
  productMatchesCategoryFilter,
  productMatchesSizeFilter,
  resolveSectionLabelFromCollectionValue,
} from '../catalogProductLabels';
import {
  catalogSizeQueryFromItem,
  resolveCatalogItemId,
} from '../catalogSizeFilterDraft';
import { SECTION_ORDER } from '../productsCatalogView.constants';
import { sortProducts } from '../productsCatalogView.helpers';
import type { SortOption } from '../productsCatalogView.types';

export function useProductsCatalogFilters(products: CatalogProduct[]) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [catalogSizeModalOpen, setCatalogSizeModalOpen] = useState(false);
  const [pendingSelectSizeAutopen, setPendingSelectSizeAutopen] = useState(false);
  const [sizeCatalogCategories, setSizeCatalogCategories] = useState<SizeCatalogCategoryDto[]>([]);
  const [sizeCatalogReady, setSizeCatalogReady] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [catalogSizeFromMobileFilter, setCatalogSizeFromMobileFilter] = useState(false);
  const [mobilePendingSize, setMobilePendingSize] = useState('all');
  const [mobilePendingSizeCat, setMobilePendingSizeCat] = useState('');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') ?? 'all');
  /** Optimistic with `selectedSize` so filter does not flash empty before URL `sizeCat` catches up. */
  const [selectedSizeCatalogCategoryId, setSelectedSizeCatalogCategoryId] = useState(
    searchParams.get('sizeCat')?.trim() ?? ''
  );

  const selectedCollection = searchParams.get('category') ?? 'all';
  const selectedColor = searchParams.get('color') ?? 'all';
  const selectedSort = (searchParams.get('sort') as SortOption | null) ?? 'default';

  const selectedSizeCatalogCategoryTitle = useMemo(() => {
    const id = selectedSizeCatalogCategoryId.trim();
    if (!id) {
      return null;
    }
    for (const category of sizeCatalogCategories) {
      const hit = category.items.find((item) => item.categoryId === id);
      if (hit?.categoryTitle?.trim()) {
        return hit.categoryTitle.trim();
      }
    }
    return null;
  }, [sizeCatalogCategories, selectedSizeCatalogCategoryId]);

  const selectedSectionTitle = resolveSectionLabelFromCollectionValue(selectedCollection);
  const isCollectionFilterActive = selectedCollection !== 'all';
  const isColorFilterActive = selectedColor !== 'all';
  const isSizeFilterActive = selectedSize !== 'all';
  const isSortFilterActive = selectedSort !== 'default';
  const activeProductFiltersCount =
    (isCollectionFilterActive ? 1 : 0) +
    (isColorFilterActive ? 1 : 0) +
    (isSizeFilterActive ? 1 : 0) +
    (isSortFilterActive ? 1 : 0);

  useEffect(() => {
    setSelectedSize(searchParams.get('size') ?? 'all');
    setSelectedSizeCatalogCategoryId(searchParams.get('sizeCat')?.trim() ?? '');
  }, [searchParams]);

  useEffect(() => {
    if (!mobileFilterOpen) {
      setCatalogSizeFromMobileFilter(false);
      return;
    }
    setMobilePendingSize(selectedSize);
    setMobilePendingSizeCat(selectedSizeCatalogCategoryId);
  }, [mobileFilterOpen, selectedSize, selectedSizeCatalogCategoryId]);

  useEffect(() => {
    if (searchParams.get(CATALOG_SELECT_SIZE_AUTOOPEN_QUERY) !== CATALOG_SELECT_SIZE_AUTOOPEN_VALUE) {
      return;
    }
    setPendingSelectSizeAutopen(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete(CATALOG_SELECT_SIZE_AUTOOPEN_QUERY);
    const nextPath = params.toString() ? `/products?${params.toString()}` : '/products';
    router.replace(nextPath, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    setLanguage(getStoredLanguage());
    const handleLanguageUpdate = () => {
      setLanguage(getStoredLanguage());
    };
    window.addEventListener('language-updated', handleLanguageUpdate);
    return () => window.removeEventListener('language-updated', handleLanguageUpdate);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void loadSizeCatalogCategories().then((data) => {
      if (cancelled) {
        return;
      }
      setSizeCatalogCategories(data);
      setSizeCatalogReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const collectionOptions = useMemo(() => {
    const items = SECTION_ORDER.filter((section) =>
      products.some((product) => getProductSectionLabels(product).includes(section))
    );
    return ['all', ...items];
  }, [products]);

  const colorOptions = useMemo(() => {
    return Array.from(new Set(products.map((product) => getColorLabel(product)))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [products]);

  const sizeCatalogForModal = useMemo(
    () => filterSizeCatalogByProducts(sizeCatalogCategories, products),
    [sizeCatalogCategories, products]
  );

  useEffect(() => {
    if (!pendingSelectSizeAutopen || !sizeCatalogReady) {
      return;
    }
    let cancelled = false;
    void (async () => {
      await preloadSizeCatalogCategories(sizeCatalogForModal);
      if (cancelled) {
        return;
      }
      setCatalogSizeModalOpen(true);
      setPendingSelectSizeAutopen(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [pendingSelectSizeAutopen, sizeCatalogReady, sizeCatalogForModal]);

  const openCatalogSizeModal = useCallback(() => {
    setCatalogSizeFromMobileFilter(false);
    void preloadSizeCatalogCategories(sizeCatalogForModal);
    setCatalogSizeModalOpen(true);
  }, [sizeCatalogForModal]);

  const openCatalogSizeModalFromMobileFilter = useCallback(() => {
    setCatalogSizeFromMobileFilter(true);
    setCatalogSizeModalOpen(true);
    void preloadSizeCatalogCategories(sizeCatalogForModal);
  }, [sizeCatalogForModal]);

  const sizeForCatalogModal = catalogSizeFromMobileFilter || mobileFilterOpen
    ? mobilePendingSize
    : selectedSize;
  const sizeCatForCatalogModal = catalogSizeFromMobileFilter || mobileFilterOpen
    ? mobilePendingSizeCat
    : selectedSizeCatalogCategoryId;

  const selectedCatalogItemId = useMemo(
    () => resolveCatalogItemId(sizeCatalogCategories, sizeForCatalogModal, sizeCatForCatalogModal),
    [sizeCatalogCategories, sizeForCatalogModal, sizeCatForCatalogModal]
  );

  const visibleProducts = useMemo(() => {
    const gateByCollection = selectedCollection !== 'all';
    const filtered = products.filter((product) => {
      const colorLabel = getColorLabel(product);

      if (gateByCollection && !productMatchesCategoryFilter(product, selectedCollection)) {
        return false;
      }
      if (selectedColor !== 'all' && colorLabel !== selectedColor) {
        return false;
      }
      if (
        !productMatchesSizeFilter(
          product,
          selectedSize,
          selectedSizeCatalogCategoryId || null,
          selectedSizeCatalogCategoryTitle
        )
      ) {
        return false;
      }

      return true;
    });

    return sortProducts(filtered, selectedSort);
  }, [
    products,
    selectedCollection,
    selectedColor,
    selectedSize,
    selectedSizeCatalogCategoryId,
    selectedSizeCatalogCategoryTitle,
    selectedSort,
  ]);

  const sectionItemsByTitle = useMemo(() => {
    return visibleProducts.reduce<Record<string, CatalogProduct[]>>((accumulator, product) => {
      getProductSectionLabels(product).forEach((title) => {
        if (!accumulator[title]) {
          accumulator[title] = [];
        }
        accumulator[title].push(product);
      });
      return accumulator;
    }, {});
  }, [visibleProducts]);

  const catalogStripSectionTitles = useMemo(() => {
    return selectedCollection !== 'all' && selectedSectionTitle
      ? [selectedSectionTitle]
      : [...SECTION_ORDER];
  }, [selectedCollection, selectedSectionTitle]);

  const updateQuery = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'all' || value === 'default') {
        params.delete(key);
        return;
      }
      params.set(key, value);
    });

    router.replace(params.toString() ? `/products?${params.toString()}` : '/products', { scroll: false });
  };

  const applyCatalogSizeFilter = (item: SizeCatalogItemDto) => {
    const { size: sizeQueryValue, sizeCat: categoryId } = catalogSizeQueryFromItem(item);
    setSelectedSize(sizeQueryValue);
    setSelectedSizeCatalogCategoryId(categoryId);
    setCatalogSizeModalOpen(false);
    setMobileFilterOpen(false);
    updateQuery({ size: sizeQueryValue, sizeCat: categoryId || 'all' });
  };

  const stageCatalogSizeForMobileApply = (item: SizeCatalogItemDto) => {
    const { size, sizeCat } = catalogSizeQueryFromItem(item);
    setMobilePendingSize(size);
    setMobilePendingSizeCat(sizeCat);
    setCatalogSizeFromMobileFilter(false);
    setCatalogSizeModalOpen(false);
    setMobileFilterOpen(true);
  };

  const handleCatalogSizeItemSelect = (item: SizeCatalogItemDto) => {
    if (catalogSizeFromMobileFilter) {
      stageCatalogSizeForMobileApply(item);
      return;
    }
    applyCatalogSizeFilter(item);
  };

  const commitMobileFilterApply = () => {
    const nextSizeCat = mobilePendingSizeCat.trim();
    const sizeChanged =
      mobilePendingSize !== selectedSize ||
      nextSizeCat !== selectedSizeCatalogCategoryId.trim();
    if (sizeChanged) {
      setSelectedSize(mobilePendingSize);
      setSelectedSizeCatalogCategoryId(nextSizeCat);
      updateQuery({
        size: mobilePendingSize,
        sizeCat: nextSizeCat || 'all',
      });
    }
    setMobileFilterOpen(false);
  };

  const clearFilters = () => {
    setMobilePendingSize('all');
    setMobilePendingSizeCat('');
    setSelectedSize('all');
    setSelectedSizeCatalogCategoryId('');
    setCatalogSizeModalOpen(false);
    setMobileFilterOpen(false);
    setCatalogSizeFromMobileFilter(false);
    router.replace('/products', { scroll: false });
  };

  return {
    catalogSizeModalOpen,
    setCatalogSizeModalOpen,
    openCatalogSizeModal,
    openCatalogSizeModalFromMobileFilter,
    language,
    mobileFilterOpen,
    setMobileFilterOpen,
    mobilePendingSize,
    commitMobileFilterApply,
    selectedSize,
    selectedSizeCatalogCategoryId,
    selectedSizeCatalogCategoryTitle,
    selectedCollection,
    selectedColor,
    selectedSort,
    isCollectionFilterActive,
    isColorFilterActive,
    isSizeFilterActive,
    isSortFilterActive,
    activeProductFiltersCount,
    collectionOptions,
    colorOptions,
    sizeCatalogForModal,
    selectedCatalogItemId,
    sectionItemsByTitle,
    catalogStripSectionTitles,
    selectedSectionTitle,
    updateQuery,
    handleCatalogSizeItemSelect,
    clearFilters,
  };
}
