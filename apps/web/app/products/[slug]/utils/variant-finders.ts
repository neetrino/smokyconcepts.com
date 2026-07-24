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

  // 1. Try exact match (Case-insensitive)
  // IMPORTANT: Use variantHasColor to check ALL color options, not just the first one
  if (normalizedColor && normalizedSize) {
    const variant = product.variants.find((v) => {
      const hasColor = variantHasColor(v, normalizedColor);
      return hasColor && variantHasOptionValue(v, 'size', normalizedSize);
    });
    if (variant) return variant;
  }

  // 2. If color selected but no exact match with size, find any variant of this color
  if (normalizedColor) {
    // Prefer in-stock variant of this color
    // IMPORTANT: Use variantHasColor to check ALL color options
    const colorVariants = product.variants.filter((v) =>
      variantHasColor(v, normalizedColor)
    );

    if (colorVariants.length > 0) {
      return colorVariants.find((v) => v.stock > 0) || colorVariants[0];
    }
  }

  // 3. If only size selected or fallback for size
  if (normalizedSize) {
    const sizeVariants = product.variants.filter((v) =>
      variantHasOptionValue(v, 'size', normalizedSize)
    );

    if (sizeVariants.length > 0) {
      return sizeVariants.find((v) => v.stock > 0) || sizeVariants[0];
    }
  }

  // 4. Ultimate fallback
  return product.variants.find((v) => v.stock > 0) || product.variants[0] || null;
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

  // 1. Try to find exact match with all attributes
  const exactMatch = product.variants.find(
    (v) => variantMatches(v) && v.imageUrl
  );
  if (exactMatch) {
    return exactMatch;
  }

  // 2. Try to find any match (even without image) with all attributes
  const anyMatch = product.variants.find((v) => variantMatches(v));
  if (anyMatch) {
    return anyMatch;
  }

  // 3. Fallback: find by color and size only
  if (normalizedColor || normalizedSize) {
    return findVariantByColorAndSize(
      product,
      normalizedColor || null,
      normalizedSize || null
    );
  }

  // 4. Ultimate fallback
  return product.variants.find((v) => v.stock > 0) || product.variants[0] || null;
}




