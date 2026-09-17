import type { Product, ProductVariant, VariantOption } from '../types';
import {
  processImageUrl,
  smartSplitUrls,
} from '../../../../lib/services/utils/image-utils';
import {
  variantHasColor,
  variantHasOptionValue,
} from './variant-helpers';

function normalizeUrlForVariantMatch(url: string): string {
  let normalized = url.trim();
  if (normalized.startsWith('/')) {
    normalized = normalized.substring(1);
  }
  if (normalized.endsWith('/')) {
    normalized = normalized.substring(0, normalized.length - 1);
  }
  return normalized.toLowerCase();
}

function galleryImageMatchesVariantUrl(galleryImage: string, variantUrl: string): boolean {
  const processedGallery = processImageUrl(galleryImage);
  const processedVariant = processImageUrl(variantUrl);
  if (!processedGallery || !processedVariant) {
    return false;
  }

  const normalizedGallery = normalizeUrlForVariantMatch(processedGallery);
  const normalizedVariant = normalizeUrlForVariantMatch(processedVariant);
  if (normalizedGallery === normalizedVariant) {
    return true;
  }

  const galleryFilename = processedGallery.split('/').pop()?.toLowerCase().split('?')[0];
  const variantFilename = processedVariant.split('/').pop()?.toLowerCase().split('?')[0];
  return Boolean(
    galleryFilename &&
      variantFilename &&
      galleryFilename === variantFilename
  );
}

/**
 * Resolves the purchasable variant for a gallery image index (thumbnail / hero navigation).
 */
export function findVariantByGalleryImage(
  product: Product | null,
  images: string[],
  imageIndex: number
): ProductVariant | null {
  if (!product?.variants?.length || imageIndex < 0 || imageIndex >= images.length) {
    return null;
  }

  const galleryImage = images[imageIndex]?.trim();
  if (!galleryImage) {
    return null;
  }

  const matches = product.variants.filter((variant) => {
    if (!variant.imageUrl) {
      return false;
    }
    return smartSplitUrls(variant.imageUrl).some((url) =>
      galleryImageMatchesVariantUrl(galleryImage, url)
    );
  });

  if (matches.length === 0) {
    return null;
  }

  return matches.find((variant) => variant.stock > 0) ?? matches[0];
}

function preferPurchasableVariant(matches: ProductVariant[]): ProductVariant | null {
  if (matches.length === 0) {
    return null;
  }
  const nonDisplay = matches.filter((variant) => !variant.isDisplayVariant);
  const pool = nonDisplay.length > 0 ? nonDisplay : matches;
  return pool.find((variant) => variant.stock > 0) ?? pool[0] ?? null;
}

/**
 * Find variant by color and size
 * @param product - Product to search in
 * @param color - Color value to match
 * @param size - Size value to match
 * @returns Matching variant or null
 */
export function findVariantByColorAndSize(
  product: Product | null,
  color: string | null,
  size: string | null
): ProductVariant | null {
  if (!product?.variants || product.variants.length === 0) return null;

  const normalizedColor = color?.toLowerCase().trim();
  const normalizedSize = size?.toLowerCase().trim();

  if (normalizedColor && normalizedSize) {
    return preferPurchasableVariant(
      product.variants.filter(
        (variant) =>
          variantHasColor(variant, normalizedColor) &&
          variantHasOptionValue(variant, 'size', normalizedSize)
      )
    );
  }

  if (normalizedColor) {
    return preferPurchasableVariant(
      product.variants.filter((variant) => variantHasColor(variant, normalizedColor))
    );
  }

  if (normalizedSize) {
    return preferPurchasableVariant(
      product.variants.filter((variant) => variantHasOptionValue(variant, 'size', normalizedSize))
    );
  }

  return null;
}

/**
 * Find variant by all selected attributes (color, size, and other attributes)
 * This function considers all selected attribute values to find the best matching variant
 * @param product - Product to search in
 * @param color - Color value to match
 * @param size - Size value to match
 * @param otherAttributes - Map of other attribute key-value pairs
 * @returns Matching variant or null
 */
export function findVariantByAllAttributes(
  product: Product | null,
  color: string | null,
  size: string | null,
  otherAttributes: Map<string, string>
): ProductVariant | null {
  if (!product?.variants || product.variants.length === 0) return null;

  const normalizedColor = color?.toLowerCase().trim();
  const normalizedSize = size?.toLowerCase().trim();

  // Build a map of all selected attributes (including color and size)
  const allSelectedAttributes = new Map<string, string>();
  if (normalizedColor) allSelectedAttributes.set('color', normalizedColor);
  if (normalizedSize) allSelectedAttributes.set('size', normalizedSize);
  otherAttributes.forEach((value, key) => {
    if (key !== 'color' && key !== 'size') {
      allSelectedAttributes.set(key, value.toLowerCase().trim());
    }
  });

  // Helper to check if a variant matches all selected attributes
  const variantMatches = (variant: ProductVariant): boolean => {
    // Check color - IMPORTANT: Use variantHasColor to check ALL color options
    if (normalizedColor) {
      if (!variantHasColor(variant, normalizedColor)) return false;
    }

    // Check size (variant may list multiple sizes when admin selected "all")
    if (normalizedSize && !variantHasOptionValue(variant, 'size', normalizedSize)) {
      return false;
    }

    // Check other attributes (size_version, etc.)
    for (const [attrKey, attrValue] of otherAttributes.entries()) {
      if (attrKey === 'color' || attrKey === 'size') {
        continue;
      }

      if (!variantHasOptionValue(variant, attrKey, attrValue)) {
        return false;
      }
    }

    return true;
  };

  const exactMatches = product.variants.filter(variantMatches);
  const exactWithImage = preferPurchasableVariant(
    exactMatches.filter((variant) => Boolean(variant.imageUrl))
  );
  if (exactWithImage) {
    return exactWithImage;
  }

  const anyExact = preferPurchasableVariant(exactMatches);
  if (anyExact) {
    return anyExact;
  }

  if (normalizedColor || normalizedSize) {
    return findVariantByColorAndSize(
      product,
      normalizedColor || null,
      normalizedSize || null
    );
  }

  return null;
}




