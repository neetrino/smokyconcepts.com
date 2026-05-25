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
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') ?? 'all');

  const selectedCollection = searchParams.get('category') ?? 'all';
  const selectedColor = searchParams.get('color') ?? 'all';
  const selectedSizeCatalogCategoryId = searchParams.get('sizeCat')?.trim() ?? '';
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
  }, [searchParams]);

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
    void preloadSizeCatalogCategories(sizeCatalogForModal);
    setCatalogSizeModalOpen(true);
  }, [sizeCatalogForModal]);

  const selectedCatalogItemId = useMemo(() => {
    if (selectedSize === 'all') {
      return null;
    }
    const sizeNeedle = selectedSize.trim().toLowerCase();
    const categoryNeedle = selectedSizeCatalogCategoryId.trim();
    for (const category of sizeCatalogCategories) {
      const exactTitleHit = category.items.find((item) => {
        const titleMatch = item.title.trim().toLowerCase() === sizeNeedle;
        if (!titleMatch) {
          return false;
        }
        if (!categoryNeedle) {
          return true;
        }
        return item.categoryId === categoryNeedle;
      });
      if (exactTitleHit) {
        return exactTitleHit.id;
      }
      const bandTitleHit = category.items.find((item) => {
        const bandMatch = item.categoryTitle.trim().toLowerCase() === sizeNeedle;
        if (!bandMatch) {
          return false;
        }
        if (!categoryNeedle) {
          return true;
        }
        return item.categoryId === categoryNeedle;
      });
      if (bandTitleHit) {
        return bandTitleHit.id;
      }
    }
    return null;
  }, [sizeCatalogCategories, selectedSize, selectedSizeCatalogCategoryId]);

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
    const packTitle = item.title.trim();
    const bandTitle = item.categoryTitle.trim();
    const sizeQueryValue = bandTitle || packTitle;
    const categoryId = item.categoryId.trim();
    setSelectedSize(sizeQueryValue ? sizeQueryValue : 'all');
    setCatalogSizeModalOpen(false);
    setMobileFilterOpen(false);
    if (!sizeQueryValue) {
      updateQuery({ size: 'all', sizeCat: 'all' });
      return;
    }
    updateQuery({ size: sizeQueryValue, sizeCat: categoryId || 'all' });
  };

  const clearFilters = () => {
    setSelectedSize('all');
    setCatalogSizeModalOpen(false);
    setMobileFilterOpen(false);
    router.replace('/products', { scroll: false });
  };

  return {
    catalogSizeModalOpen,
    setCatalogSizeModalOpen,
    openCatalogSizeModal,
    language,
    mobileFilterOpen,
    setMobileFilterOpen,
    selectedSize,
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
    applyCatalogSizeFilter,
    clearFilters,
  };
}
