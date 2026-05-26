import { useMemo } from 'react';
import {
  processImageUrl,
  normalizeUrlForComparison,
  cleanImageUrls,
} from '../../../../lib/services/utils/image-utils';
import type { Product } from '../types';

/**
 * Main product gallery images from admin media only (variant images are excluded).
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

    return uniqueMainImages;
  }, [product]);
}
