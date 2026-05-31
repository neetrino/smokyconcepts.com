'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { getStoredLanguage, type LanguageCode } from '../../../lib/language';
import { useProductImages } from './hooks/useProductImages';
import { useProductFetch } from './hooks/useProductFetch';
import { useVariantSelection } from './hooks/useVariantSelection';
import { useProductQuantity } from './hooks/useProductQuantity';
import { useProductCalculations } from './hooks/useProductCalculations';
import { useAttributeGroups } from './useAttributeGroups';
import type { ProductVariant } from './types';
import { getOptionValue, getOptionValues, normalizeVersionToken, variantHasColor, variantHasOptionValue } from './utils/variant-helpers';
import { findVariantByAllAttributes } from './utils/variant-finders';
import { switchToVariantImage } from './utils/image-switching';

export function useProductPage(params: Promise<{ slug?: string }>) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [variantHeroImageUrl, setVariantHeroImageUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showMessage, setShowMessage] = useState<string | null>(null);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedSizeVersion, setSelectedSizeVersion] = useState<string | null>(null);

  const resolvedParams = use(params);
  const rawSlug = resolvedParams?.slug ?? '';
  const slugParts = rawSlug.includes(':') ? rawSlug.split(':') : [rawSlug];
  const slug = slugParts[0];
  const variantIdFromUrl = slugParts.length > 1 ? slugParts[1] : null;

  const {
    product,
    loading,
  } = useProductFetch({
    slug,
    variantIdFromUrl,
  });

  const images = useProductImages(product);
  const heroImageSrc =
    variantHeroImageUrl ??
    (images.length > 0 ? images[currentImageIndex] : '');
  const activeThumbnailIndex = variantHeroImageUrl ? null : currentImageIndex;
  const selectedAttributeValues = useMemo(() => {
    const map = new Map<string, string>();
    if (selectedSizeVersion) {
      map.set('size_version', selectedSizeVersion);
    }
    return map;
  }, [selectedSizeVersion]);

  const { setSelectedVariant, currentVariant } = useVariantSelection({ product });
  const fallbackDefaultVariant = useMemo<ProductVariant | null>(() => {
    if (!product || currentVariant) {
      return null;
    }
    const defaultVariantId = product.defaultVariantId;
    if (!defaultVariantId) {
      return null;
    }

    const defaultVariantFromList =
      product.variants?.find(
        (variant) =>
          variant.id === defaultVariantId || variant.id.endsWith(defaultVariantId)
      ) ?? null;
    if (defaultVariantFromList) {
      return defaultVariantFromList;
    }

    const stock = Math.max(0, product.defaultVariantStock ?? 0);
    return {
      id: defaultVariantId,
      sku: product.defaultVariantSku ?? '',
      price: product.defaultPrice ?? 0,
      originalPrice: product.defaultOriginalPrice ?? null,
      compareAtPrice: product.defaultCompareAtPrice ?? undefined,
      stock,
      available: stock > 0,
      options: [],
      productDiscount: product.productDiscount ?? null,
      globalDiscount: product.globalDiscount ?? null,
    };
  }, [currentVariant, product]);
  const hasPurchasableVariants = (product?.variants?.length ?? 0) > 0;
  const variantForPurchase =
    currentVariant ?? (hasPurchasableVariants ? null : fallbackDefaultVariant);
  const attributeGroups = useAttributeGroups({
    product,
    selectedColor,
    selectedSize,
    selectedAttributeValues,
  });
  const colorOptions = attributeGroups.get('color') ?? [];
  const sizeOptions = attributeGroups.get('size') ?? [];

  const {
    price,
    originalPrice,
    compareAtPrice,
    discountPercent,
    isOutOfStock,
    isVariationRequired,
    canAddToCart,
  } = useProductCalculations({ product, currentVariant: variantForPurchase });

  const { quantity, maxQuantity, adjustQuantity } = useProductQuantity({
    currentVariant: variantForPurchase,
    isOutOfStock,
    isVariationRequired,
  });

  useEffect(() => {
    setLanguage(getStoredLanguage());
  }, []);

  useEffect(() => {
    if (images.length > 0 && currentImageIndex >= images.length) {
      setCurrentImageIndex(0);
    }
  }, [images.length, currentImageIndex]);

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0 && variantIdFromUrl) {
      const variantById = product.variants.find(v => v.id === variantIdFromUrl || v.id.endsWith(variantIdFromUrl));
      const variantByIndex = product.variants[parseInt(variantIdFromUrl) - 1];
      const initialVariant = variantById || variantByIndex || product.variants[0];
      setSelectedVariant(initialVariant);
      setSelectedColor(getOptionValue(initialVariant.options, 'color'));
      setSelectedSize(getOptionValue(initialVariant.options, 'size'));
      setSelectedSizeVersion(getOptionValue(initialVariant.options, 'size_version'));
      setCurrentImageIndex(0);
      setThumbnailStartIndex(0);
      switchToVariantImage(initialVariant, product, setVariantHeroImageUrl);
      return;
    }

    if (product?.variants?.length) {
      const hasConfigurableVariants = product.variants.some((variant) => (variant.options?.length || 0) > 0);
      if (hasConfigurableVariants) {
        setSelectedVariant(null);
        setSelectedColor(null);
        setSelectedSize(null);
        setSelectedSizeVersion(null);
        setVariantHeroImageUrl(null);
        return;
      }
      const fallbackVariant = product.variants[0];
      setSelectedVariant(fallbackVariant);
      setSelectedColor(getOptionValue(fallbackVariant.options, 'color'));
      setSelectedSize(getOptionValue(fallbackVariant.options, 'size'));
      setSelectedSizeVersion(getOptionValue(fallbackVariant.options, 'size_version'));
      switchToVariantImage(fallbackVariant, product, setVariantHeroImageUrl);
    }
  }, [product, product?.id, product?.variants, variantIdFromUrl, setSelectedVariant]);

  useEffect(() => {
    if (!product?.variants?.length) {
      setSelectedColor(null);
      setSelectedSize(null);
      return;
    }
    const hasAnySelection =
      Boolean(selectedColor) ||
      Boolean(selectedSize) ||
      selectedAttributeValues.size > 0;
    if (!hasAnySelection) {
      return;
    }

    const nextVariant = findVariantByAllAttributes(
      product,
      selectedColor,
      selectedSize,
      selectedAttributeValues
    );

    if (!nextVariant || nextVariant.id === currentVariant?.id) {
      return;
    }

    setSelectedVariant(nextVariant);
    switchToVariantImage(nextVariant, product, setVariantHeroImageUrl);
    /**
     * Use images.length (not `images` reference) so a stable gallery index is not reset when
     * useMemo returns a new array reference for the same product. Thumbnail clicks only change
     * currentImageIndex; they must not re-trigger this effect via referential churn on `images`.
     */
  }, [
    currentVariant?.id,
    images.length,
    product,
    selectedAttributeValues,
    selectedColor,
    selectedSize,
    setSelectedVariant,
  ]);

  useEffect(() => {
    if (!currentVariant) {
      return;
    }

    const nextColor = getOptionValue(currentVariant.options, 'color');
    const sizeValues = getOptionValues(currentVariant.options, 'size');
    const sizeVersionValues = getOptionValues(currentVariant.options, 'size_version');

    setSelectedColor((prev) => {
      if (prev && variantHasColor(currentVariant, prev)) {
        return prev;
      }
      return nextColor ?? prev;
    });
    setSelectedSize((prev) => {
      if (prev && sizeValues.includes(prev)) {
        return prev;
      }
      return sizeValues[0] ?? prev;
    });
    setSelectedSizeVersion((prev) => {
      if (!prev) {
        const firstVersion = sizeVersionValues[0];
        return firstVersion ? normalizeVersionToken(firstVersion) : prev;
      }
      const normalizedPrev = normalizeVersionToken(prev);
      const hasMatch = sizeVersionValues.some(
        (value) => normalizeVersionToken(value) === normalizedPrev
      );
      if (hasMatch) {
        return prev;
      }
      const firstVersion = sizeVersionValues[0];
      return firstVersion ? normalizeVersionToken(firstVersion) : null;
    });
  }, [currentVariant?.id]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color.toLowerCase().trim());
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size.toLowerCase().trim());
    setSelectedSizeVersion(null);
  };

  const handleCatalogVariantSelect = (sizeCollectionTitle: string, version: string) => {
    const normalizedSize = sizeCollectionTitle.toLowerCase().trim();
    const normalizedVersion = normalizeVersionToken(version);
    if (!product?.variants?.length || !normalizedSize) {
      return;
    }

    const exactMatches = product.variants.filter((variant) => {
      if (!variantHasOptionValue(variant, 'size', normalizedSize)) {
        return false;
      }
      if (!normalizedVersion) {
        return true;
      }
      return variantHasOptionValue(variant, 'size_version', normalizedVersion);
    });

    const sizeOnlyMatches = product.variants.filter((variant) =>
      variantHasOptionValue(variant, 'size', normalizedSize)
    );

    const candidateMatches = exactMatches.length > 0 ? exactMatches : sizeOnlyMatches;

    if (candidateMatches.length === 0) {
      return;
    }

    const colorPreferredMatch =
      selectedColor != null
        ? candidateMatches.find((variant) => variantHasColor(variant, selectedColor))
        : null;
    const inStockMatch = candidateMatches.find((variant) => variant.stock > 0);
    const nextVariant = colorPreferredMatch || inStockMatch || candidateMatches[0];
    const nextVariantSize =
      variantHasOptionValue(nextVariant, 'size', normalizedSize)
        ? normalizedSize
        : getOptionValue(nextVariant.options, 'size') ?? normalizedSize;
    const variantVersionValues = getOptionValues(nextVariant.options, 'size_version');
    const matchedVersion = variantVersionValues.find(
      (value) => normalizeVersionToken(value) === normalizedVersion
    );
    const nextVariantVersion = normalizeVersionToken(
      matchedVersion ?? variantVersionValues[0] ?? null
    );

    setSelectedVariant(nextVariant);
    setSelectedSize(nextVariantSize);
    setSelectedSizeVersion(nextVariantVersion ?? normalizedVersion);
    const nextColor = getOptionValue(nextVariant.options, 'color');
    setSelectedColor(nextColor);
    switchToVariantImage(nextVariant, product, setVariantHeroImageUrl);
  };

  const handleImageIndexChange = (index: number) => {
    setVariantHeroImageUrl(null);
    setCurrentImageIndex(index);
  };

  return {
    product,
    loading,
    images,
    heroImageSrc,
    activeThumbnailIndex,
    currentImageIndex,
    setCurrentImageIndex: handleImageIndexChange,
    thumbnailStartIndex,
    setThumbnailStartIndex,
    language,
    selectedColor,
    selectedSize,
    colorOptions,
    sizeOptions,
    isAddingToCart,
    setIsAddingToCart,
    showMessage,
    setShowMessage,
    quantity,
    slug,
    currentVariant: variantForPurchase,
    price,
    originalPrice,
    compareAtPrice,
    discountPercent,
    maxQuantity,
    isOutOfStock,
    canAddToCart,
    adjustQuantity,
    handleColorSelect,
    handleSizeSelect,
    handleCatalogVariantSelect,
  };
}
