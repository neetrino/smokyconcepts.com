'use client';

import { useState } from 'react';
import { useTranslation } from '../../lib/i18n-client';

const CART_KEY = 'shop_cart_guest';
const CART_DRAWER_OPEN_EVENT = 'cart-drawer-open';

interface UseAddToCartProps {
  productId: string;
  productSlug: string;
  inStock: boolean;
}

interface AddToCartOptions {
  openDrawer?: boolean;
}

/**
 * Adds product to cart via localStorage only (no API/database).
 * ProductCard uses this to add by id/slug immediately.
 */
export function useAddToCart({ productId, productSlug, inStock }: UseAddToCartProps) {
  const { t } = useTranslation();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addToCart = async ({ openDrawer = true }: AddToCartOptions = {}) => {
    if (!inStock) return;

    if (!productId || !productSlug || productSlug.trim() === '' || productSlug.includes(' ')) {
      console.error('❌ [PRODUCT CARD] Invalid product id or slug:', { productId, productSlug });
      alert(t('common.alerts.invalidProduct'));
      return;
    }

    setIsAddingToCart(true);
    try {
      const stored = localStorage.getItem(CART_KEY);
      const cart: Array<{ productId: string; productSlug: string; variantId?: string; quantity: number }> = stored ? JSON.parse(stored) : [];

      const existingItem = cart.find((item) => item.productId === productId);

      if (existingItem) {
        existingItem.quantity += 1;
        if (!existingItem.productSlug) existingItem.productSlug = productSlug.trim();
      } else {
        cart.push({
          productId,
          productSlug: productSlug.trim(),
          quantity: 1,
        });
      }

      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
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
      console.error('❌ [PRODUCT CARD] Error adding to cart:', error);
      alert(t('common.alerts.failedToAddToCart'));
    } finally {
      setIsAddingToCart(false);
    }
  };

  return { isAddingToCart, addToCart };
}




