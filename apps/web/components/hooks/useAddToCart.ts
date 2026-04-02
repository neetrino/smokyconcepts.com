'use client';

import { useState } from 'react';
import { useTranslation } from '../../lib/i18n-client';
import { logger } from '../../lib/services/utils/logger';
import {
  buildCatalogGuestCartSnapshot,
  upsertGuestCartLineSnapshot,
} from '@/app/products/[slug]/product-cart-snapshot';

const CART_DRAWER_OPEN_EVENT = 'cart-drawer-open';

interface UseAddToCartProps {
  productId: string;
  productSlug: string;
  title: string;
  price: number;
  image: string | null;
  originalPrice: number | null;
  inStock: boolean;
  defaultVariantId: string | null;
  defaultVariantStock: number;
  defaultSku: string;
  sizeLabel: string;
  categoryLabel: string;
}

interface AddToCartOptions {
  openDrawer?: boolean;
}

/**
 * Adds a catalog line with a full local snapshot (no network).
 */
export function useAddToCart({
  productId,
  productSlug,
  title,
  price,
  image,
  originalPrice,
  inStock,
  defaultVariantId,
  defaultVariantStock,
  defaultSku,
  sizeLabel,
  categoryLabel,
}: UseAddToCartProps) {
  const { t } = useTranslation();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addToCart = async ({ openDrawer = true }: AddToCartOptions = {}) => {
    if (!inStock) return;

    if (!productId || !productSlug || productSlug.trim() === '' || productSlug.includes(' ')) {
      logger.warn('Invalid product id or slug for add to cart', { productId, productSlug });
      alert(t('common.alerts.invalidProduct'));
      return;
    }

    if (!defaultVariantId) {
      logger.warn('Missing defaultVariantId for catalog add to cart', { productId });
      alert(t('common.alerts.invalidProduct'));
      return;
    }

    setIsAddingToCart(true);
    try {
      const line = buildCatalogGuestCartSnapshot({
        productId,
        productSlug: productSlug.trim(),
        title,
        price,
        originalPrice,
        image,
        variantId: defaultVariantId,
        stock: defaultVariantStock,
        sku: defaultSku,
        sizeLabel,
        categoryLabel,
        quantity: 1,
      });
      upsertGuestCartLineSnapshot(line);

      if (openDrawer) {
        window.dispatchEvent(
          new CustomEvent(CART_DRAWER_OPEN_EVENT, {
            detail: {
              productId,
            },
          })
        );
      }
    } catch (error: unknown) {
      logger.error('Error adding catalog product to cart', { error, productId });
      alert(t('common.alerts.failedToAddToCart'));
    } finally {
      setIsAddingToCart(false);
    }
  };

  return { isAddingToCart, addToCart };
}
