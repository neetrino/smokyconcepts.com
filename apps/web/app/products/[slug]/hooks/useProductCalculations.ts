import type { Product, ProductVariant } from '../types';

interface UseProductCalculationsProps {
  product: Product | null;
  currentVariant: ProductVariant | null;
}

/**
 * Price and stock from current variant only (no color/size/attribute logic).
 */
export function useProductCalculations({
  product,
  currentVariant,
}: UseProductCalculationsProps) {
  const totalVariantStock =
    product?.variants.reduce((sum, variant) => sum + Math.max(0, variant.stock ?? 0), 0) ?? 0;
  const fallbackStock = Math.max(0, product?.defaultVariantStock ?? 0);
  const hasAnyStock = totalVariantStock > 0 || fallbackStock > 0;

  const price = currentVariant?.price ?? product?.defaultPrice ?? 0;
  const originalPrice = currentVariant?.originalPrice ?? product?.defaultOriginalPrice ?? null;
  const compareAtPrice = currentVariant?.compareAtPrice ?? product?.defaultCompareAtPrice ?? null;
  const discountPercent = currentVariant?.productDiscount ?? product?.productDiscount ?? null;
  /**
   * Do not mark the whole PDP as out of stock before a variant is selected.
   * The CTA remains disabled via canAddToCart until we have a concrete variant.
   */
  const isOutOfStock = currentVariant ? (currentVariant.stock ?? 0) <= 0 : !hasAnyStock;
  const canAddToCart = !!currentVariant && !isOutOfStock;

  return {
    price,
    originalPrice,
    compareAtPrice,
    discountPercent,
    isOutOfStock,
    isVariationRequired: false,
    unavailableAttributes: new Map<string, boolean>(),
    hasUnavailableAttributes: false,
    canAddToCart,
  };
}
