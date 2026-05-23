'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { t, getProductText } from '../../../lib/i18n';
import type { SizeCatalogItemDto } from '@/lib/types/size-catalog';
import { RelatedProducts } from '../../../components/RelatedProducts';
import { ProductImageGallery } from './ProductImageGallery';
import { ProductInfoAndActions } from './ProductInfoAndActions';
import {
  buildCustomizePreviewHtml,
  getDefaultCustomizeFormat,
  type CustomizeFormatState,
} from './utils/build-customize-preview-html';
import { sanitizeCustomizeHtml } from './utils/sanitize-customize-html';
import { useProductPage } from './useProductPage';
import { useProductCartActions } from './useProductCartActions';
import { useProductSizeCatalogCollectionPrice } from './hooks/useProductSizeCatalogCollectionPrice';
import { useCustomizeGoogleFontLinks } from './useCustomizeGoogleFontLinks';
import type { ProductPageProps } from './types';
import type { CustomOrderDraft } from './CustomizeSizeOrderFallback';
import { PRODUCT_INFO_COLUMN_CLASS } from './productInfoTabContent.constants';

const CUSTOMIZE_TEXT_MAX_LENGTH = 18;

export default function ProductPage({ params }: ProductPageProps) {
  const {
    product,
    loading,
    images,
    currentImageIndex,
    setCurrentImageIndex,
    thumbnailStartIndex,
    setThumbnailStartIndex,
    language,
    isAddingToCart,
    setIsAddingToCart,
    showMessage,
    setShowMessage,
    selectedColor,
    selectedSize,
    colorOptions,
    sizeOptions,
    quantity,
    currentVariant,
    price,
    originalPrice,
    isOutOfStock,
    canAddToCart,
    handleColorSelect,
    handleSizeSelect,
    handleCatalogVariantSelect,
  } = useProductPage(params);

  const [selectedCatalogSize, setSelectedCatalogSize] = useState<SizeCatalogItemDto | null>(null);
  const [selectedCustomSizeRequest, setSelectedCustomSizeRequest] = useState<CustomOrderDraft | null>(null);
  const [customizeApplied, setCustomizeApplied] = useState<{
    plain: string;
    html: string | null;
  } | null>(null);
  const [customizeDraftText, setCustomizeDraftText] = useState('');
  const [customizeFormat, setCustomizeFormat] = useState<CustomizeFormatState>(() => getDefaultCustomizeFormat());
  const [isCustomizeTabActive, setIsCustomizeTabActive] = useState(false);

  useEffect(() => {
    setSelectedCatalogSize(null);
    setSelectedCustomSizeRequest(null);
    setCustomizeApplied(null);
    setCustomizeDraftText('');
    setCustomizeFormat(getDefaultCustomizeFormat());
  }, [product?.id]);

  const onCustomizeApplied = useCallback((value: { plain: string; html: string | null } | null) => {
    setCustomizeApplied(value);
    setCustomizeDraftText(value?.plain ?? '');
    if (value === null) {
      setCustomizeFormat(getDefaultCustomizeFormat());
    }
  }, []);

  const liveOverlayHtml = useMemo(() => {
    if (!customizeDraftText.trim()) {
      return null;
    }
    return buildCustomizePreviewHtml(customizeDraftText, customizeFormat);
  }, [customizeDraftText, customizeFormat]);

  /** Live preview while on Customize tab; after Apply, keep showing applied HTML when user switches tabs. */
  const heroCustomizeOverlayHtml = useMemo(() => {
    const appliedHtml = customizeApplied?.html?.trim();
    const appliedPlain = customizeApplied?.plain?.trim();

    if (isCustomizeTabActive) {
      if (liveOverlayHtml) {
        return liveOverlayHtml;
      }
      if (appliedHtml) {
        return appliedHtml;
      }
      if (appliedPlain) {
        return buildCustomizePreviewHtml(appliedPlain, getDefaultCustomizeFormat());
      }
      return null;
    }

    if (appliedHtml) {
      return appliedHtml;
    }
    if (appliedPlain) {
      return buildCustomizePreviewHtml(appliedPlain, getDefaultCustomizeFormat());
    }
    return null;
  }, [isCustomizeTabActive, liveOverlayHtml, customizeApplied]);

  const shouldLoadCustomizeFonts =
    isCustomizeTabActive ||
    Boolean(customizeApplied?.plain?.trim()) ||
    Boolean(customizeApplied?.html?.trim());

  const onCustomizeDraftTextChange = useCallback((value: string) => {
    setCustomizeDraftText(value);
  }, []);

  useCustomizeGoogleFontLinks(shouldLoadCustomizeFonts);

  const getCustomizeSanitizedHtml = useCallback(() => {
    if (typeof document === 'undefined') {
      return '';
    }
    const raw = buildCustomizePreviewHtml(customizeDraftText, customizeFormat);
    return sanitizeCustomizeHtml(raw);
  }, [customizeDraftText, customizeFormat]);

  const productDisplayTitle = product
    ? getProductText(language, product.id, 'title') || product.title
    : '';

  const hasAppliedCustomize = Boolean(
    customizeApplied?.plain?.trim() || customizeApplied?.html?.trim()
  );

  const { collectionPriceAmd, collectionCategoryTitle } = useProductSizeCatalogCollectionPrice({
    product,
    currentVariant,
    selectedSizeLabel: selectedSize,
    selectedCatalogSize,
    hasAppliedCustomize,
  });

  const displayPrice =
    collectionPriceAmd > 0 ? price + collectionPriceAmd : price;

  const { handleAddToCart, handleBuyNow } = useProductCartActions({
    product,
    currentVariant,
    quantity,
    price,
    originalPrice,
    language,
    canAddToCart,
    productDisplayTitle,
    selectedCatalogSize,
    selectedCustomSizeRequest,
    customizeApplied,
    collectionPriceAmd,
    collectionCategoryTitle,
    setIsAddingToCart,
    setShowMessage,
  });

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        {t(language, 'common.messages.loading')}
      </div>
    );
  }

  return (
    <div className="overflow-visible bg-[#efefef]">
      <div className="mx-auto max-w-[1920px] overflow-visible px-4 pb-16 pt-2 sm:px-6 lg:px-[120px] lg:pb-24 lg:pt-5">
        <div className="grid min-h-0 items-start gap-8 overflow-visible xl:grid-cols-[minmax(0,640px)_minmax(0,1fr)] xl:items-stretch xl:gap-11">
          <div className="flex min-h-0 min-w-0 flex-col gap-5 overflow-visible sm:gap-6">
            <ProductImageGallery
              images={images}
              product={product}
              language={language}
              currentImageIndex={currentImageIndex}
              onImageIndexChange={setCurrentImageIndex}
              thumbnailStartIndex={thumbnailStartIndex}
              onThumbnailStartIndexChange={setThumbnailStartIndex}
              customizeOverlayHtml={heroCustomizeOverlayHtml}
            />
          </div>

          <div className={PRODUCT_INFO_COLUMN_CLASS}>
          <ProductInfoAndActions
            product={product}
            appliedCustomize={customizeApplied}
            onCustomizeApplied={onCustomizeApplied}
            getCustomizeSanitizedHtml={getCustomizeSanitizedHtml}
            customizeDraftText={customizeDraftText}
            onCustomizeDraftTextChange={onCustomizeDraftTextChange}
            customizeTextMaxLength={CUSTOMIZE_TEXT_MAX_LENGTH}
            customizeFormat={customizeFormat}
            onCustomizeFormatChange={setCustomizeFormat}
            price={displayPrice}
            language={language}
            isOutOfStock={isOutOfStock}
            canAddToCart={canAddToCart}
            isAddingToCart={isAddingToCart}
            showMessage={showMessage}
            currentVariant={currentVariant}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            colorOptions={colorOptions}
            sizeOptions={sizeOptions}
            onColorSelect={handleColorSelect}
            onSizeSelect={handleSizeSelect}
            onCatalogVariantSelect={handleCatalogVariantSelect}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onSelectedCatalogSizeChange={setSelectedCatalogSize}
            onSelectedCustomSizeRequestChange={setSelectedCustomSizeRequest}
            onCustomizeTabActiveChange={setIsCustomizeTabActive}
          />
          </div>
        </div>

        <div className="mt-16 lg:mt-[128px]">
          <RelatedProducts categorySlug={product.categories?.[0]?.slug} currentProductId={product.id} />
        </div>
      </div>
    </div>
  );
}
