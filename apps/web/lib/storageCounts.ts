'use client';

export const CART_KEY = 'shop_cart_guest';

/** Guest cart item shape in localStorage */
interface GuestCartItem {
  quantity?: number;
}

/**
 * Returns total number of items in the guest cart (sum of all quantities).
 */
export function getCartCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = window.localStorage.getItem(CART_KEY);
    const parsed: GuestCartItem[] = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(parsed)) return 0;
    return parsed.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  } catch {
    return 0;
  }
}


