import type { Product, ProductVariant } from '../types';
import {
  processImageUrl,
  smartSplitUrls,
} from '../../../../lib/services/utils/image-utils';
import { variantHasColor } from './variant-helpers';
import { getOptionValue } from './variant-helpers';

/**
 * Helper function to normalize URLs for comparison
 */
function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (normalized.startsWith('/')) normalized = normalized.substring(1);
  if (normalized.endsWith('/'))
    normalized = normalized.substring(0, normalized.length - 1);
  return normalized.toLowerCase();
}

/**
 * Check if variant image is an attribute value image (these are excluded from hero override)
 */
function isAttributeValueImage(url: string, product: Product): boolean {
  if (!product.productAttributes) return false;

  for (const productAttr of product.productAttributes) {
    if (productAttr.attribute?.values) {
      for (const val of productAttr.attribute.values) {
        if (val.imageUrl) {
          const attrProcessed = processImageUrl(val.imageUrl);
          if (attrProcessed) {
            const normalizedAttr = normalizeUrl(attrProcessed);
            const normalizedVariant = normalizeUrl(url);
            if (normalizedAttr === normalizedVariant) {
              return true;
            }
          }
        }
      }
    }
  }
  return false;
}

function resolveFirstVariantGalleryUrl(
  variant: ProductVariant,
  product: Product
): string | null {
  if (!variant.imageUrl) {
    return null;
  }

  const splitUrls = smartSplitUrls(variant.imageUrl);
  for (const url of splitUrls) {
    if (!url || url.trim() === '') {
      continue;
    }

    const processedUrl = processImageUrl(url);
    if (!processedUrl || isAttributeValueImage(processedUrl, product)) {
      continue;
    }

    return url;
  }

  return null;
}

/**
 * Resolves the hero image URL for a selected variant (not part of the main thumbnail strip).
 */
export function resolveVariantHeroImageUrl(
  variant: ProductVariant | null,
  product: Product | null
): string | null {
  if (!variant || !product) {
    return null;
  }

  const directUrl = resolveFirstVariantGalleryUrl(variant, product);
  if (directUrl) {
    return directUrl;
  }

  const variantColor = getOptionValue(variant.options, 'color');
  if (!variantColor || !product.variants) {
    return null;
  }

  const colorVariants = product.variants.filter(
    (v) => variantHasColor(v, variantColor) && v.imageUrl
  );

  for (const colorVariant of colorVariants) {
    const colorUrl = resolveFirstVariantGalleryUrl(colorVariant, product);
    if (colorUrl) {
      return colorUrl;
    }
  }

  return null;
}

/**
 * Shows the variant image in the hero slot when a matching variant is selected.
 */
export function switchToVariantImage(
  variant: ProductVariant | null,
  product: Product | null,
  setVariantHeroImageUrl: (url: string | null) => void
): void {
  setVariantHeroImageUrl(resolveVariantHeroImageUrl(variant, product));
}

/**
 * Handle color selection and switch hero to the variant image for that color.
 */
export function handleColorSelect(
  color: string,
  product: Product | null,
  selectedColor: string | null,
  setSelectedColor: (color: string | null) => void,
  setVariantHeroImageUrl: (url: string | null) => void
): void {
  if (!color || !product) {
    return;
  }

  const normalizedColor = color.toLowerCase().trim();
  if (selectedColor === normalizedColor) {
    setSelectedColor(null);
    setVariantHeroImageUrl(null);
    return;
  }

  setSelectedColor(normalizedColor);

  const colorVariants =
    product.variants?.filter(
      (v) => variantHasColor(v, normalizedColor) && v.imageUrl
    ) ?? [];

  for (const variant of colorVariants) {
    const variantUrl = resolveVariantHeroImageUrl(variant, product);
    if (variantUrl) {
      setVariantHeroImageUrl(variantUrl);
      return;
    }
  }

  setVariantHeroImageUrl(null);
}
