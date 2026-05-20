'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { formatCatalogPrice, formatPriceInCurrency } from '../../../lib/currency';
import { t, getProductText } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import { useCurrency } from '../../../components/hooks/useCurrency';
import { apiClient } from '../../../lib/api-client';
import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';
import { preloadSizeCatalogCategories } from '@/lib/size-catalog-image-cache';
import { Button } from '../../../components/ui/buttons';
import type { AttributeGroupValue, Product, ProductVariant } from './types';
import {
  getProductCollectionBadgeItems,
  PRODUCT_SECTION_BADGE_CLASS_NAMES,
} from '../components/catalogProductLabels';
import { normalizeHexPalette, parseHexFromText } from './utils/swatch-color-utils';
import { CustomizeFormatToolbar } from './CustomizeFormatToolbar';
import { CustomizeSizeModal } from './CustomizeSizeModal';
import type { CustomOrderDraft } from './CustomizeSizeOrderFallback';
import type { CustomizeFormatState } from './utils/build-customize-preview-html';
import {
  getPlainTextFromHtml,
  sanitizeCustomizeHtml,
} from './utils/sanitize-customize-html';
import {
  PRODUCT_INFO_HEADER_CLASS,
  PRODUCT_INFO_PURCHASE_ROW_CLASS,
  PRODUCT_INFO_ROOT_CLASS,
  PRODUCT_INFO_TAB_INDICATOR_BASE_CLASS,
  PRODUCT_INFO_TAB_PANEL_CLASS,
  PRODUCT_INFO_TABS_SECTION_CLASS,
} from './productInfoTabContent.constants';

const CATALOG_BAG_ICON_PATH = '/assets/home/icons/bag-catalog.svg';

/** How long the “applied text” confirmation stays visible under Apply (ms). */
const CUSTOMIZE_APPLIED_PREVIEW_MS = 1000;

type ProductTabKey = 'description' | 'details' | 'shipping' | 'customize';

interface ProductOptionValue extends AttributeGroupValue {
  colors?: string[] | string | null;
}

/**
 * PDP actions — add/buy handlers are wired to `useProductCartActions` on the parent page
 * (fast snapshot + optional POST, no extra GET before add).
 */
interface ProductInfoAndActionsProps {
  product: Product;
  /** Last applied customize (hero overlay + cart). */
  appliedCustomize: { plain: string; html: string | null } | null;
  onCustomizeApplied: (value: { plain: string; html: string | null } | null) => void;
  /** Rich preview HTML for cart / overlay — built from draft text + toolbar format on the parent. */
  getCustomizeSanitizedHtml: () => string;
  customizeFormat: CustomizeFormatState;
  onCustomizeFormatChange: (next: CustomizeFormatState) => void;
  /** Plain line next to Apply — drives editor seed when it does not match applied rich HTML. */
  customizeDraftText: string;
  onCustomizeDraftTextChange: (value: string) => void;
  customizeTextMaxLength: number;
  price: number;
  language: LanguageCode;
  isOutOfStock: boolean;
  canAddToCart: boolean;
  isAddingToCart: boolean;
  showMessage: string | null;
  currentVariant: ProductVariant | null;
  selectedColor: string | null;
  selectedSize: string | null;
  colorOptions: ProductOptionValue[];
  sizeOptions: ProductOptionValue[];
  onColorSelect: (color: string) => void;
  onSizeSelect: (size: string) => void;
  /** Select variant by size collection + version from size catalog modal item. */
  onCatalogVariantSelect?: (sizeCollectionTitle: string, version: string) => void;
  /** Quick add (e.g. bag icon) — stay on page. */
  onAddToCart: () => Promise<void>;
  /** Primary CTA — add line then continue to checkout. */
  onBuyNow: () => Promise<void>;
  /** Sync size-catalog selection to parent for cart / checkout snapshot */
  onSelectedCatalogSizeChange?: (item: SizeCatalogItemDto | null) => void;
  /** Sync custom-size request selection to parent for checkout payload */
  onSelectedCustomSizeRequestChange?: (request: CustomOrderDraft | null) => void;
  /** Fires when the Customize tab is selected — parent loads fonts / toolbar only then. */
  onCustomizeTabActiveChange?: (active: boolean) => void;
}

const COLOR_SWATCH_FALLBACKS: Record<string, string[]> = {
  black: ['#1d1d1f'],
  green: ['#516349'],
  'forest green': ['#516349'],
  red: ['#7a2c34'],
  'deep red': ['#7a2c34'],
  gold: ['#b3ae78'],
  brown: ['#703d02'],
  white: ['#ffffff'],
  beige: ['#dcc090'],
};

function getSwatchColors(option: ProductOptionValue): string[] {
  const fromApi = normalizeHexPalette(option.colors);
  if (fromApi.length > 0) {
    return fromApi;
  }

  const fromValue = parseHexFromText(option.value);
  if (fromValue) {
    return [fromValue];
  }

  const fromLabel = parseHexFromText(option.label);
  if (fromLabel) {
    return [fromLabel];
  }

  return (
    COLOR_SWATCH_FALLBACKS[option.label.toLowerCase()] ??
    COLOR_SWATCH_FALLBACKS[option.value.toLowerCase()] ??
    ['#dcc090']
  );
}

function getShippingCopy(language: LanguageCode): string {
  switch (language) {
    case 'hy':
      return 'Առաքման արժեքն ու վերջնական ժամկետները հաշվարկվում են պատվերի ձևակերպման ժամանակ` ըստ հասցեի և ընտրված եղանակի։';
    case 'ru':
      return 'Стоимость и сроки доставки рассчитываются на этапе оформления заказа в зависимости от адреса и выбранного способа.';
    default:
      return 'Shipping cost and delivery timing are calculated at checkout based on destination and the selected method.';
  }
}

function matchVariantSizeFromCatalogTitle(title: string, options: ProductOptionValue[]): string | null {
  const normalized = title.trim().toLowerCase();
  const byLabel = options.find((o) => o.label.toLowerCase() === normalized);
  if (byLabel) {
    return byLabel.value;
  }
  const byValue = options.find((o) => o.value.toLowerCase() === normalized);
  return byValue?.value ?? null;
}

function getCustomizeCopy(language: LanguageCode): string {
  switch (language) {
    case 'hy':
      return 'Ընտրեք գույնը և չափը այս էջում՝ պատվերը անհատականացնելու համար։ Հատուկ ցանկությունների դեպքում կարող եք կապվել մեզ հետ պատվերը ձևակերպելուց հետո։';
    case 'ru':
      return 'Выберите цвет и размер на этой странице, чтобы персонализировать заказ. Для особых пожеланий свяжитесь с нами после оформления.';
    default:
      return 'Pick color and size on this page to personalize your order. For special requests, contact us after checkout.';
  }
}

export function ProductInfoAndActions({
  product,
  appliedCustomize,
  onCustomizeApplied,
  price,
  language,
  isOutOfStock,
  canAddToCart,
  isAddingToCart,
  showMessage,
  currentVariant,
  selectedColor,
  selectedSize,
  colorOptions,
  sizeOptions,
  onColorSelect,
  onSizeSelect,
  onCatalogVariantSelect,
  onAddToCart,
  onBuyNow,
  onSelectedCatalogSizeChange,
  onSelectedCustomSizeRequestChange,
  onCustomizeTabActiveChange,
  getCustomizeSanitizedHtml,
  customizeDraftText,
  onCustomizeDraftTextChange,
  customizeTextMaxLength,
  customizeFormat,
  onCustomizeFormatChange,
}: ProductInfoAndActionsProps) {
  const displayCurrency = useCurrency();
  const [activeTab, setActiveTab] = useState<ProductTabKey>('description');
  const [isCustomizeSizeModalOpen, setIsCustomizeSizeModalOpen] = useState(false);
  const [sizeCatalogCategories, setSizeCatalogCategories] = useState<SizeCatalogCategoryDto[]>([]);
  const [selectedCatalogSize, setSelectedCatalogSize] = useState<SizeCatalogItemDto | null>(null);
  const [selectedCustomSizeRequest, setSelectedCustomSizeRequest] = useState<CustomOrderDraft | null>(null);
  const [appliedPreviewPlain, setAppliedPreviewPlain] = useState<string | null>(null);
  const appliedPreviewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAppliedPreviewTimer = useCallback(() => {
    if (appliedPreviewTimeoutRef.current !== null) {
      clearTimeout(appliedPreviewTimeoutRef.current);
      appliedPreviewTimeoutRef.current = null;
    }
  }, []);

  const productTitle = getProductText(language, product.id, 'title') || product.title;
  const productDescription =
    getProductText(language, product.id, 'longDescription') || product.description || '';
  const activeColorOption = useMemo(
    () =>
      colorOptions.find(
        (option) => option.value === selectedColor || option.label.toLowerCase() === selectedColor
      ) ?? null,
    [colorOptions, selectedColor]
  );
  const activeSizeOption = useMemo(
    () =>
      sizeOptions.find(
        (option) => option.value === selectedSize || option.label.toLowerCase() === selectedSize
      ) ?? null,
    [selectedSize, sizeOptions]
  );

  const hasSizeCatalogItems = useMemo(
    () => sizeCatalogCategories.some((c) => c.items.length > 0),
    [sizeCatalogCategories]
  );

  const showSizeSection = sizeOptions.length > 0 || hasSizeCatalogItems;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiClient.get<{ data: SizeCatalogCategoryDto[] }>('/api/v1/size-catalog');
        if (!cancelled) {
          const data = res.data ?? [];
          setSizeCatalogCategories(data);
          void preloadSizeCatalogCategories(data);
        }
      } catch {
        if (!cancelled) {
          setSizeCatalogCategories([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSelectedCatalogSize(null);
    setSelectedCustomSizeRequest(null);
    setActiveTab('description');
    clearAppliedPreviewTimer();
    setAppliedPreviewPlain(null);
  }, [product.id, clearAppliedPreviewTimer]);

  useEffect(() => {
    return () => {
      clearAppliedPreviewTimer();
    };
  }, [clearAppliedPreviewTimer]);

  useEffect(() => {
    onSelectedCatalogSizeChange?.(selectedCatalogSize);
  }, [selectedCatalogSize, onSelectedCatalogSizeChange]);

  useEffect(() => {
    onSelectedCustomSizeRequestChange?.(selectedCustomSizeRequest);
  }, [selectedCustomSizeRequest, onSelectedCustomSizeRequestChange]);

  useEffect(() => {
    onCustomizeTabActiveChange?.(activeTab === 'customize');
  }, [activeTab, onCustomizeTabActiveChange]);

  const sizeButtonLabel =
    (selectedCustomSizeRequest ? t(language, 'product.size_catalog_custom_order_selected') : null) ||
    selectedCatalogSize?.title ||
    activeSizeOption?.label ||
    t(language, 'product.choose_size');
  const selectedCollectionTitle = selectedCatalogSize?.categoryTitle?.trim() ?? '';
  const selectedCollectionPriceAmd = selectedCatalogSize?.categoryPriceAmd ?? 0;
  const handleSelectCatalogSizeItem = (item: SizeCatalogItemDto) => {
    setSelectedCatalogSize(item);
    setSelectedCustomSizeRequest(null);
    if (onCatalogVariantSelect) {
      onCatalogVariantSelect(item.categoryTitle, item.version);
      return;
    }
    if (sizeOptions.length > 0) {
      const matched = matchVariantSizeFromCatalogTitle(item.categoryTitle, sizeOptions);
      if (matched) {
        onSizeSelect(matched);
      }
    }
  };

  const handleSelectCustomSizeRequest = (draft: CustomOrderDraft) => {
    setSelectedCatalogSize(null);
    setSelectedCustomSizeRequest(draft);
    if (sizeOptions.length > 0) {
      onSizeSelect(sizeOptions[0].value);
    }
  };

  const openSizeCatalogModal = () => {
    setIsCustomizeSizeModalOpen(true);
  };

  const handleCustomizeApplyClick = useCallback(() => {
    const rawHtml = getCustomizeSanitizedHtml();
    const sanitized = sanitizeCustomizeHtml(rawHtml);
    const plain = getPlainTextFromHtml(sanitized).trim();
    clearAppliedPreviewTimer();
    if (!plain) {
      onCustomizeApplied(null);
      setAppliedPreviewPlain(null);
      return;
    }
    onCustomizeApplied({
      plain,
      html: sanitized.trim().length > 0 ? sanitized : null,
    });
    setAppliedPreviewPlain(plain);
    appliedPreviewTimeoutRef.current = setTimeout(() => {
      setAppliedPreviewPlain(null);
      appliedPreviewTimeoutRef.current = null;
    }, CUSTOMIZE_APPLIED_PREVIEW_MS);
  }, [clearAppliedPreviewTimer, getCustomizeSanitizedHtml, onCustomizeApplied]);

  const handleCustomizeClearApplied = useCallback(() => {
    clearAppliedPreviewTimer();
    setAppliedPreviewPlain(null);
    onCustomizeApplied(null);
  }, [clearAppliedPreviewTimer, onCustomizeApplied]);

  /** EN labels are shorter — slightly larger type; HY/RU/KA stay compact enough for horizontal tab scrolling. */
  const productTabLabelClass =
    language === 'en'
      ? 'pb-3 font-montserrat text-[17px] font-extrabold leading-none sm:text-[18px] md:text-[19px]'
      : 'pb-3 font-montserrat text-[16px] font-extrabold leading-none sm:text-[17px] md:text-[18px]';

  const collectionBadgeItems = useMemo(() => getProductCollectionBadgeItems(product), [product]);

  const labelBadgeItems = useMemo(
    () =>
      product.labels?.length
        ? product.labels
            .map((label) => ({
              id: label.id,
              text: label.value?.trim() ?? '',
              color: label.color?.trim() ?? null,
            }))
            .filter((item) => item.text.length > 0)
        : [],
    [product.labels, product.id]
  );

  const hasTitleRowBadges = collectionBadgeItems.length > 0 || labelBadgeItems.length > 0;
  const productDetails = [
    product.brand?.name ?? null,
    activeColorOption ? `${t(language, 'product.color')}: ${activeColorOption.label}` : null,
    activeSizeOption
      ? `${t(language, 'product.size')}: ${activeSizeOption.label}`
      : selectedCustomSizeRequest
        ? `${t(language, 'product.size')}: ${t(language, 'product.size_catalog_custom_order_selected')}`
      : selectedCatalogSize
        ? `${t(language, 'product.size')}: ${selectedCatalogSize.title}`
        : null,
    currentVariant?.sku ? `SKU: ${currentVariant.sku}` : null,
  ].filter(Boolean) as string[];

  /** Hide Apply until plain/HTML differs from last saved (new text, edit, or format change). */
  const showCustomizeApplyButton = useMemo(() => {
    const rawHtml = getCustomizeSanitizedHtml();
    const sanitized = sanitizeCustomizeHtml(rawHtml);
    const plain = getPlainTextFromHtml(sanitized).trim();
    if (!plain) {
      return false;
    }
    if (!appliedCustomize) {
      return true;
    }
    const appliedPlain = appliedCustomize.plain.trim();
    const appliedHtml = (appliedCustomize.html ?? '').trim();
    const currentHtml = sanitized.trim();
    return plain !== appliedPlain || currentHtml !== appliedHtml;
  }, [appliedCustomize, customizeDraftText, customizeFormat, getCustomizeSanitizedHtml]);

  const renderedTabContent = useMemo(() => {
    if (activeTab === 'description') {
      if (!productDescription) {
        return (
          <p className="text-[15px] leading-[24px] text-[#414141] sm:text-[16px] sm:leading-[26px]">
            {t(language, 'product.description_empty')}
          </p>
        );
      }

      return (
        <div
          className="prose max-w-none text-[15px] leading-[24px] text-[#414141] prose-p:my-0 prose-p:text-[15px] prose-p:leading-[24px] sm:text-[16px] sm:leading-[26px] sm:prose-p:text-[16px] sm:prose-p:leading-[26px]"
          dangerouslySetInnerHTML={{ __html: productDescription }}
        />
      );
    }

    if (activeTab === 'shipping') {
      return (
        <p className="text-[15px] leading-[24px] text-[#414141] sm:text-[16px] sm:leading-[26px]">
          {getShippingCopy(language)}
        </p>
      );
    }

    if (activeTab === 'customize') {
      return (
        <div className="flex max-w-[763px] flex-col gap-2.5">
          <p className="text-[15px] leading-[24px] text-[#414141] sm:text-[16px] sm:leading-[26px]">
            {getCustomizeCopy(language)}
          </p>
          <div className="flex max-w-[763px] flex-col gap-3 sm:flex-row sm:items-start sm:gap-12 sm:pb-4">
            <div className="w-full min-w-0 sm:max-w-[291px]">
              <input
                type="text"
                value={customizeDraftText}
                maxLength={customizeTextMaxLength}
                onChange={(e) => {
                  onCustomizeDraftTextChange(e.target.value);
                }}
                className="w-full border-0 border-b border-[#dcc090] bg-transparent pb-0.5 font-montserrat text-[18px] font-medium leading-[30px] text-[#414141] outline-none focus:border-[#dcc090] focus-visible:border-[#dcc090] active:border-[#dcc090]"
                aria-label={t(language, 'product.customize_title')}
                autoComplete="off"
              />
              <p
                className="mt-1 text-right font-montserrat text-[10px] font-medium leading-none text-[#898989]"
                aria-live="polite"
              >
                {customizeDraftText.length}/{customizeTextMaxLength}
              </p>
            </div>
            {showCustomizeApplyButton ? (
              <button
                type="button"
                onClick={handleCustomizeApplyClick}
                className="h-10 w-full shrink-0 cursor-pointer rounded-md border-2 border-solid border-[#dcc090] bg-transparent font-montserrat text-[18px] font-extrabold uppercase tracking-[1.5px] text-[#dcc090] transition-colors duration-200 hover:bg-[#dcc090]/12 hover:text-[#3a3428] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcc090] active:bg-[#dcc090]/20 sm:mt-1 sm:w-[168px]"
              >
                {t(language, 'product.customize_apply')}
              </button>
            ) : null}
          </div>
          {appliedCustomize?.plain ? (
            <button
              type="button"
              onClick={handleCustomizeClearApplied}
              className="w-fit font-montserrat text-[13px] font-medium text-[#898989] underline decoration-[#898989] underline-offset-2 transition-colors hover:text-[#414141] hover:decoration-[#414141] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcc090]"
            >
              {t(language, 'product.customize_clear_applied')}
            </button>
          ) : null}
          {appliedPreviewPlain ? (
            <div
              className="max-w-[763px] rounded-md border border-[#dcc090]/60 bg-[#faf8f4] px-3 py-2.5 sm:px-4"
              aria-live="polite"
            >
              <p className="font-montserrat text-[11px] font-semibold uppercase tracking-[0.08em] text-[#898989]">
                {t(language, 'product.customize_applied_text_label')}
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words font-montserrat text-[15px] font-medium leading-relaxed text-[#414141] sm:text-[16px]">
                {appliedPreviewPlain}
              </p>
            </div>
          ) : null}
          <p className="max-w-[763px] font-montserrat text-[12px] font-medium leading-snug text-[#898989] sm:text-[13px]">
            {t(language, 'product.customize_apply_cart_hint')}
          </p>
          <CustomizeFormatToolbar
            key={product.id}
            language={language}
            format={customizeFormat}
            onFormatChange={onCustomizeFormatChange}
          />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {productDetails.map((item) => (
          <p key={item} className="text-[15px] leading-[24px] text-[#414141] sm:text-[16px] sm:leading-[26px]">
            {item}
          </p>
        ))}
      </div>
    );
  }, [
    activeTab,
    language,
    productDescription,
    productDetails,
    selectedCatalogSize,
    selectedCustomSizeRequest,
    appliedCustomize,
    appliedPreviewPlain,
    customizeDraftText,
    customizeTextMaxLength,
    onCustomizeDraftTextChange,
    handleCustomizeApplyClick,
    handleCustomizeClearApplied,
    product.id,
    customizeFormat,
    onCustomizeFormatChange,
    showCustomizeApplyButton,
  ]);

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
            {colorOptions.map((option) => {
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
          {selectedCollectionTitle ? (
            <div className="mt-2.5">
              <p className="font-montserrat text-[13px] font-medium leading-tight text-[#414141]">
                {t(language, 'product.collection_label')}: {selectedCollectionTitle} {' '}
                {formatPriceInCurrency(Math.max(0, selectedCollectionPriceAmd), 'AMD')}
              </p>
            </div>
          ) : null}
        </div>
      )}
      </div>

      <div className={PRODUCT_INFO_TABS_SECTION_CLASS}>
        <div className="w-full min-w-0 shrink-0 touch-pan-x overflow-x-auto overscroll-x-contain scroll-px-1 pb-2 scrollbar-hide [-webkit-overflow-scrolling:touch] sm:touch-auto sm:pb-0">
          <div
            className="flex w-max max-w-none snap-x snap-mandatory flex-nowrap items-end gap-5 pr-4 sm:snap-none sm:gap-7 sm:pr-5"
            role="tablist"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'description'}
              onClick={() => setActiveTab('description')}
              className={`relative shrink-0 snap-start whitespace-nowrap ${productTabLabelClass} ${
                activeTab === 'description' ? 'text-[#414141]' : 'text-[#414141]/70'
              }`}
            >
              {t(language, 'product.description_title')}
              <span
                className={`${PRODUCT_INFO_TAB_INDICATOR_BASE_CLASS} ${
                  activeTab === 'description' ? 'bg-[#122a26]' : 'bg-transparent'
                }`}
                aria-hidden
              />
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'details'}
              onClick={() => setActiveTab('details')}
              className={`relative shrink-0 snap-start whitespace-nowrap ${productTabLabelClass} ${
                activeTab === 'details' ? 'text-[#414141]' : 'text-[#414141]/70'
              }`}
            >
              {t(language, 'product.details_title')}
              <span
                className={`${PRODUCT_INFO_TAB_INDICATOR_BASE_CLASS} ${
                  activeTab === 'details' ? 'bg-[#122a26]' : 'bg-transparent'
                }`}
                aria-hidden
              />
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'shipping'}
              onClick={() => setActiveTab('shipping')}
              className={`relative shrink-0 snap-start whitespace-nowrap ${productTabLabelClass} ${
                activeTab === 'shipping' ? 'text-[#414141]' : 'text-[#414141]/70'
              }`}
            >
              {t(language, 'product.shipping_title')}
              <span
                className={`${PRODUCT_INFO_TAB_INDICATOR_BASE_CLASS} ${
                  activeTab === 'shipping' ? 'bg-[#122a26]' : 'bg-transparent'
                }`}
                aria-hidden
              />
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'customize'}
              onClick={() => setActiveTab('customize')}
              className={`relative shrink-0 snap-start whitespace-nowrap ${productTabLabelClass} ${
                activeTab === 'customize' ? 'text-[#414141]' : 'text-[#414141]/70'
              }`}
            >
              {t(language, 'product.customize_title')}
              <span
                className={`${PRODUCT_INFO_TAB_INDICATOR_BASE_CLASS} ${
                  activeTab === 'customize' ? 'bg-[#122a26]' : 'bg-transparent'
                }`}
                aria-hidden
              />
            </button>
          </div>
        </div>

        <div
          role="tabpanel"
          className={PRODUCT_INFO_TAB_PANEL_CLASS}
        >
          {renderedTabContent}
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
      onClose={() => setIsCustomizeSizeModalOpen(false)}
      language={language}
      sizeCategories={sizeCatalogCategories}
      selectedSizeItemId={selectedCatalogSize?.id ?? null}
      onSelectSizeCatalogItem={handleSelectCatalogSizeItem}
      onSelectCustomSizeRequest={handleSelectCustomSizeRequest}
    />
    </>
  );
}



