import { useMemo } from 'react';
import { extractCustomizeOverlayImageUrl } from '@/lib/services/utils/product-media';
import type { Product } from '../types';

/** Product image used when customize text is shown on the PDP hero. */
export function useCustomizeOverlayImage(product: Product | null): string | null {
  return useMemo(() => {
    if (!product) {
      return null;
    }
    if (product.customizeOverlayImageUrl?.trim()) {
      return product.customizeOverlayImageUrl.trim();
    }
    if (!product.media) {
      return null;
    }
    return extractCustomizeOverlayImageUrl(product.media);
  }, [product]);
}
