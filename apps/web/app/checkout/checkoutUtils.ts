import type { Cart } from '../cart/types';
import { readGuestCartFromStorage } from '../cart/cart-fetcher';

const CART_KEY = 'shop_cart_guest';

/**
 * Guest checkout cart — same fast path as drawer / cart page (localStorage only).
 */
export async function fetchCartForGuest(): Promise<Cart | null> {
  if (typeof window === 'undefined') {
    return null;
  }
  return readGuestCartFromStorage();
}

export function clearGuestCart(): void {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event('cart-updated'));
}
