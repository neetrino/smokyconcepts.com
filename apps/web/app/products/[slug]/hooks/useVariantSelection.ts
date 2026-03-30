import { useState, useEffect } from 'react';
import type { Product, ProductVariant } from '../types';

interface UseVariantSelectionProps {
  product: Product | null;
}

/**
 * Single variant selection: always uses first variant (no color/size/attribute selectors).
 */
export function useVariantSelection({ product }: UseVariantSelectionProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const hasConfigurableVariants = (product?.variants || []).some(
    (variant) => (variant.options?.length || 0) > 0
  );

  useEffect(() => {
    if (product?.variants?.length) {
      if (hasConfigurableVariants) {
        setSelectedVariant(null);
      } else {
        setSelectedVariant(product.variants[0]);
      }
    } else {
      setSelectedVariant(null);
    }
  }, [hasConfigurableVariants, product?.id, product?.variants]);

  const currentVariant =
    selectedVariant || (hasConfigurableVariants ? null : product?.variants?.[0] || null);

  return {
    selectedVariant,
    setSelectedVariant,
    currentVariant,
  };
}
