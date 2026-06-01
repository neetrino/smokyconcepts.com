'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  isOutOfStockProductLabel,
  matchVariantSizeFromCatalogTitle,
} from '../utils/productInfoAndActions.helpers';
import type { ProductInfoAndActionsProps, ProductTabKey } from '../productInfoAndActions.types';

export function useProductInfoAndActions({
  product,
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
}: ProductInfoAndActionsProps) {
  const [activeTab, setActiveTab] = useState<ProductTabKey>('description');
  const [isCustomizeSizeModalOpen, setIsCustomizeSizeModalOpen] = useState(false);
  const [sizeCatalogCategories, setSizeCatalogCategories] = useState<SizeCatalogCategoryDto[]>([]);
  const [selectedCatalogSize, setSelectedCatalogSize] = useState<SizeCatalogItemDto | null>(null);
  const [selectedCustomSizeRequest, setSelectedCustomSizeRequest] = useState<CustomOrderDraft | null>(null);
  const [showSizeRequired, setShowSizeRequired] = useState(false);
  const [isSizeShaking, setIsSizeShaking] = useState(false);

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
    setShowSizeRequired(false);
    setIsSizeShaking(false);
  }, [product.id]);

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

  const isSizeSelected =
    !showSizeSection ||
    Boolean(selectedCustomSizeRequest || selectedCatalogSize || activeSizeOption);

  useEffect(() => {
    if (isSizeSelected) {
      setShowSizeRequired(false);
      setIsSizeShaking(false);
    }
  }, [isSizeSelected]);

  const triggerSizeValidation = useCallback(() => {
    setShowSizeRequired(true);
    setIsSizeShaking(false);
    requestAnimationFrame(() => {
      setIsSizeShaking(true);
    });
  }, []);

  const handleSizeShakeAnimationEnd = useCallback(() => {
    setIsSizeShaking(false);
  }, []);

  const handleSelectCatalogSizeItem = (item: SizeCatalogItemDto) => {
    setSelectedCatalogSize(item);
    setSelectedCustomSizeRequest(null);
    onSelectedCatalogSizeChange?.(item);
    onSelectedCustomSizeRequestChange?.(null);
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
    onSelectedCatalogSizeChange?.(null);
    onSelectedCustomSizeRequestChange?.(draft);
    if (sizeOptions.length > 0) {
      onSizeSelect(sizeOptions[0].value);
    }
  };

  const openSizeCatalogModal = () => {
    void preloadSizeCatalogCategories(sizeCatalogCategories);
    setIsCustomizeSizeModalOpen(true);
  };

  const closeSizeCatalogModal = () => {
    setIsCustomizeSizeModalOpen(false);
  };

  const productTabLabelClass =
    language === 'en'
      ? 'pb-3 font-montserrat text-[17px] font-black leading-none sm:text-[18px] md:text-[19px]'
      : 'pb-3 font-montserrat text-[16px] font-black leading-none sm:text-[17px] md:text-[18px]';

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
            .filter((item) => !(currentVariant === null && isOutOfStockProductLabel(item.text)))
        : [],
    [product.labels, product.id, currentVariant]
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
  };
}
