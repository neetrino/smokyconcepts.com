'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/i18n';
import type { LanguageCode } from '@/lib/language';
import type { Product, ProductVariant } from './types';
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
  setIsAddingToCart,
  setShowMessage,
}: UseProductCartActionsParams) {
  const router = useRouter();

  const runAddFlow = useCallback(
    (afterLocalAdd?: () => void) => {
      if (!canAddToCart || !product || !currentVariant) {
        return;
      }
      if (!canAddVariantToGuestCart(currentVariant, quantity)) {
        setShowMessage(t(language, 'product.errorAddingToCart'));
        setTimeout(() => setShowMessage(null), 2000);
        return;
      }

      setIsAddingToCart(true);
      try {
        const snapshot = buildGuestCartLineSnapshot(
          product,
          currentVariant,
          quantity,
          price,
          originalPrice,
          productDisplayTitle
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
      language,
      setIsAddingToCart,
      setShowMessage,
    ]
  );

  const handleAddToCart = useCallback(async () => {
    runAddFlow(() => {
      setShowMessage(`${t(language, 'product.addedToCart')} ${quantity} ${t(language, 'product.pcs')}`);
      setTimeout(() => setShowMessage(null), 2000);
    });
  }, [runAddFlow, language, quantity, setShowMessage]);

  const handleBuyNow = useCallback(async () => {
    runAddFlow(() => {
      router.push('/checkout');
    });
  }, [runAddFlow, router]);

  return { handleAddToCart, handleBuyNow };
}
