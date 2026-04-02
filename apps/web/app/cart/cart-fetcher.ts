import { catalogPriceToUsd } from '../../lib/currency';
import { logger } from '../../lib/services/utils/logger';
import type { Cart, CartItem, GuestCartItem } from './types';
import { CART_KEY } from './constants';

function isGuestLineSnapshotComplete(item: GuestCartItem): boolean {
  return (
    Boolean(item.variantId) &&
    Boolean(item.productSlug?.trim()) &&
    typeof item.title === 'string' &&
    item.title.trim().length > 0 &&
    typeof item.price === 'number' &&
    !Number.isNaN(item.price)
  );
}

function cartItemFromGuestSnapshot(item: GuestCartItem, index: number): CartItem {
  const variantId = item.variantId as string;
  const priceUsd = catalogPriceToUsd(item.price as number);
  const originalPriceUsd =
    item.originalPrice != null && !Number.isNaN(item.originalPrice)
      ? catalogPriceToUsd(item.originalPrice)
      : null;
  return {
    id: `${item.productId}-${variantId}-${index}`,
    variant: {
      id: variantId,
      sku: item.sku ?? '',
      sizeLabel: item.sizeLabel ?? null,
      stock: item.stock !== undefined ? item.stock : undefined,
      product: {
        id: item.productId,
        title: item.title as string,
        slug: item.productSlug as string,
        image: item.image ?? null,
        categoryLabel: item.categoryLabel ?? null,
      },
    },
    quantity: item.quantity,
    price: priceUsd,
    originalPrice: originalPriceUsd,
    total: priceUsd * item.quantity,
  };
}

function buildCartFromItems(validItems: CartItem[]): Cart {
  const subtotal = validItems.reduce((sum, item) => sum + item.total, 0);
  const itemsCount = validItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: 'guest-cart',
    items: validItems,
    totals: {
      subtotal,
      discount: 0,
      shipping: 0,
      tax: 0,
      total: subtotal,
      currency: 'USD',
    },
    itemsCount,
  };
}

/**
 * Builds the guest cart from `localStorage` only — no network.
 * Drops lines without a full PDP/catalog snapshot and persists the cleaned list.
 */
export function readGuestCartFromStorage(): Cart | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(CART_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(parsed)) {
      return null;
    }

    const guestCart = parsed as GuestCartItem[];
    if (guestCart.length === 0) {
      return null;
    }

    const cleaned = guestCart.filter(isGuestLineSnapshotComplete);
    if (cleaned.length !== guestCart.length) {
      localStorage.setItem(CART_KEY, JSON.stringify(cleaned));
    }

    if (cleaned.length === 0) {
      return null;
    }

    const validItems = cleaned.map((item, index) => cartItemFromGuestSnapshot(item, index));
    return buildCartFromItems(validItems);
  } catch (error: unknown) {
    logger.error('Error loading guest cart from storage', { error });
    return null;
  }
}

/**
 * Async wrapper for call sites that already await; resolves immediately from storage.
 */
export async function fetchGuestCart(
  _t?: (key: string) => string,
  _lang?: string
): Promise<Cart | null> {
  return readGuestCartFromStorage();
}
