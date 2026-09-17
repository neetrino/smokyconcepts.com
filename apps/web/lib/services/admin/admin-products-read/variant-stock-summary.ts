import { isDefaultPricingVariant, isInternalVariantAttributeKey } from '@/lib/default-pricing-variant';

export type VariantStockChip = {
  color: string;
  stock: number;
};

type VariantStockSource = {
  stock: number;
  attributes?: unknown;
};

/**
 * Variants that hold sellable inventory. Default-pricing ("main") is excluded when real variants exist.
 */
export function getSelectableInventoryVariants<T extends { attributes?: unknown }>(
  variants: T[]
): T[] {
  const selectable = variants.filter((item) => !isDefaultPricingVariant(item));
  return selectable.length > 0 ? selectable : variants;
}

export function sumVariantStock(variants: Array<{ stock: number }>): number {
  return variants.reduce((total, item) => total + (item.stock || 0), 0);
}

function readAttributeLabel(item: unknown, key: string): string | null {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const entry = item as {
    attributeKey?: unknown;
    value?: unknown;
    attributeValue?: {
      attribute?: { key?: unknown };
      value?: unknown;
      translations?: Array<{ label?: unknown }>;
    };
  };

  const attributeKey =
    typeof entry.attributeValue?.attribute?.key === 'string'
      ? entry.attributeValue.attribute.key
      : typeof entry.attributeKey === 'string'
        ? entry.attributeKey
        : '';
  if (attributeKey.toLowerCase() !== key || isInternalVariantAttributeKey(attributeKey)) {
    return null;
  }

  const translated = entry.attributeValue?.translations?.[0]?.label;
  const raw =
    (typeof translated === 'string' && translated.trim()) ||
    (typeof entry.attributeValue?.value === 'string' && entry.attributeValue.value.trim()) ||
    (typeof entry.value === 'string' && entry.value.trim()) ||
    '';
  return raw || null;
}

function resolveVariantStockLabel(attributes: unknown): string | null {
  if (!Array.isArray(attributes)) {
    return null;
  }

  const color = attributes.map((item) => readAttributeLabel(item, 'color')).find(Boolean) ?? null;
  const size = attributes.map((item) => readAttributeLabel(item, 'size')).find(Boolean) ?? null;
  if (color && size) {
    return `${color} / ${size}`;
  }
  return color ?? size;
}

/**
 * Per-variant stock chips for the admin product list. Empty for simple (single-variant) products.
 */
export function buildColorStocks(variants: VariantStockSource[]): VariantStockChip[] {
  if (variants.length <= 1) {
    return [];
  }

  const grouped = new Map<string, number>();
  for (const variant of variants) {
    const label = resolveVariantStockLabel(variant.attributes);
    if (!label) {
      continue;
    }
    grouped.set(label, (grouped.get(label) ?? 0) + (variant.stock || 0));
  }

  return Array.from(grouped.entries()).map(([color, stock]) => ({ color, stock }));
}
