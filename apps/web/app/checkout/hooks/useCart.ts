import { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { useTranslation } from '../../../lib/i18n-client';
import { readGuestCartFromStorage } from '../../cart/cart-fetcher';
import type { Cart } from '../types';

export function useCart() {
  const { t } = useTranslation();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncCartFromStorage = useCallback(() => {
    try {
      setCart(readGuestCartFromStorage());
    } catch {
      setError(t('checkout.errors.failedToLoadCart'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchCart = useCallback(async () => {
    syncCartFromStorage();
  }, [syncCartFromStorage]);

  // Before paint so soft-nav from cart drawer does not flash a loading screen.
  useLayoutEffect(() => {
    syncCartFromStorage();
  }, [syncCartFromStorage]);

  useEffect(() => {
    const handleCartUpdate = () => {
      syncCartFromStorage();
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, [syncCartFromStorage]);

  return { cart, loading, error, setError, setCart, fetchCart };
}
