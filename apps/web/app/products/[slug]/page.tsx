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
import { getPlainTextFromHtml, sanitizeCustomizeHtml } from './utils/sanitize-customize-html';
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
    heroImageSrc,
    activeThumbnailIndex,
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

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const raw = buildCustomizePreviewHtml(customizeDraftText, customizeFormat);
    const sanitized = sanitizeCustomizeHtml(raw);
    const plain = getPlainTextFromHtml(sanitized).trim();

    setCustomizeApplied((previous) => {
      if (!plain) {
        return previous === null ? previous : null;
      }
      const next = {
        plain,
        html: sanitized.trim().length > 0 ? sanitized : null,
      };
      if (previous?.plain === next.plain && (previous?.html ?? '') === (next.html ?? '')) {
        return previous;
      }
      return next;
    });
  }, [customizeDraftText, customizeFormat]);

  const liveOverlayHtml = useMemo(() => {
    if (!customizeDraftText.trim()) {
      return null;
    }
    return buildCustomizePreviewHtml(customizeDraftText, customizeFormat);
  }, [customizeDraftText, customizeFormat]);

  const customizePreviewHtml = useMemo(() => {
    if (liveOverlayHtml) {
      return liveOverlayHtml;
    }
    const appliedHtml = customizeApplied?.html?.trim();
    if (appliedHtml) {
      return appliedHtml;
    }
    const appliedPlain = customizeApplied?.plain?.trim();
    if (appliedPlain) {
      return buildCustomizePreviewHtml(appliedPlain, getDefaultCustomizeFormat());
    }
    return null;
  }, [liveOverlayHtml, customizeApplied]);

  const hasCustomizePreviewText = Boolean(
    customizeDraftText.trim() || customizeApplied?.plain?.trim() || customizeApplied?.html?.trim()
  );

  const showCustomizeHeroPreview = isCustomizeTabActive && hasCustomizePreviewText;

  const shouldLoadCustomizeFonts =
    isCustomizeTabActive ||
    Boolean(customizeDraftText.trim()) ||
    Boolean(customizeApplied?.plain?.trim()) ||
    Boolean(customizeApplied?.html?.trim());

  const onCustomizeDraftTextChange = useCallback((value: string) => {
    setCustomizeDraftText(value);
  }, []);

  useCustomizeGoogleFontLinks(shouldLoadCustomizeFonts);

  const productDisplayTitle = product
    ? getProductText(language, product.id, 'title') || product.title
    : '';

  const hasCustomizeForPricing = Boolean(
    customizeDraftText.trim() ||
      customizeApplied?.plain?.trim() ||
      customizeApplied?.html?.trim()
  );

  const hasExplicitCatalogSizePick = selectedCatalogSize != null;

  const { collectionPriceAmd, collectionCategoryTitle } = useProductSizeCatalogCollectionPrice({
    product,
    currentVariant,
    selectedSizeLabel: selectedSize,
    selectedCatalogSize,
    hasExplicitCatalogSizePick,
    hasAppliedCustomize: hasCustomizeForPricing,
  });

  const displayPrice =
    collectionPriceAmd > 0 ? price + collectionPriceAmd : price;

  const { handleAddToCart } = useProductCartActions({
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
    <div className="overflow-x-hidden overflow-y-visible bg-[#efefef]">
      <div className="mx-auto max-w-[1920px] overflow-x-hidden overflow-y-visible px-4 pb-16 pt-2 sm:px-6 lg:px-[120px] lg:pb-24 lg:pt-5">
        <div className="grid min-h-0 items-start gap-8 overflow-visible xl:grid-cols-[minmax(0,640px)_minmax(0,1fr)] xl:items-stretch xl:gap-11">
          <div className="flex min-h-0 min-w-0 flex-col gap-5 overflow-visible sm:gap-6">
            <ProductImageGallery
              images={images}
              heroImageSrc={heroImageSrc}
              activeThumbnailIndex={activeThumbnailIndex}
              product={product}
              language={language}
              currentImageIndex={currentImageIndex}
              onImageIndexChange={setCurrentImageIndex}
              thumbnailStartIndex={thumbnailStartIndex}
              onThumbnailStartIndexChange={setThumbnailStartIndex}
              customizeOverlayHtml={null}
              showCustomizeHeroPreview={showCustomizeHeroPreview}
              customizeHeroPreviewHtml={customizePreviewHtml}
            />
          </div>

          <div className={PRODUCT_INFO_COLUMN_CLASS}>
          <ProductInfoAndActions
            product={product}
            appliedCustomize={customizeApplied}
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
            onSelectedCatalogSizeChange={setSelectedCatalogSize}
            onSelectedCustomSizeRequestChange={setSelectedCustomSizeRequest}
            onCustomizeTabActiveChange={setIsCustomizeTabActive}
            showCustomizeHeroPreview={showCustomizeHeroPreview}
            customizePreviewHtml={customizePreviewHtml}
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
