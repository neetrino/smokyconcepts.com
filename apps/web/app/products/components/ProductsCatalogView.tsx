'use client';

import { useSyncExternalStore } from 'react';
import {
  getCatalogProductsSmViewportSnapshot,
  getServerCatalogProductsSmViewportSnapshot,
  subscribeCatalogProductsSmViewport,
} from './catalogProductCardMobilePresentation';
import { useProductsCatalogFilters } from './hooks/useProductsCatalogFilters';
import { useProductsCatalogCategoryScroll } from './hooks/useProductsCatalogCategoryScroll';
import {
  useProductsCatalogCardsPerPage,
  useProductsCatalogSectionScroll,
} from './hooks/useProductsCatalogSectionScroll';
import { ProductsCatalogViewLayout } from './ProductsCatalogViewLayout';
import type { ProductsCatalogViewProps } from './productsCatalogView.types';

export type { ProductsCatalogViewProps } from './productsCatalogView.types';

/**
 * Figma-faithful catalog layout for the products landing page.
 */
export function ProductsCatalogView({ products }: ProductsCatalogViewProps) {
  const isSmUp = useSyncExternalStore(
    subscribeCatalogProductsSmViewport,
    getCatalogProductsSmViewportSnapshot,
    getServerCatalogProductsSmViewportSnapshot
  );
  const cardsPerPage = useProductsCatalogCardsPerPage(isSmUp);
  const filters = useProductsCatalogFilters(products);
  const scroll = useProductsCatalogSectionScroll({
    isSmUp,
    cardsPerPage,
    sectionItemsByTitle: filters.sectionItemsByTitle,
    catalogStripSectionTitles: filters.catalogStripSectionTitles,
    selectedCollection: filters.selectedCollection,
    selectedSectionTitle: filters.selectedSectionTitle,
  });
  const categoryScroll = useProductsCatalogCategoryScroll({ sections: scroll.sections });

  return (
    <ProductsCatalogViewLayout
      mobileFilterOpen={filters.mobileFilterOpen}
      setMobileFilterOpen={filters.setMobileFilterOpen}
      selectedCollection={filters.selectedCollection}
      selectedColor={filters.selectedColor}
      selectedSort={filters.selectedSort}
      selectedSize={filters.selectedSize}
      collectionOptions={filters.collectionOptions}
      colorOptions={filters.colorOptions}
      isCollectionFilterActive={filters.isCollectionFilterActive}
      isColorFilterActive={filters.isColorFilterActive}
      isSizeFilterActive={filters.isSizeFilterActive}
      isSortFilterActive={filters.isSortFilterActive}
      activeProductFiltersCount={filters.activeProductFiltersCount}
      updateQuery={filters.updateQuery}
      clearFilters={filters.clearFilters}
      setCatalogSizeModalOpen={filters.setCatalogSizeModalOpen}
      sections={scroll.sections}
      isSmUp={isSmUp}
      cardsPerPage={cardsPerPage}
      handleSectionPageChange={scroll.handleSectionPageChange}
      handleSectionScroll={scroll.handleSectionScroll}
      registerSectionScrollRef={scroll.registerSectionScrollRef}
      registerSectionPageStartRef={scroll.registerSectionPageStartRef}
      registerSectionAnchorRef={categoryScroll.registerSectionAnchorRef}
      catalogSectionScrollMarginClassName={categoryScroll.catalogSectionScrollMarginClassName}
      catalogSizeModalOpen={filters.catalogSizeModalOpen}
      language={filters.language}
      sizeCatalogForModal={filters.sizeCatalogForModal}
      selectedCatalogItemId={filters.selectedCatalogItemId}
      applyCatalogSizeFilter={filters.applyCatalogSizeFilter}
    />
  );
}
