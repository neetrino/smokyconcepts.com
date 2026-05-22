'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getProductText } from '../../../../lib/i18n';
import { t } from '../../../../lib/i18n';
import { apiClient } from '../../../../lib/api-client';
import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';
import { preloadSizeCatalogCategories } from '@/lib/size-catalog-image-cache';
import {
  getProductCollectionBadgeItems,
} from '../../components/catalogProductLabels';
import type { CustomOrderDraft } from '../CustomizeSizeOrderFallback';
import {
  getPlainTextFromHtml,
  sanitizeCustomizeHtml,
} from '../utils/sanitize-customize-html';
import {
  CUSTOMIZE_APPLIED_PREVIEW_MS,
  matchVariantSizeFromCatalogTitle,
} from '../utils/productInfoAndActions.helpers';
import type { ProductInfoAndActionsProps, ProductTabKey } from '../productInfoAndActions.types';

export function useProductInfoAndActions({
  product,
  appliedCustomize,
  onCustomizeApplied,
  language,
  currentVariant,
  selectedColor,
  selectedSize,
  colorOptions,
  sizeOptions,
  onColorSelect,
  onSizeSelect,
  onCatalogVariantSelect,
  onSelectedCatalogSizeChange,
  onSelectedCustomSizeRequestChange,
  onCustomizeTabActiveChange,
  getCustomizeSanitizedHtml,
  customizeDraftText,
  customizeFormat,
}: ProductInfoAndActionsProps) {
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
  const productTabHtml = product.productDetailsHtml ?? '';
  const shippingTabHtml = product.shippingHtml ?? '';

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

  const closeSizeCatalogModal = () => {
    setIsCustomizeSizeModalOpen(false);
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

  const productDetails = useMemo(
    () =>
      [
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
      ].filter(Boolean) as string[],
    [
      product.brand?.name,
      activeColorOption,
      activeSizeOption,
      selectedCustomSizeRequest,
      selectedCatalogSize,
      currentVariant?.sku,
      language,
    ]
  );

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

  return {
    activeTab,
    setActiveTab,
    productTitle,
    productDescription,
    productTabHtml,
    shippingTabHtml,
    productDetails,
    showSizeSection,
    sizeButtonLabel,
    selectedCollectionTitle,
    selectedCollectionPriceAmd,
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
  };
}
