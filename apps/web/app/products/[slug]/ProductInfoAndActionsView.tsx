'use client';

import Image from 'next/image';
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
  PRODUCT_INFO_TAB_INDICATOR_BASE_CLASS,
  PRODUCT_INFO_TAB_PANEL_CLASS,
  PRODUCT_INFO_TABS_SECTION_CLASS,
} from './productInfoTabContent.constants';

const CATALOG_BAG_ICON_PATH = '/assets/home/icons/bag-catalog.svg';

type ProductInfoViewState = ReturnType<typeof useProductInfoAndActions>;

interface ProductInfoAndActionsViewProps extends ProductInfoAndActionsProps {
  view: ProductInfoViewState;
}

export function ProductInfoAndActionsView({
  product,
  appliedCustomize,
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
  onBuyNow,
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
    sizeButtonLabel,
    openSizeCatalogModal,
    isCustomizeSizeModalOpen,
    closeSizeCatalogModal,
    sizeCatalogCategories,
    selectedCatalogSize,
    handleSelectCatalogSizeItem,
    handleSelectCustomSizeRequest,
    appliedPreviewPlain,
    handleCustomizeApplyClick,
    handleCustomizeClearApplied,
    productTabLabelClass,
    collectionBadgeItems,
    labelBadgeItems,
    hasTitleRowBadges,
    showCustomizeApplyButton,
  } = view;

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

          {colorOptions.length > 0 && (
            <div className={hasTitleRowBadges ? 'mt-6' : 'mt-8'}>
              <p className="font-montserrat text-[18px] font-extrabold leading-none text-[#414141]">
                {t(language, 'product.color')}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {colorOptions.map((option: ProductOptionValue) => {
                  const isActive =
                    option.value === selectedColor || option.label.toLowerCase() === selectedColor;
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
          )}

          {showSizeSection && (
            <div className="relative mt-6">
              <p className="font-montserrat text-[18px] font-extrabold leading-none text-[#414141]">
                {t(language, 'product.size')}
              </p>
              <button
                type="button"
                onClick={openSizeCatalogModal}
                className="mt-3 flex w-full min-h-9 items-center justify-center gap-2 rounded-[6px] bg-[#dcc090] px-3 py-2 text-center font-montserrat text-[16px] font-bold leading-normal tracking-normal text-neutral-700 sm:inline-flex sm:w-auto sm:min-w-[160px]"
              >
                <span className="truncate">{sizeButtonLabel}</span>
              </button>
            </div>
          )}
        </div>

        <div className={PRODUCT_INFO_TABS_SECTION_CLASS}>
          <div className="w-full min-w-0 shrink-0 touch-pan-x overflow-x-auto overscroll-x-contain scroll-px-1 pb-2 scrollbar-hide [-webkit-overflow-scrolling:touch] sm:touch-auto sm:pb-0">
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

          <div role="tabpanel" className={PRODUCT_INFO_TAB_PANEL_CLASS}>
            <ProductInfoTabPanels
              activeTab={activeTab}
              language={language}
              product={product}
              productDescription={productDescription}
              productTabHtml={productTabHtml}
              shippingTabHtml={shippingTabHtml}
              productDetails={productDetails}
              appliedCustomize={appliedCustomize}
              appliedPreviewPlain={appliedPreviewPlain}
              customizeDraftText={customizeDraftText}
              customizeTextMaxLength={customizeTextMaxLength}
              onCustomizeDraftTextChange={onCustomizeDraftTextChange}
              customizeFormat={customizeFormat}
              onCustomizeFormatChange={onCustomizeFormatChange}
              showCustomizeApplyButton={showCustomizeApplyButton}
              onCustomizeApplyClick={handleCustomizeApplyClick}
              onCustomizeClearApplied={handleCustomizeClearApplied}
            />
          </div>
        </div>

        <div className={`flex w-full min-w-0 items-end justify-between gap-3 ${PRODUCT_INFO_PURCHASE_ROW_CLASS}`}>
          <div className="flex min-w-0 flex-1 flex-wrap items-end gap-2 sm:max-w-[291px] sm:gap-3">
            <p className="font-montserrat text-[30px] font-extrabold leading-none text-black sm:text-[32px]">
              {formatCatalogPrice(price, displayCurrency)}
            </p>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1.5">
            <Button
              type="button"
              disabled={!canAddToCart || isAddingToCart}
              onClick={() => {
                void onBuyNow();
              }}
              className="h-10 rounded-[8px] !bg-[#dcc090] px-4 text-[56px] font-bold capitalize tracking-normal !text-[#122a26] hover:!bg-[#d3b67f] sm:px-5 sm:text-[20px]"
            >
              {isAddingToCart
                ? t(language, 'product.adding')
                : isOutOfStock
                  ? t(language, 'product.outOfStock')
                  : t(language, 'product.buy_now')}
            </Button>

            <button
              type="button"
              onClick={() => {
                void onAddToCart();
              }}
              disabled={!canAddToCart || isAddingToCart}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] text-[#dcc090] transition-colors hover:bg-[#dcc090]/10 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={t(language, 'product.addToCart')}
            >
              {isAddingToCart ? (
                <svg
                  className="h-6 w-6 animate-spin text-[#dcc090]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <Image
                  src={CATALOG_BAG_ICON_PATH}
                  alt=""
                  width={32}
                  height={32}
                  className="h-7 w-9 object-contain"
                  aria-hidden
                />
              )}
            </button>
          </div>
        </div>

        {showMessage ? (
          <div className="mt-6 shrink-0 rounded-[12px] bg-[#122a26] px-4 py-3 text-sm font-medium text-white shadow-[0_10px_30px_rgba(18,42,38,0.12)]">
            {showMessage}
          </div>
        ) : null}
      </div>
      <CustomizeSizeModal
        isOpen={isCustomizeSizeModalOpen}
        onClose={closeSizeCatalogModal}
        language={language}
        sizeCategories={sizeCatalogCategories}
        selectedSizeItemId={selectedCatalogSize?.id ?? null}
        onSelectSizeCatalogItem={handleSelectCatalogSizeItem}
        onSelectCustomSizeRequest={handleSelectCustomSizeRequest}
      />
    </>
  );
}
