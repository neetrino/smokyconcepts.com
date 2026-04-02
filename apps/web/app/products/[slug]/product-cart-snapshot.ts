import { CART_KEY } from '@/app/cart/constants';
import type { GuestCartItem } from '@/app/cart/types';
import type { Product, ProductVariant } from './types';

const CART_UPDATED_EVENT = 'cart-updated';

function readGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const stored = localStorage.getItem(CART_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? (parsed as GuestCartItem[]) : [];
  } catch {
    return [];
  }
}

/**
 * Sum of quantities already in guest storage for this variant (client-side cap vs PDP stock).
 */
export function getGuestQuantityForVariant(variantId: string): number {
  return readGuestCart()
    .filter((line) => line.variantId === variantId)
    .reduce((sum, line) => sum + line.quantity, 0);
}

/**
 * Returns false if adding `quantityToAdd` would exceed `variant.stock` given current guest lines.
 */
export function canAddVariantToGuestCart(variant: ProductVariant, quantityToAdd: number): boolean {
  if (variant.stock <= 0) {
    return false;
  }
  const nextTotal = getGuestQuantityForVariant(variant.id) + quantityToAdd;
  return nextTotal <= variant.stock;
}

function resolvePrimaryImage(product: Product, variant: ProductVariant): string | null {
  if (variant.imageUrl) {
    return variant.imageUrl;
  }
  const first = product.media?.[0];
  if (!first) {
    return null;
  }
  if (typeof first === 'string') {
    return first;
  }
  return first.url ?? null;
}

function resolveSizeLabel(variant: ProductVariant): string | null {
  const sizeOpt = variant.options?.find((option) => {
    const key = `${option.attribute || ''} ${option.key || ''}`.toLowerCase();
    return key.includes('size');
  });
  return sizeOpt?.value?.trim() ?? null;
}

/**
 * Catalog card snapshot — same storage shape as PDP, no API calls when opening cart.
 */
export function buildCatalogGuestCartSnapshot(params: {
  productId: string;
  productSlug: string;
  title: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  variantId: string;
  stock: number;
  sku: string;
  sizeLabel: string | null;
  categoryLabel: string | null;
  quantity: number;
}): GuestCartItem {
  return {
    productId: params.productId,
    productSlug: params.productSlug.trim(),
    variantId: params.variantId,
    quantity: params.quantity,
    title: params.title,
    image: params.image,
    price: params.price,
    originalPrice: params.originalPrice,
    stock: params.stock,
    sku: params.sku,
    sizeLabel: params.sizeLabel,
    categoryLabel: params.categoryLabel,
  };
}

/**
 * Builds a guest line with full PDP snapshot for fast hydration (no GET product by slug).
 */
export function buildGuestCartLineSnapshot(
  product: Product,
  variant: ProductVariant,
  quantity: number,
  displayPrice: number,
  originalPrice: number | null,
  productTitle: string
): GuestCartItem {
  return {
    productId: product.id,
    productSlug: product.slug.trim(),
    variantId: variant.id,
    quantity,
    title: productTitle,
    image: resolvePrimaryImage(product, variant),
    price: displayPrice,
    originalPrice,
    stock: variant.stock,
    sku: variant.sku,
    sizeLabel: resolveSizeLabel(variant),
    categoryLabel: product.categories?.[0]?.title?.trim() ?? null,
  };
}

/**
 * Upserts a line into `shop_cart_guest` and notifies listeners (drawer, header count).
 */
export function upsertGuestCartLineSnapshot(line: GuestCartItem): void {
  if (typeof window === 'undefined') {
    return;
  }
  const variantId = line.variantId;
  if (!variantId) {
    throw new Error('Guest cart line requires variantId');
  }

  const cart = readGuestCart();
  const existing = cart.find((item) => item.variantId === variantId);

  if (existing) {
    existing.quantity += line.quantity;
    Object.assign(existing, {
      ...line,
      quantity: existing.quantity,
    });
  } else {
    cart.push({ ...line });
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}
