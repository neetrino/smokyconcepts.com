import { CART_KEY } from '@/app/cart/constants';
import type { GuestCartItem } from '@/app/cart/types';
import type { Product, ProductVariant } from './types';

const CART_UPDATED_EVENT = 'cart-updated';

function guestLineKey(line: GuestCartItem): string {
  const v = line.variantId ?? '';
  const p = line.customizePlain?.trim() ?? '';
  const h = line.customizeHtml?.trim() ?? '';
  const c = line.customSizeRequest
    ? `${line.customSizeRequest.name.trim()}::${line.customSizeRequest.phone.trim()}::${line.customSizeRequest.email.trim()}::${line.customSizeRequest.description.trim()}`
    : '';
  const s = line.sizeCatalogTitle?.trim() ?? '';
  const sv = line.sizeCatalogVersion?.trim() ?? '';
  const cp = String(line.sizeCatalogCategoryPriceAmd ?? 0);
  const ea = line.earlyAccess === true ? '1' : '0';
  return `${v}::${s}::${sv}::${cp}::${p}::${h}::${c}::${ea}`;
}

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
  earlyAccess?: boolean;
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
    ...(params.earlyAccess === true ? { earlyAccess: true } : {}),
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
  productTitle: string,
  sizeCatalog?:
    | {
        title: string;
        version: string;
        imageUrl: string;
        categoryTitle: string;
        categoryPriceAmd: number;
      }
    | null,
  customize?: { plain: string; html: string | null } | null,
  customSizeRequest?: {
    name: string;
    phone: string;
    email: string;
    description: string;
    imageDataUrl: string;
    imageFileName: string;
  } | null
): GuestCartItem {
  const trimmedTitle = sizeCatalog?.title?.trim() ?? '';
  const trimmedVersion = sizeCatalog?.version?.trim() ?? '';
  const trimmedImg = sizeCatalog?.imageUrl?.trim() ?? '';
  const trimmedCategoryTitle = sizeCatalog?.categoryTitle?.trim() ?? '';
  const categoryPriceRaw = sizeCatalog?.categoryPriceAmd;
  const hasCollectionPrice =
    typeof categoryPriceRaw === 'number' &&
    Number.isFinite(categoryPriceRaw) &&
    categoryPriceRaw > 0;
  const plain = customize?.plain?.trim() ?? '';
  const html = customize?.html?.trim() ?? '';
  const hasSavedCustomize = plain !== '' || html !== '';
  const sizeCatalogCategoryPriceAmd =
    hasSavedCustomize && hasCollectionPrice ? Math.round(categoryPriceRaw) : null;
  const customRequest =
    customSizeRequest != null
      ? {
          name: customSizeRequest.name.trim(),
          phone: customSizeRequest.phone.trim(),
          email: customSizeRequest.email.trim(),
          description: customSizeRequest.description.trim(),
          imageDataUrl: customSizeRequest.imageDataUrl.trim(),
          imageFileName: customSizeRequest.imageFileName.trim(),
        }
      : null;
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
    sizeCatalogTitle: trimmedTitle !== '' ? trimmedTitle : null,
    sizeCatalogVersion: trimmedTitle !== '' && trimmedVersion !== '' ? trimmedVersion : null,
    sizeCatalogImageUrl: trimmedTitle !== '' && trimmedImg !== '' ? trimmedImg : null,
    sizeCatalogCategoryTitle: trimmedCategoryTitle !== '' ? trimmedCategoryTitle : null,
    sizeCatalogCategoryPriceAmd,
    customizePlain: plain !== '' ? plain : null,
    customizeHtml: html !== '' ? html : null,
    customSizeRequest: customRequest,
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
  const existing = cart.find((item) => guestLineKey(item) === guestLineKey(line));

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
