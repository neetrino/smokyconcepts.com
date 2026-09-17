import { useState, useEffect, useCallback } from 'react';
import type { ProductVariant } from '../types';

interface UseProductQuantityProps {
  currentVariant: ProductVariant | null;
  isVariationRequired: boolean;
}

const MIN_LINE_QUANTITY = 1;

export function useProductQuantity({
  currentVariant,
  isVariationRequired,
}: UseProductQuantityProps) {
  const [quantity, setQuantity] = useState(MIN_LINE_QUANTITY);

  useEffect(() => {
    setQuantity((prev) => (prev < MIN_LINE_QUANTITY ? MIN_LINE_QUANTITY : prev));
  }, [currentVariant?.id]);

  const adjustQuantity = useCallback((delta: number) => {
    if (isVariationRequired) return;

    setQuantity((prev) => {
      const next = prev + delta;
      return next < MIN_LINE_QUANTITY ? MIN_LINE_QUANTITY : next;
    });
  }, [isVariationRequired]);

  return { quantity, setQuantity, adjustQuantity };
}
