'use client';

import { useMemo } from 'react';
import { useCollectionPrices } from '@/lib/collections/use-collection-prices';
import { resolveProductCollectionPriceAmd } from '@/lib/collections/resolve-product-collection-price-amd';
import type { Product } from '../types';

interface UseProductSizeCatalogCollectionPriceParams {
  product: Product | null;
}

export function useProductSizeCatalogCollectionPrice({
  product,
}: UseProductSizeCatalogCollectionPriceParams) {
  const livePrices = useCollectionPrices();

  const resolved = useMemo(() => {
    if (!product) {
      return { priceAmd: 0, categoryTitle: null as string | null };
    }
    return resolveProductCollectionPriceAmd(product.categories, livePrices);
  }, [product, livePrices]);

  const collectionPriceAmd = resolved.priceAmd > 0 ? resolved.priceAmd : 0;

  return {
    collectionPriceAmd,
    collectionCategoryTitle: resolved.categoryTitle,
    shouldApplyCollectionPrice: collectionPriceAmd > 0,
  };
}
