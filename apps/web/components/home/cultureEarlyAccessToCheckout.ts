import { buildCatalogGuestCartSnapshot, upsertGuestCartLineSnapshot } from '@/app/products/[slug]/product-cart-snapshot';
import { apiClient } from '@/lib/api-client';
import { getStoredLanguage } from '@/lib/language';

export type CultureEarlyAccessResult =
  | { ok: true }
  | { ok: false; messageKey: string };

interface ProductPayload {
  id: string;
  slug: string;
  title: string;
  media: Array<string | { url?: string }>;
  variants: Array<{
    id: string;
    sku: string;
    price: number;
    originalPrice?: number | null;
    stock: number;
  }>;
  defaultVariantId?: string | null;
  defaultVariantStock?: number;
  defaultVariantSku?: string | null;
  defaultPrice?: number | null;
  defaultOriginalPrice?: number | null;
  categories?: Array<{ title?: string }>;
}

function primaryImage(product: ProductPayload): string | null {
  const first = product.media?.[0];
  if (!first) {
    return null;
  }
  if (typeof first === 'string') {
    return first;
  }
  if (typeof first === 'object' && first.url) {
    return first.url;
  }
  return null;
}

/**
 * Loads catalog product by slug, adds one early-access guest line, for checkout navigation.
 */
export async function addCultureEarlyAccessLine(productSlug: string): Promise<CultureEarlyAccessResult> {
  const trimmed = productSlug.trim();
  if (!trimmed) {
    return { ok: false, messageKey: 'home.homepage.culture.earlyAccessNoProduct' };
  }

  const lang = getStoredLanguage();
  let product: ProductPayload;
  try {
    product = await apiClient.get<ProductPayload>(`/api/v1/products/${encodeURIComponent(trimmed)}`, {
      params: { lang },
    });
  } catch {
    return { ok: false, messageKey: 'home.homepage.culture.earlyAccessProductLoadError' };
  }

  const variants = product.variants ?? [];
  const fromSelectable = variants.find((v) => v.stock > 0) ?? variants[0];
  const fromDefault =
    product.defaultVariantId != null
      ? {
          id: product.defaultVariantId,
          sku: product.defaultVariantSku?.trim() ? product.defaultVariantSku : '',
          price: product.defaultPrice ?? 0,
          originalPrice: product.defaultOriginalPrice ?? null,
          stock: product.defaultVariantStock ?? 0,
        }
      : null;

  const picked = fromSelectable ?? fromDefault;
  if (!picked || picked.stock <= 0) {
    return { ok: false, messageKey: 'home.homepage.culture.earlyAccessOutOfStock' };
  }

  const categoryLabel = product.categories?.[0]?.title?.trim() ?? null;
  const line = buildCatalogGuestCartSnapshot({
    productId: product.id,
    productSlug: product.slug.trim(),
    title: product.title,
    price: picked.price,
    originalPrice: picked.originalPrice ?? null,
    image: primaryImage(product),
    variantId: picked.id,
    stock: picked.stock,
    sku: picked.sku,
    sizeLabel: null,
    categoryLabel,
    quantity: 1,
    earlyAccess: true,
  });
  upsertGuestCartLineSnapshot(line);
  return { ok: true };
}
