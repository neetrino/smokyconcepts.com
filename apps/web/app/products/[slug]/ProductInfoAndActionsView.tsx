'use client';

import { useEffect, useRef } from 'react';
import { formatCatalogPrice } from '../../../lib/currency';
import { t } from '../../../lib/i18n';
import { useCurrency } from '../../../components/hooks/useCurrency';
import { Button } from '../../../components/ui/buttons';
import {
  PRODUCT_SECTION_BADGE_CLASS_NAMES,
} from '../components/catalogProductLabels';
import { CustomizeSizeModal } from './CustomizeSizeModal';
import { ProductInfoTabPanels } from './ProductInfoTabPanels';
import { getSwatchColors } from './utils/productInfoAndActions.helpers';
import type { ProductInfoAndActionsProps, ProductOptionValue } from './productInfoAndActions.types';
import type { useProductInfoAndActions } from './hooks/useProductInfoAndActions';
import {
  PRODUCT_INFO_HEADER_CLASS,
  PRODUCT_INFO_PURCHASE_ROW_CLASS,
  PRODUCT_INFO_ROOT_CLASS,
  PRODUCT_INFO_SCROLL_BODY_CLASS,
  PRODUCT_INFO_SCROLL_BODY_CUSTOMIZE_CLASS,
  PRODUCT_INFO_TAB_INDICATOR_BASE_CLASS,
  PRODUCT_INFO_TAB_PANEL_CLASS,
  PRODUCT_INFO_TAB_PANEL_CUSTOMIZE_CLASS,
  PRODUCT_INFO_TABS_SECTION_CLASS,
  PRODUCT_INFO_TABS_SECTION_CUSTOMIZE_CLASS,
} from './productInfoTabContent.constants';

type ProductInfoViewState = ReturnType<typeof useProductInfoAndActions>;

interface ProductInfoAndActionsViewProps extends ProductInfoAndActionsProps {
  view: ProductInfoViewState;
}

export function ProductInfoAndActionsView({
  product,
  language,
  price,
  isOutOfStock,
  canAddToCart,
  isAddingToCart,
  showMessage,
  selectedColor,
  colorOptions,
  onColorSelect,
  onAddToCart,
  customizeDraftText,
  onCustomizeDraftTextChange,
  customizeTextMaxLength,
  customizeFormat,
  onCustomizeFormatChange,
  view,
}: ProductInfoAndActionsViewProps) {
  const displayCurrency = useCurrency();
  const {
    activeTab,
    setActiveTab,
    productTitle,
    productDescription,
    productTabHtml,
    shippingTabHtml,
    productDetails,
    showSizeSection,
    attributeSectionOrder,
    sizeButtonLabel,
    openSizeCatalogModal,
    isCustomizeSizeModalOpen,
    closeSizeCatalogModal,
    sizeCatalogCategories,
    selectedCatalogSize,
    handleSelectCatalogSizeItem,
    handleSelectCustomSizeRequest,
    productTabLabelClass,
    collectionBadgeItems,
    labelBadgeItems,
    hasTitleRowBadges,
    isSizeSelected,
    showSizeRequired,
    isSizeShaking,
    triggerSizeValidation,
    handleSizeShakeAnimationEnd,
    isCatalogSizeItemSelectable,
  } = view;

  const sizeSectionRef = useRef<HTMLDivElement>(null);
  const tabPanelRef = useRef<HTMLDivElement>(null);
  const isCustomizeTab = activeTab === 'customize';
  const tabsSectionClass = isCustomizeTab
    ? PRODUCT_INFO_TABS_SECTION_CUSTOMIZE_CLASS
    : PRODUCT_INFO_TABS_SECTION_CLASS;
  const tabPanelClass = isCustomizeTab
    ? PRODUCT_INFO_TAB_PANEL_CUSTOMIZE_CLASS
    : PRODUCT_INFO_TAB_PANEL_CLASS;
  const scrollBodyClass = isCustomizeTab
    ? PRODUCT_INFO_SCROLL_BODY_CUSTOMIZE_CLASS
    : PRODUCT_INFO_SCROLL_BODY_CLASS;

  useEffect(() => {
    tabPanelRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [activeTab]);

  const handleAddToCartClick = () => {
    if (showSizeSection && !isSizeSelected) {
      triggerSizeValidation();
      sizeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    if (!canAddToCart || isAddingToCart) {
      return;
    }
    void onAddToCart();
  };

  const addToCartLabel = isAddingToCart
    ? t(language, 'product.adding')
    : !canAddToCart && isOutOfStock
      ? t(language, 'product.outOfStock')
      : t(language, 'product.addToCart');
  const showSizeAsterisk = showSizeSection;

  return (
    <>
      <div className={PRODUCT_INFO_ROOT_CLASS}>
        <div className={PRODUCT_INFO_HEADER_CLASS}>
          <h1 className="min-w-0 font-montserrat text-[26px] font-black leading-tight text-[#414141] sm:text-[30px]">
            {productTitle}
          </h1>
          {hasTitleRowBadges ? (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {collectionBadgeItems.map((item, index) => (
                <span
                  key={`${item.sectionLabel}-${item.text}-${index}`}
                  className={`inline-flex items-center rounded-full px-2.5 py-1 font-montserrat text-xs font-medium leading-none sm:text-[13px] ${
                    PRODUCT_SECTION_BADGE_CLASS_NAMES[item.sectionLabel] ??
                    PRODUCT_SECTION_BADGE_CLASS_NAMES.Classic
                  }`}
                >
                  {item.text}
                </span>
              ))}
              {labelBadgeItems.map((item) => (
                <span
                  key={item.id}
                  className={`inline-flex items-center rounded-full px-2.5 py-1 font-montserrat text-xs font-medium leading-none text-white sm:text-[13px] ${
                    item.color ? '' : 'bg-[#122a26]'
                  }`}
                  style={item.color ? { backgroundColor: item.color } : undefined}
                >
                  {item.text}
                </span>
              ))}
            </div>
          ) : null}

          {attributeSectionOrder.map((sectionKey, sectionIndex) => {
            const sectionSpacingClass =
              sectionIndex === 0 ? (hasTitleRowBadges ? 'mt-6' : 'mt-8') : 'mt-6';

            if (sectionKey === 'color' && colorOptions.length > 0) {
              return (
                <div key="color" className={sectionSpacingClass}>
                  <p className="font-montserrat text-[18px] font-extrabold leading-none text-[#414141]">
                    {t(language, 'product.color')}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {colorOptions.map((option: ProductOptionValue) => {
                      const isActive =
                        option.value === selectedColor ||
                        option.label.toLowerCase() === selectedColor;
                      const swatches = getSwatchColors(option);

                      return (
                        <button
                          key={option.valueId || option.value}
                          type="button"
                          onClick={() => onColorSelect(option.value)}
                          className={`relative transition-transform hover:scale-[1.02] ${
                            isActive
                              ? 'flex h-10 w-10 items-center justify-center rounded-[10px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)]'
                              : 'h-[22px] w-[22px] rounded-[6px]'
                          }`}
                          aria-label={option.label}
                        >
                          <span
                            className={`block ${isActive ? 'h-7 w-7 rounded-lg' : 'h-[22px] w-[22px] rounded-[5px]'}`}
                            style={{
                              background:
                                swatches.length > 1
                                  ? `linear-gradient(135deg, ${swatches.join(', ')})`
                                  : swatches[0],
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            if (sectionKey === 'size' && showSizeSection) {
              return (
                <div
                  key="size"
                  ref={sizeSectionRef}
                  className={`relative z-40 overflow-visible px-1 ${sectionSpacingClass}`}
                >
                  <p className="font-montserrat text-[18px] font-extrabold leading-none text-[#414141]">
                    {t(language, 'product.size')}
                    {showSizeAsterisk ? (
                      <span className="relative z-10 ml-1 text-red-600" aria-hidden>
                        *
                      </span>
                    ) : null}
                  </p>
                  <button
                    type="button"
                    onClick={openSizeCatalogModal}
                    onAnimationEnd={handleSizeShakeAnimationEnd}
                    className={`relative z-40 mt-3 flex w-full min-h-9 items-center justify-center gap-2 overflow-visible rounded-[6px] bg-[#dcc090] px-3 py-2 text-center font-montserrat text-[16px] font-bold leading-normal tracking-normal text-neutral-700 sm:inline-flex sm:w-auto sm:min-w-[160px] ${
                      isSizeShaking ? 'animate-size-shake' : ''
                    }`}
                  >
                    <span className="truncate">{sizeButtonLabel}</span>
                  </button>
                </div>
              );
            }

            return null;
          })}
        </div>

        <div className={scrollBodyClass}>
        <div className={tabsSectionClass}>
          <div className="w-full min-w-0 shrink-0 overflow-x-auto overscroll-x-contain scroll-px-1 pb-2 scrollbar-hide [-webkit-overflow-scrolling:touch] sm:pb-0">
            <div
              className="flex w-max max-w-none snap-x snap-mandatory flex-nowrap items-end gap-5 pr-4 sm:snap-none sm:gap-7 sm:pr-5"
              role="tablist"
            >
              {(['description', 'details', 'shipping', 'customize'] as const).map((tabKey) => {
                const tabLabels: Record<typeof tabKey, string> = {
                  description: t(language, 'product.description_title'),
                  details: t(language, 'product.details_title'),
                  shipping: t(language, 'product.shipping_title'),
                  customize: t(language, 'product.customize_title'),
                };
                return (
                  <button
                    key={tabKey}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tabKey}
                    onClick={() => setActiveTab(tabKey)}
                    className={`relative shrink-0 snap-start whitespace-nowrap ${productTabLabelClass} ${
                      activeTab === tabKey ? 'text-[#414141]' : 'text-[#414141]/70'
                    }`}
                  >
                    {tabLabels[tabKey]}
                    <span
                      className={`${PRODUCT_INFO_TAB_INDICATOR_BASE_CLASS} ${
                        activeTab === tabKey ? 'bg-[#122a26]' : 'bg-transparent'
                      }`}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div ref={tabPanelRef} role="tabpanel" className={tabPanelClass}>
            <ProductInfoTabPanels
              activeTab={activeTab}
              language={language}
              product={product}
              productDescription={productDescription}
              productTabHtml={productTabHtml}
              shippingTabHtml={shippingTabHtml}
              productDetails={productDetails}
              customizeDraftText={customizeDraftText}
              customizeTextMaxLength={customizeTextMaxLength}
              onCustomizeDraftTextChange={onCustomizeDraftTextChange}
              customizeFormat={customizeFormat}
              onCustomizeFormatChange={onCustomizeFormatChange}
            />
          </div>
        </div>

        <div className={`flex w-full min-w-0 items-end justify-between gap-4 sm:gap-6 ${PRODUCT_INFO_PURCHASE_ROW_CLASS}`}>
          <p className="font-montserrat text-[30px] font-extrabold leading-none text-black sm:text-[32px]">
            {formatCatalogPrice(price, displayCurrency)}
          </p>
          <Button
            type="button"
            disabled={isAddingToCart}
            onClick={handleAddToCartClick}
            className="h-10 shrink-0 rounded-[8px] !bg-[#dcc090] px-4 text-[16px] font-bold capitalize tracking-normal !text-[#122a26] hover:!bg-[#d3b67f] disabled:cursor-wait disabled:!opacity-100 sm:px-5 sm:text-[20px]"
          >
            {addToCartLabel}
          </Button>
        </div>

        {showMessage ? (
          <div className="mt-6 shrink-0 rounded-[12px] bg-[#122a26] px-4 py-3 text-sm font-medium text-white shadow-[0_10px_30px_rgba(18,42,38,0.12)]">
            {showMessage}
          </div>
        ) : null}
        </div>
      </div>
      <CustomizeSizeModal
        isOpen={isCustomizeSizeModalOpen}
        onClose={closeSizeCatalogModal}
        language={language}
        sizeCategories={sizeCatalogCategories}
        selectedSizeItemId={selectedCatalogSize?.id ?? null}
        productId={product.id}
        productTitle={productTitle}
        onSelectSizeCatalogItem={handleSelectCatalogSizeItem}
        onSelectCustomSizeRequest={handleSelectCustomSizeRequest}
        isSizeItemSelectable={isCatalogSizeItemSelectable}
      />
    </>
  );
}
