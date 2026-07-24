'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/i18n';
import type { LanguageCode } from '@/lib/language';
import type { SizeCatalogItemDto } from '@/lib/types/size-catalog';
import type { Product, ProductVariant } from './types';
import type { CustomOrderDraft } from './CustomizeSizeOrderFallback';
import { dispatchCartDrawerOpen } from '@/app/cart/constants';
import {
  buildGuestCartLineSnapshot,
  canAddVariantToGuestCart,
  upsertGuestCartLineSnapshot,
} from './product-cart-snapshot';

interface UseProductCartActionsParams {
  product: Product | null;
  currentVariant: ProductVariant | null;
  quantity: number;
  price: number;
  originalPrice: number | null;
  language: LanguageCode;
  canAddToCart: boolean;
  productDisplayTitle: string;
  /** When user picked a row from the global size catalog modal */
  selectedCatalogSize: SizeCatalogItemDto | null;
  /** When user submitted fallback custom-size request in the size modal */
  selectedCustomSizeRequest: CustomOrderDraft | null;
  /** Last applied PDP customize (Apply) — attached to guest cart lines */
  customizeApplied: { plain: string; html: string | null } | null;
  /** Collection surcharge from admin sizes (modal pick or product template + customize). */
  collectionPriceAmd: number;
  collectionCategoryTitle: string | null;
  setIsAddingToCart: (value: boolean) => void;
  setShowMessage: (value: string | null) => void;
}

export function useProductCartActions({
  product,
  currentVariant,
  quantity,
  price,
  originalPrice,
  language,
  canAddToCart,
  productDisplayTitle,
  selectedCatalogSize,
  selectedCustomSizeRequest,
  customizeApplied,
  collectionPriceAmd,
  collectionCategoryTitle,
  setIsAddingToCart,
  setShowMessage,
}: UseProductCartActionsParams) {
  const router = useRouter();

  const runAddFlow = useCallback(
    (afterLocalAdd?: () => void) => {
      if (!canAddToCart || !product || !currentVariant) {
        return;
      }
      const quantityToAdd = Math.max(1, quantity);
      if (!canAddVariantToGuestCart(currentVariant, quantityToAdd)) {
        setShowMessage(t(language, 'product.errorAddingToCart'));
        setTimeout(() => setShowMessage(null), 2000);
        return;
      }

      setIsAddingToCart(true);
      try {
        const hasCustomize =
          customizeApplied != null &&
          (customizeApplied.plain.trim() !== '' ||
            (customizeApplied.html != null && customizeApplied.html.trim() !== ''));

        const customizeCollectionPrice =
          hasCustomize && collectionPriceAmd > 0
            ? {
                categoryTitle: collectionCategoryTitle?.trim() ?? '',
                categoryPriceAmd: collectionPriceAmd,
              }
            : null;

        const sizeCatalog =
          selectedCatalogSize != null
            ? {
                title: selectedCatalogSize.title,
                version: selectedCatalogSize.version,
                imageUrl: selectedCatalogSize.imageUrl,
                categoryTitle:
                  customizeCollectionPrice?.categoryTitle ?? selectedCatalogSize.categoryTitle,
                categoryPriceAmd: customizeCollectionPrice?.categoryPriceAmd ?? 0,
              }
            : customizeCollectionPrice != null
              ? {
                  title: '',
                  version: '',
                  imageUrl: '',
                  categoryTitle: customizeCollectionPrice.categoryTitle,
                  categoryPriceAmd: customizeCollectionPrice.categoryPriceAmd,
                }
              : null;
        const customSizeRequest =
          selectedCustomSizeRequest != null
            ? {
                name: selectedCustomSizeRequest.name,
                phone: selectedCustomSizeRequest.phone,
                email: selectedCustomSizeRequest.email,
                description: selectedCustomSizeRequest.description,
                imageDataUrl: selectedCustomSizeRequest.imageDataUrl,
                imageFileName: selectedCustomSizeRequest.imageFileName,
              }
            : null;
        const customizeForLine =
          customizeApplied != null &&
          (customizeApplied.plain.trim() !== '' ||
            (customizeApplied.html != null && customizeApplied.html.trim() !== ''))
            ? {
                plain: customizeApplied.plain.trim(),
                html: customizeApplied.html?.trim() ? customizeApplied.html.trim() : null,
              }
            : null;
        const snapshot = buildGuestCartLineSnapshot(
          product,
          currentVariant,
          quantityToAdd,
          price,
          originalPrice,
          productDisplayTitle,
          sizeCatalog,
          customizeForLine,
          customSizeRequest
        );
        upsertGuestCartLineSnapshot(snapshot);

        afterLocalAdd?.();
      } catch {
        setShowMessage(t(language, 'product.errorAddingToCart'));
        setTimeout(() => setShowMessage(null), 2000);
      } finally {
        setIsAddingToCart(false);
      }
    },
    [
      canAddToCart,
      product,
      currentVariant,
      quantity,
      price,
      originalPrice,
      productDisplayTitle,
      selectedCatalogSize,
      selectedCustomSizeRequest,
      customizeApplied,
      collectionPriceAmd,
      collectionCategoryTitle,
      language,
      setIsAddingToCart,
      setShowMessage,
    ]
  );

  const handleAddToCart = useCallback(async () => {
    runAddFlow(() => {
      if (product) {
        dispatchCartDrawerOpen(product.id);
      }
    });
  }, [runAddFlow, product]);

  const handleBuyNow = useCallback(async () => {
    runAddFlow(() => {
      router.push('/checkout');
    });
  }, [runAddFlow, router]);

  return { handleAddToCart, handleBuyNow };
}
