import { useMemo } from 'react';
import {
  processImageUrl,
  normalizeUrlForComparison,
  cleanImageUrls,
} from '../../../../lib/services/utils/image-utils';
import type { Product } from '../types';

function resolveDisplayVariantImage(product: Product): string | null {
  const displayVariant =
    product.variants?.find((variant) => variant.isDisplayVariant) ?? product.variants?.[0] ?? null;
  const imageUrl = displayVariant?.imageUrl?.trim();
  if (!imageUrl) {
    return null;
  }
  return imageUrl.split(',')[0]?.trim() || null;
}

/**
 * Product gallery: saved product media, or the admin-selected display variant image.
 */
export function useProductImages(product: Product | null): string[] {
  return useMemo(() => {
    if (!product) {
      return [];
    }

    const mainImages = Array.isArray(product.media) ? product.media : [];
    const cleanedMain = cleanImageUrls(mainImages);
    const uniqueMainImages: string[] = [];
    const seenNormalized = new Set<string>();

    cleanedMain.forEach((img) => {
      const processed = processImageUrl(img) || img;
      const normalized = normalizeUrlForComparison(processed);
      if (!seenNormalized.has(normalized)) {
        uniqueMainImages.push(img);
        seenNormalized.add(normalized);
      }
    });

    if (uniqueMainImages.length > 0) {
      return uniqueMainImages;
    }

    const displayImage = resolveDisplayVariantImage(product);
    return displayImage ? [displayImage] : [];
  }, [product]);
}
