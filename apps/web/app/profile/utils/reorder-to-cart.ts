import { apiClient } from '../../../lib/api-client';
import { logger } from '../../../lib/services/utils/logger';
import {
  buildCatalogGuestCartSnapshot,
  upsertGuestCartLineSnapshot,
} from '@/app/products/[slug]/product-cart-snapshot';
import type { OrderItem } from '../types';

interface VariantCartDetails {
  id: string;
  productId: string;
  stock: number;
  available: boolean;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  product: {
    title: string;
    slug: string;
    image: string | null;
  };
}

function resolveSizeLabel(item: OrderItem): string | null {
  const sizeOpt = item.variantOptions?.find((option) => {
    const key = `${option.attributeKey || ''} ${option.label || ''}`.toLowerCase();
    return key.includes('size');
  });
  return sizeOpt?.label?.trim() || sizeOpt?.value?.trim() || null;
}

/**
 * Adds one order line to the guest cart with a full local snapshot
 * so the drawer/header can render without dropping the line.
 */
export async function addOrderItemToGuestCart(item: OrderItem): Promise<boolean> {
  const variantDetails = await apiClient.get<VariantCartDetails>(
    `/api/v1/products/variants/${item.variantId}`
  );

  if (!variantDetails.available || variantDetails.stock < item.quantity) {
    logger.warn('Reorder skipped: variant unavailable or insufficient stock', {
      variantId: item.variantId,
      productTitle: item.productTitle,
      stock: variantDetails.stock,
      requested: item.quantity,
    });
    return false;
  }

  const productSlug = variantDetails.product.slug?.trim() ?? '';
  const title = variantDetails.product.title?.trim() || item.productTitle.trim();
  if (!productSlug || !title || !(variantDetails.price > 0)) {
    logger.warn('Reorder skipped: incomplete product snapshot', {
      variantId: item.variantId,
      productId: variantDetails.productId,
    });
    return false;
  }

  const line = buildCatalogGuestCartSnapshot({
    productId: variantDetails.productId,
    productSlug,
    title,
    price: variantDetails.price,
    originalPrice: variantDetails.compareAtPrice,
    image: variantDetails.imageUrl || variantDetails.product.image || item.imageUrl || null,
    variantId: item.variantId,
    stock: variantDetails.stock,
    sku: variantDetails.sku?.trim() || item.sku || '',
    sizeLabel: resolveSizeLabel(item),
    categoryLabel: null,
    quantity: item.quantity,
  });

  upsertGuestCartLineSnapshot(line);
  return true;
}
