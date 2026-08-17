'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';
import {
  findSizeCatalogItemById,
  resolveCatalogItemId,
} from '../../components/catalogSizeFilterDraft';
import { matchVariantSizeFromCatalogTitle } from '../utils/productInfoAndActions.helpers';
import type { ProductOptionValue } from '../productInfoAndActions.types';

const ALL_SIZE_QUERY = 'all';

function normalizeCatalogSizeValue(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

interface UseApplyCatalogSizeFromUrlParams {
  productId: string;
  sizeCatalogReady: boolean;
  sizeCatalogCategories: SizeCatalogCategoryDto[];
  sizeOptions: ProductOptionValue[];
  onSelectCatalogSizeItem: (item: SizeCatalogItemDto) => void;
  onSizeSelect: (size: string) => void;
}

/**
 * When landing on PDP from filtered `/products?size=&sizeCat=`, preselect the
 * matching size-catalog item (or variant size option).
 */
export function useApplyCatalogSizeFromUrl({
  productId,
  sizeCatalogReady,
  sizeCatalogCategories,
  sizeOptions,
  onSelectCatalogSizeItem,
  onSizeSelect,
}: UseApplyCatalogSizeFromUrlParams): void {
  const searchParams = useSearchParams();
  const appliedUrlSizeKeyRef = useRef<string | null>(null);

  useEffect(() => {
    appliedUrlSizeKeyRef.current = null;
  }, [productId]);

  useEffect(() => {
    if (!sizeCatalogReady) {
      return;
    }

    const sizeFromUrl = (searchParams.get('size') ?? '').trim();
    const sizeCatFromUrl = (searchParams.get('sizeCat') ?? '').trim();
    if (!sizeFromUrl || sizeFromUrl.toLowerCase() === ALL_SIZE_QUERY) {
      return;
    }

    const applyKey = `${productId}:${sizeFromUrl}:${sizeCatFromUrl}`;
    if (appliedUrlSizeKeyRef.current === applyKey) {
      return;
    }

    if (sizeCatalogCategories.length > 0) {
      const itemId = resolveCatalogItemId(sizeCatalogCategories, sizeFromUrl, sizeCatFromUrl);
      const catalogItem = itemId ? findSizeCatalogItemById(sizeCatalogCategories, itemId) : null;
      if (catalogItem) {
        onSelectCatalogSizeItem(catalogItem);
        appliedUrlSizeKeyRef.current = applyKey;
        return;
      }
    }

    if (sizeOptions.length === 0) {
      return;
    }

    const matchedSize =
      matchVariantSizeFromCatalogTitle(sizeFromUrl, sizeOptions) ??
      sizeOptions.find(
        (option) =>
          normalizeCatalogSizeValue(option.label) === normalizeCatalogSizeValue(sizeFromUrl) ||
          normalizeCatalogSizeValue(option.value) === normalizeCatalogSizeValue(sizeFromUrl)
      )?.value ??
      null;

    if (!matchedSize) {
      return;
    }

    onSizeSelect(matchedSize);
    appliedUrlSizeKeyRef.current = applyKey;
  }, [
    onSelectCatalogSizeItem,
    onSizeSelect,
    productId,
    searchParams,
    sizeCatalogCategories,
    sizeCatalogReady,
    sizeOptions,
  ]);
}
