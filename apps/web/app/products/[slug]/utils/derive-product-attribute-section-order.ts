import type { Product } from '../types';

export type ProductAttributeSectionKey = 'color' | 'size';

const DEFAULT_ATTRIBUTE_SECTION_ORDER: ProductAttributeSectionKey[] = ['color', 'size'];

/**
 * Attribute section order for the PDP, based on the first variant options array order.
 * Falls back to color → size when no options are present.
 */
export function deriveProductAttributeSectionOrder(
  product: Product | null | undefined
): ProductAttributeSectionKey[] {
  if (!product?.variants?.length) {
    return [...DEFAULT_ATTRIBUTE_SECTION_ORDER];
  }

  const order: ProductAttributeSectionKey[] = [];
  const seen = new Set<ProductAttributeSectionKey>();

  for (const variant of product.variants) {
    for (const option of variant.options ?? []) {
      const key = (option.key || option.attribute || '').toLowerCase();
      if (key !== 'color' && key !== 'size') {
        continue;
      }
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      order.push(key);
      if (order.length === DEFAULT_ATTRIBUTE_SECTION_ORDER.length) {
        return order;
      }
    }
  }

  for (const key of DEFAULT_ATTRIBUTE_SECTION_ORDER) {
    if (!seen.has(key)) {
      order.push(key);
    }
  }

  return order;
}
