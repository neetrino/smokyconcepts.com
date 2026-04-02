'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { getStoredLanguage, type LanguageCode } from '../../../lib/language';
import { useProductImages } from './hooks/useProductImages';
import { useProductFetch } from './hooks/useProductFetch';
import { useVariantSelection } from './hooks/useVariantSelection';
import { useProductQuantity } from './hooks/useProductQuantity';
import { useProductCalculations } from './hooks/useProductCalculations';
import { useAttributeGroups } from './useAttributeGroups';
import { getOptionValue } from './utils/variant-helpers';
import { findVariantByAllAttributes } from './utils/variant-finders';
import { switchToVariantImage } from './utils/image-switching';

export function useProductPage(params: Promise<{ slug?: string }>) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showMessage, setShowMessage] = useState<string | null>(null);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

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
  const selectedAttributeValues = useMemo(() => new Map<string, string>(), []);

  const { setSelectedVariant, currentVariant } = useVariantSelection({ product });
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
  } = useProductCalculations({ product, currentVariant });

  const { quantity, maxQuantity, adjustQuantity } = useProductQuantity({
    currentVariant,
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
      setCurrentImageIndex(0);
      setThumbnailStartIndex(0);
      return;
    }

    if (product?.variants?.length) {
      const hasConfigurableVariants = product.variants.some((variant) => (variant.options?.length || 0) > 0);
      if (hasConfigurableVariants) {
        setSelectedVariant(null);
        setSelectedColor(null);
        setSelectedSize(null);
        return;
      }
      const fallbackVariant = product.variants[0];
      setSelectedVariant(fallbackVariant);
      setSelectedColor(getOptionValue(fallbackVariant.options, 'color'));
      setSelectedSize(getOptionValue(fallbackVariant.options, 'size'));
    }
  }, [product?.id, product?.variants, variantIdFromUrl, setSelectedVariant]);

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
    switchToVariantImage(nextVariant, product, images, setCurrentImageIndex);
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
    const nextSize = getOptionValue(currentVariant.options, 'size');

    setSelectedColor((prev) => (prev === nextColor ? prev : nextColor));
    setSelectedSize((prev) => (prev === nextSize ? prev : nextSize));
  }, [currentVariant?.id]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color.toLowerCase().trim());
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size.toLowerCase().trim());
  };

  const handleImageIndexChange = (index: number) => {
    setCurrentImageIndex(index);
    if (index === 0) {
      setSelectedVariant(null);
      setSelectedColor(null);
      setSelectedSize(null);
    }
  };

  return {
    product,
    loading,
    images,
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
    currentVariant,
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
  };
}
