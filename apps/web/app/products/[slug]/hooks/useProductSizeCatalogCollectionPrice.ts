'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';
import type { Product, ProductVariant } from '../types';
import {
  resolveCollectionPriceAmdFromCategories,
  resolveCustomizeCollectionSelection,
} from '../utils/product-size-catalog-collection-price';

interface UseProductSizeCatalogCollectionPriceParams {
  product: Product | null;
  currentVariant: ProductVariant | null;
  selectedSizeLabel: string | null;
  selectedCatalogSize: SizeCatalogItemDto | null;
  /** Catalog modal pick — blocks default template surcharge after size is chosen. */
  hasExplicitCatalogSizePick: boolean;
  /** Applied customize text (Save on Customize tab) — triggers collection surcharge display. */
  hasAppliedCustomize: boolean;
}

export function useProductSizeCatalogCollectionPrice({
  product,
  currentVariant,
  selectedSizeLabel,
  selectedCatalogSize,
  hasExplicitCatalogSizePick,
  hasAppliedCustomize,
}: UseProductSizeCatalogCollectionPriceParams) {
  const [sizeCatalogCategories, setSizeCatalogCategories] = useState<SizeCatalogCategoryDto[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiClient.get<{ data: SizeCatalogCategoryDto[] }>('/api/v1/size-catalog');
        if (!cancelled) {
          setSizeCatalogCategories(res.data ?? []);
        }
      } catch {
        if (!cancelled) {
          setSizeCatalogCategories([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolved = useMemo(() => {
    if (!product || !hasAppliedCustomize) {
      return { priceAmd: 0, categoryTitle: null as string | null };
    }

    const selection = resolveCustomizeCollectionSelection({
      product,
      currentVariant,
      categories: sizeCatalogCategories,
      selectedCatalogSize:
        selectedCatalogSize != null
          ? {
              categoryId: selectedCatalogSize.categoryId,
              categoryTitle: selectedCatalogSize.categoryTitle,
              categoryPriceAmd: selectedCatalogSize.categoryPriceAmd,
            }
          : null,
      selectedSizeLabel,
      hasExplicitCatalogSizePick,
    });

    const resolved = resolveCollectionPriceAmdFromCategories(sizeCatalogCategories, selection);
    if (resolved.priceAmd > 0) {
      return resolved;
    }
    const embeddedPrice = selectedCatalogSize?.categoryPriceAmd ?? 0;
    if (embeddedPrice > 0 && selectedCatalogSize != null) {
      return {
        priceAmd: embeddedPrice,
        categoryTitle: selectedCatalogSize.categoryTitle,
      };
    }
    return resolved;
  }, [
    product,
    currentVariant,
    hasAppliedCustomize,
    hasExplicitCatalogSizePick,
    sizeCatalogCategories,
    selectedCatalogSize,
    selectedSizeLabel,
  ]);

  const collectionPriceAmd = resolved.priceAmd > 0 ? resolved.priceAmd : 0;

  return {
    collectionPriceAmd,
    collectionCategoryTitle: resolved.categoryTitle,
    shouldApplyCollectionPrice: collectionPriceAmd > 0,
  };
}
