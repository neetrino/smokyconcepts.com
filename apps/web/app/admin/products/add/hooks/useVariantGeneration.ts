'use client';

import { useCallback } from 'react';
import type { GeneratedVariant } from '../types';

interface UseVariantGenerationProps {
  setGeneratedVariants: (updater: (prev: GeneratedVariant[]) => GeneratedVariant[]) => void;
}

export function useVariantGeneration({ setGeneratedVariants }: UseVariantGenerationProps) {
  const applyToAllVariants = useCallback(
    (field: 'price' | 'compareAtPrice' | 'stock' | 'sku', value: string) => {
      setGeneratedVariants((prev) =>
        prev.map((variant) => ({
          ...variant,
          [field]: value,
        }))
      );
    },
    [setGeneratedVariants]
  );

  return {
    applyToAllVariants,
  };
}
