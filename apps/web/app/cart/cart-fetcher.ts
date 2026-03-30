import { apiClient } from '../../lib/api-client';
import { logger } from '../../lib/services/utils/logger';
import type { Cart, CartItem } from './types';
import { CART_KEY } from './constants';

/**
 * Product data from API
 */
interface ProductData {
  id: string;
  slug: string;
  title?: string;
  categories?: Array<{ id: string; slug: string; title: string }>;
  media?: Array<{ url?: string; src?: string } | string>;
  variants?: Array<{
    _id: string;
    id: string;
    sku: string;
    price: number;
    originalPrice?: number | null;
    stock?: number;
    options?: Array<{
      attribute?: string;
      key?: string;
      value: string;
    }>;
  }>;
}

type ProductVariant = NonNullable<ProductData['variants']>[number];

/**
 * Guest cart item (variantId optional when added from ProductCard without API)
 */
interface GuestCartItem {
  productId: string;
  productSlug?: string;
  variantId?: string;
  quantity: number;
}

const CART_FETCH_LANG_FALLBACKS = ['en', 'hy', 'ru', 'ka'] as const;

async function fetchProductDataBySlug(productSlug: string, lang: string): Promise<ProductData> {
  const languageChain = [
    lang,
    ...CART_FETCH_LANG_FALLBACKS.filter((candidate) => candidate !== lang),
  ];

  let lastError: unknown = null;

  for (const candidateLang of languageChain) {
    try {
      return await apiClient.get<ProductData>(`/api/v1/products/${productSlug}?lang=${candidateLang}`);
    } catch (error: unknown) {
      const errorObj = error as { status?: number; statusCode?: number };
      const statusCode = errorObj?.status ?? errorObj?.statusCode;

      if (statusCode === 404) {
        lastError = error;
        continue;
      }

      throw error;
    }
  }

  throw lastError ?? new Error(`Product with slug '${productSlug}' was not found in any supported language`);
}

function getCartSizeLabel(
  variant: ProductVariant | undefined,
  productSlug: string,
  productTitle: string
): string {
  const sizeOption = variant?.options?.find((option) => {
    const key = `${option.attribute || ''} ${option.key || ''}`.toLowerCase();
    return key.includes('size');
  });

  if (sizeOption?.value?.trim()) {
    return sizeOption.value.trim();
  }

  const source = `${productTitle} ${productSlug} ${variant?.sku || ''}`;
  if (/compact|mini|small/i.test(source)) return 'Compact';
  if (/king|large|max/i.test(source)) return 'King Size';

  return 'King Size';
}

/**
 * Fetch guest cart items with product details
 */
async function fetchGuestCartItems(
  guestCart: GuestCartItem[],
  t: (key: string) => string,
  lang: string
): Promise<Array<{ item: CartItem | null; shouldRemove: boolean }>> {
  return Promise.all(
    guestCart.map(async (item, index) => {
      try {
        // If productSlug is missing, product cannot be fetched (API expects slug)
        if (!item.productSlug) {
          logger.warn(`Product ${item.productId} does not have slug, removing from cart`);
          return { item: null, shouldRemove: true };
        }

        // Try current language first, then fallback languages.
        const productData = await fetchProductDataBySlug(item.productSlug, lang);

        const variant = item.variantId
          ? productData.variants?.find((v) => (v._id?.toString() || v.id) === item.variantId) || productData.variants?.[0]
          : productData.variants?.[0];

        if (!variant) {
          logger.warn(`No variant for product ${item.productId}`);
          return { item: null, shouldRemove: true };
        }

        const variantId = variant._id?.toString() || variant.id;
        const imageUrl = productData.media?.[0]
          ? (typeof productData.media[0] === 'string'
              ? productData.media[0]
              : productData.media[0].url || productData.media[0].src)
          : null;
        const categoryLabel = productData.categories?.[0]?.title?.trim() || null;
        const sizeLabel = getCartSizeLabel(
          variant,
          productData.slug,
          productData.title || t('common.navigation.products')
        );

        return {
          item: {
            id: `${item.productId}-${variantId}-${index}`,
            variant: {
              id: variantId,
              sku: variant.sku || '',
              sizeLabel,
              stock: variant.stock !== undefined ? variant.stock : undefined,
              product: {
                id: productData.id,
                title: productData.title || t('common.navigation.products'),
                slug: productData.slug,
                image: imageUrl,
                categoryLabel,
              },
            },
            quantity: item.quantity,
            price: variant.price,
            originalPrice: variant.originalPrice || null,
            total: variant.price * item.quantity,
          },
          shouldRemove: false,
        };
      } catch (error: unknown) {
        // If product not found (404), remove it from localStorage
        const errorObj = error as { status?: number; statusCode?: number };
        if (errorObj?.status === 404 || errorObj?.statusCode === 404) {
          logger.warn(`Product ${item.productId} not found (404), removing from cart`);
          return { item: null, shouldRemove: true };
        }
        logger.error(`Error fetching product ${item.productId}`, { error });
        return { item: null, shouldRemove: false };
      }
    })
  );
}

/**
 * Build cart from valid items
 */
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
 * Fetch guest cart
 */
export async function fetchGuestCart(
  t: (key: string) => string,
  lang: string = 'en'
): Promise<Cart | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(CART_KEY);
    const guestCart: GuestCartItem[] = stored ? JSON.parse(stored) : [];
    
    if (guestCart.length === 0) {
      return null;
    }

    // Get product details from API
    const itemsWithDetails = await fetchGuestCartItems(guestCart, t, lang);

    // Remove items that were not found
    const itemsToRemove = itemsWithDetails
      .map((result, index) => result.shouldRemove ? index : -1)
      .filter(index => index !== -1);
    
    if (itemsToRemove.length > 0) {
      const updatedCart = guestCart.filter((_, index) => !itemsToRemove.includes(index));
      localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
    }

    const validItems = itemsWithDetails
      .map(result => result.item)
      .filter((item): item is CartItem => item !== null);
    
    if (validItems.length === 0) {
      return null;
    }

    return buildCartFromItems(validItems);
  } catch (error: unknown) {
    logger.error('Error loading guest cart', { error });
    return null;
  }
}

/**
 * Cart is localStorage-only.
 * Use `fetchGuestCart` for all users.
 */




