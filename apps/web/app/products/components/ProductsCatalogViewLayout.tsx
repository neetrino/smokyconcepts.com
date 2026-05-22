'use client';

import { CustomizeSizeModal } from '../[slug]/CustomizeSizeModal';
import type { CustomOrderDraft } from '../[slug]/CustomizeSizeOrderFallback';
import type { LanguageCode } from '../../../lib/language';
import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';
import { CatalogForProductLineRow } from './CatalogForProductLineRow';
import { ProductsCatalogMobileFilterSheet } from './ProductsCatalogMobileFilterSheet';
import { ProductsCatalogCard } from './ProductsCatalogCard';
import {
  CATALOG_MOBILE_PAGINATION_ROW_CLASS_NAME,
  CATALOG_PRODUCT_CARD_MOBILE_ARTICLE_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_MOBILE_ITEM_WRAPPER_CLASS_NAME,
  PRODUCTS_CATALOG_LANDING_MOBILE_CARD_TOP_PADDING_CLASS_NAME,
  PRODUCTS_CATALOG_LANDING_MOBILE_DETAILS_OFFSET_CLASS_NAME,
  PRODUCTS_CATALOG_LANDING_MOBILE_HERO_PULL_UP_CLASS_NAME,
  PRODUCTS_CATALOG_LANDING_MOBILE_IMAGE_BOTTOM_MARGIN_CLASS_NAME,
  PRODUCTS_CATALOG_LANDING_MOBILE_IMAGE_FRAME_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_STRIP_FLEX_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_PAGINATION_WRAPPER_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_SECTION_STRIP_SCROLL_CLASS_NAME,
  getCatalogProductCardImageScaleBoost,
  getProductsCatalogPageSmallerImageScaleMultiplier,
} from './catalogProductCardMobilePresentation';
import {
  getCategoryLabel,
  getSizeLabel,
  shouldNudgeCatalogProductImage,
} from './catalogProductLabels';
import { CatalogChevronIcon } from './CatalogChevronIcon';
import {
  FILTER_CONTROL_ACTIVE,
  FILTER_CONTROL_INACTIVE_BORDER,
  SIZE_FILTER_BUTTON_ACTIVE,
  SORT_OPTIONS,
} from './productsCatalogView.constants';
import type { SortOption, CatalogSectionViewModel } from './productsCatalogView.types';

export interface ProductsCatalogViewLayoutProps {
  mobileFilterOpen: boolean;
  setMobileFilterOpen: (open: boolean) => void;
  selectedCollection: string;
  selectedColor: string;
  selectedSort: SortOption;
  selectedSize: string;
  collectionOptions: string[];
  colorOptions: string[];
  isCollectionFilterActive: boolean;
  isColorFilterActive: boolean;
  isSizeFilterActive: boolean;
  isSortFilterActive: boolean;
  activeProductFiltersCount: number;
  updateQuery: (updates: Record<string, string>) => void;
  clearFilters: () => void;
  setCatalogSizeModalOpen: (open: boolean) => void;
  sections: CatalogSectionViewModel[];
  isSmUp: boolean;
  cardsPerPage: number;
  handleSectionPageChange: (title: string, pageIndex: number) => void;
  handleSectionScroll: (title: string) => void;
  registerSectionScrollRef: (title: string, element: HTMLDivElement | null) => void;
  registerSectionPageStartRef: (sectionTitle: string, pageIndex: number, element: HTMLDivElement | null) => void;
  catalogSizeModalOpen: boolean;
  language: LanguageCode;
  sizeCatalogForModal: SizeCatalogCategoryDto[];
  selectedCatalogItemId: string | null;
  applyCatalogSizeFilter: (item: SizeCatalogItemDto) => void;
}

export function ProductsCatalogViewLayout({
  mobileFilterOpen,
  setMobileFilterOpen,
  selectedCollection,
  selectedColor,
  selectedSort,
  selectedSize,
  collectionOptions,
  colorOptions,
  isCollectionFilterActive,
  isColorFilterActive,
  isSizeFilterActive,
  isSortFilterActive,
  activeProductFiltersCount,
  updateQuery,
  clearFilters,
  setCatalogSizeModalOpen,
  sections,
  isSmUp,
  cardsPerPage,
  handleSectionPageChange,
  handleSectionScroll,
  registerSectionScrollRef,
  registerSectionPageStartRef,
  catalogSizeModalOpen,
  language,
  sizeCatalogForModal,
  selectedCatalogItemId,
  applyCatalogSizeFilter,
}: ProductsCatalogViewLayoutProps) {
  return (
    <div className="min-h-full bg-[#f5f4f1]">
      <ProductsCatalogMobileFilterSheet
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        selectedCollection={selectedCollection}
        selectedColor={selectedColor}
        selectedSort={selectedSort}
        selectedSize={selectedSize}
        collectionOptions={collectionOptions}
        colorOptions={colorOptions}
        sortOptions={SORT_OPTIONS}
        onCollectionChange={(value) => updateQuery({ category: value })}
        onColorChange={(value) => updateQuery({ color: value })}
        onSortChange={(value) => updateQuery({ sort: value })}
        onOpenSizeCatalog={() => {
          setMobileFilterOpen(false);
          setCatalogSizeModalOpen(true);
        }}
        onClearAll={clearFilters}
      />

      <div className="mx-auto max-w-[120rem] px-4 pb-20 pt-12 sm:px-8 lg:pl-[7.5rem] lg:pr-0 lg:pt-[5.25rem]">
        <div className="font-montserrat">
          <div className="flex flex-col gap-8">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-[1.75rem] font-normal leading-none text-[#414141] sm:text-[2rem]">
                <span className="hidden font-extrabold lg:inline">Product Line: </span>
                <span className="font-semibold">Smoky Covers</span>
              </h1>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                aria-label={
                  activeProductFiltersCount > 0
                    ? `Filter, ${activeProductFiltersCount} filter${activeProductFiltersCount === 1 ? '' : 's'} applied`
                    : 'Open filters'
                }
                className="relative mt-0.5 min-h-[2.5rem] shrink-0 overflow-visible rounded-md bg-[#DBC097] px-7 py-2 text-sm font-black uppercase leading-none tracking-[0.14em] text-[#1A1D1C] transition-[colors,box-shadow] hover:bg-[#d2b68c] active:bg-[#c9ac82] lg:hidden"
              >
                Filter
                {activeProductFiltersCount > 0 ? (
                  <span
                    className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[0.6875rem] font-bold leading-none text-white tabular-nums"
                    aria-hidden
                  >
                    {activeProductFiltersCount}
                  </span>
                ) : null}
              </button>
            </div>

            <div className="hidden lg:block">
              <CatalogForProductLineRow />
            </div>

            <div className="hidden gap-3 lg:grid lg:grid-cols-[12.5rem_11rem_11.75rem_4.75rem_1fr_11rem] lg:items-center lg:pr-[7.5rem]">
              <label className="relative block">
                <select
                  value={selectedCollection}
                  onChange={(event) => updateQuery({ category: event.target.value })}
                  className={`h-10 w-full appearance-none rounded-[0.375rem] border-2 px-4 pr-10 text-[0.9375rem] font-semibold leading-none shadow-[0_4px_22.5px_rgba(0,0,0,0.1)] outline-none transition-[box-shadow,ring,border-color,background-color,color] focus:shadow-[0_4px_24px_rgba(18,42,38,0.18)] ${
                    isCollectionFilterActive ? FILTER_CONTROL_ACTIVE : FILTER_CONTROL_INACTIVE_BORDER
                  }`}
                >
                  <option value="all">Collections</option>
                  {collectionOptions.filter((option) => option !== 'all').map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#414141]">
                  <CatalogChevronIcon />
                </span>
              </label>

              <label className="relative block">
                <select
                  value={selectedColor}
                  onChange={(event) => updateQuery({ color: event.target.value })}
                  className={`h-10 w-full appearance-none rounded-[0.375rem] border-2 px-4 pr-10 text-[0.9375rem] font-semibold leading-none shadow-[0_4px_22.5px_rgba(0,0,0,0.1)] outline-none transition-[box-shadow,ring,border-color,background-color,color] focus:shadow-[0_4px_24px_rgba(18,42,38,0.18)] ${
                    isColorFilterActive ? FILTER_CONTROL_ACTIVE : FILTER_CONTROL_INACTIVE_BORDER
                  }`}
                >
                  <option value="all">Color</option>
                  {colorOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#414141]">
                  <CatalogChevronIcon />
                </span>
              </label>

              <button
                type="button"
                onClick={() => setCatalogSizeModalOpen(true)}
                className={`h-10 w-full whitespace-nowrap rounded-[0.5rem] border-2 px-4 text-left text-[0.9375rem] font-semibold leading-none transition-[box-shadow,ring,border-color,background-color,color] ${
                  isSizeFilterActive ? SIZE_FILTER_BUTTON_ACTIVE : 'border-transparent bg-[#dcc090] text-[#122a26]'
                }`}
              >
                {selectedSize === 'all' ? 'Select size' : selectedSize}
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="h-10 whitespace-nowrap rounded-[0.5rem] border-2 border-[#dcc090] px-2 text-[0.5625rem] font-black uppercase leading-none tracking-[0.01em] text-[#dcc090] transition-colors hover:bg-[#dcc090]/10"
              >
                Clear All
              </button>

              <div className="hidden lg:block" />

              <label className="relative block">
                <select
                  value={selectedSort}
                  onChange={(event) => updateQuery({ sort: event.target.value })}
                  className={`h-10 w-full appearance-none rounded-[0.375rem] border-2 px-4 pr-10 text-[0.9375rem] font-extrabold leading-none shadow-[0_4px_22.5px_rgba(0,0,0,0.1)] outline-none transition-[box-shadow,ring,border-color,background-color,color] focus:shadow-[0_4px_24px_rgba(18,42,38,0.18)] ${
                    isSortFilterActive ? FILTER_CONTROL_ACTIVE : FILTER_CONTROL_INACTIVE_BORDER
                  }`}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#414141]">
                  <CatalogChevronIcon />
                </span>
              </label>
            </div>
          </div>

          <div className="mt-10 space-y-16 lg:mt-10 lg:space-y-20">
            {sections.length > 0 ? (
              sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-[2rem] font-extrabold leading-none text-[#414141] sm:text-[2.25rem]">
                    {section.title}
                  </h2>

                  <div
                    ref={(element) => {
                      registerSectionScrollRef(section.title, element);
                    }}
                    onScroll={() => {
                      handleSectionScroll(section.title);
                    }}
                    className={CATALOG_PRODUCTS_PAGE_SECTION_STRIP_SCROLL_CLASS_NAME}
                  >
                    <div className={CATALOG_PRODUCTS_PAGE_STRIP_FLEX_CLASS_NAME}>
                      {section.items.map((product, index) => {
                        const isMobileStripPageStart = index % cardsPerPage === 0;
                        const mobileStripPageIndex = Math.floor(index / cardsPerPage);
                        return (
                          <div
                            key={`${section.title}-${product.id}-${index}`}
                            ref={(element) => {
                              if (!isMobileStripPageStart) {
                                return;
                              }
                              registerSectionPageStartRef(section.title, mobileStripPageIndex, element);
                            }}
                            className={`${CATALOG_PRODUCTS_PAGE_MOBILE_ITEM_WRAPPER_CLASS_NAME}${
                              isMobileStripPageStart ? ' max-sm:snap-start max-sm:snap-always' : ''
                            }`}
                          >
                            <ProductsCatalogCard
                              product={product}
                              sectionLabel={section.title}
                              sizeLabel={getSizeLabel(product)}
                              categoryLabel={getCategoryLabel(product, section.title)}
                              productsCatalogPageScaleMultiplier={getProductsCatalogPageSmallerImageScaleMultiplier(
                                index
                              )}
                              imageNudgeDown={shouldNudgeCatalogProductImage(index)}
                              imageScaleBoost={getCatalogProductCardImageScaleBoost(index)}
                              imageFrameClassName={PRODUCTS_CATALOG_LANDING_MOBILE_IMAGE_FRAME_CLASS_NAME}
                              catalogHeroPullUpClassName={PRODUCTS_CATALOG_LANDING_MOBILE_HERO_PULL_UP_CLASS_NAME}
                              catalogCardTopPaddingClassName={PRODUCTS_CATALOG_LANDING_MOBILE_CARD_TOP_PADDING_CLASS_NAME}
                              catalogDetailsOffsetClassName={PRODUCTS_CATALOG_LANDING_MOBILE_DETAILS_OFFSET_CLASS_NAME}
                              catalogImageBottomMarginClassName={
                                PRODUCTS_CATALOG_LANDING_MOBILE_IMAGE_BOTTOM_MARGIN_CLASS_NAME
                              }
                              className={`group ${CATALOG_PRODUCT_CARD_MOBILE_ARTICLE_CLASS_NAME} max-sm:!w-full max-sm:!min-w-0 max-sm:!max-w-none`}
                              catalogStripMobilePeek={isSmUp}
                              compactLayout
                              productsCatalogPage
                              eagerProductImage
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {section.totalPages > 1 ? (
                    <div className={CATALOG_PRODUCTS_PAGE_PAGINATION_WRAPPER_CLASS_NAME}>
                      <div
                        className={`${CATALOG_MOBILE_PAGINATION_ROW_CLASS_NAME} sm:max-w-none sm:justify-center sm:gap-4`}
                        role="tablist"
                        aria-label={`${section.title} pages`}
                      >
                        {Array.from({ length: section.totalPages }).map((_, pageIndex) => (
                          <button
                            key={`${section.title}-page-${pageIndex}`}
                            type="button"
                            onClick={() => handleSectionPageChange(section.title, pageIndex)}
                            role="tab"
                            aria-selected={section.currentPage === pageIndex}
                            className={`h-2 min-w-[1.25rem] shrink rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#122a26] focus-visible:ring-offset-2 max-sm:h-1.5 max-sm:flex-1 max-sm:active:bg-[#c9c9c9] sm:w-[6.25rem] sm:flex-none ${
                              section.currentPage === pageIndex
                                ? 'bg-[#122a26]'
                                : 'bg-[#d9d9d9] [@media(hover:hover)]:hover:bg-[#c9c9c9]'
                            }`}
                            aria-label={`Open ${section.title} page ${pageIndex + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </section>
              ))
            ) : (
              <div className="rounded-[2rem] bg-white px-6 py-12 text-center shadow-[0_4px_22.5px_rgba(0,0,0,0.08)]">
                <p className="text-xl font-semibold text-[#414141]">No products matched the selected filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CustomizeSizeModal
        isOpen={catalogSizeModalOpen}
        onClose={() => setCatalogSizeModalOpen(false)}
        language={language}
        sizeCategories={sizeCatalogForModal}
        selectedSizeItemId={selectedCatalogItemId}
        onSelectSizeCatalogItem={applyCatalogSizeFilter}
        onSelectCustomSizeRequest={(_draft: CustomOrderDraft) => {
          setCatalogSizeModalOpen(false);
        }}
      />
    </div>
  );
}
