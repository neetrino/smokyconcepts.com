'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { getStoredCurrency } from '../../../lib/currency';
import { getStoredLanguage, type LanguageCode } from '../../../lib/language';
import { useProductImages } from './hooks/useProductImages';
import { useProductFetch } from './hooks/useProductFetch';
import { useProductReviews } from './hooks/useProductReviews';
import { useVariantSelection } from './hooks/useVariantSelection';
import { useProductQuantity } from './hooks/useProductQuantity';
import { useProductCalculations } from './hooks/useProductCalculations';

export function useProductPage(params: Promise<{ slug?: string }>) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currency, setCurrency] = useState(getStoredCurrency());
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showMessage, setShowMessage] = useState<string | null>(null);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);

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

  const { selectedVariant, setSelectedVariant, currentVariant } = useVariantSelection({ product });

  const {
    price,
    originalPrice,
    compareAtPrice,
    discountPercent,
    isOutOfStock,
    isVariationRequired,
    unavailableAttributes,
    hasUnavailableAttributes,
    canAddToCart,
  } = useProductCalculations({ product, currentVariant });

  const { quantity, setQuantity, maxQuantity, adjustQuantity } = useProductQuantity({
    currentVariant,
    isOutOfStock,
    isVariationRequired,
  });

  const { reviews, averageRating } = useProductReviews({
    slug,
    productId: product?.id || null,
  });

  useEffect(() => {
    setLanguage(getStoredLanguage());
  }, []);

  useEffect(() => {
    const handleCurrencyUpdate = () => setCurrency(getStoredCurrency());
    const handleCurrencyRatesUpdate = () => setCurrency(getStoredCurrency());
    
    window.addEventListener('currency-updated', handleCurrencyUpdate);
    window.addEventListener('currency-rates-updated', handleCurrencyRatesUpdate);
    
    return () => {
      window.removeEventListener('currency-updated', handleCurrencyUpdate);
      window.removeEventListener('currency-rates-updated', handleCurrencyRatesUpdate);
    };
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
      setCurrentImageIndex(0);
      setThumbnailStartIndex(0);
    }
  }, [product, variantIdFromUrl, setSelectedVariant]);

  const scrollToReviews = useCallback(() => {
    const reviewsElement = document.getElementById('product-reviews');
    if (reviewsElement) {
      reviewsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return {
    product,
    loading,
    images,
    currentImageIndex,
    setCurrentImageIndex,
    thumbnailStartIndex,
    setThumbnailStartIndex,
    currency,
    language,
    selectedVariant,
    isAddingToCart,
    setIsAddingToCart,
    showMessage,
    setShowMessage,
    quantity,
    reviews,
    averageRating,
    slug,
    currentVariant,
    price,
    originalPrice,
    compareAtPrice,
    discountPercent,
    maxQuantity,
    isOutOfStock,
    canAddToCart,
    scrollToReviews,
    adjustQuantity,
  };
}
