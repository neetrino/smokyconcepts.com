import { extractSelectedValueIdsFromVariantAttributes } from '@/lib/category-attributes';

/**
 * Format variant for admin product detail response
 */
export function formatVariantForAdmin(variant: {
  id: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  sku: string | null;
  imageUrl: string | null;
  published: boolean | null;
  attributes?: unknown;
}) {
  return {
    id: variant.id,
    price: variant.price.toString(),
    compareAtPrice: variant.compareAtPrice?.toString() ?? "",
    stock: variant.stock.toString(),
    sku: variant.sku ?? "",
    imageUrl: variant.imageUrl ?? "",
    attributes: variant.attributes,
    selectedValueIds: extractSelectedValueIdsFromVariantAttributes(variant.attributes),
    published: variant.published ?? false,
  };
}
