import type { VariantOption, ProductVariant } from '../types';

function normalizeOptionToken(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const normalized = value.toLowerCase().trim();
  return normalized || null;
}

/**
 * Helper function to get option value (supports both new and old format)
 * @param options - Variant options array
 * @param key - Option key to find
 * @returns First matching option value or null
 */
export function getOptionValue(
  options: VariantOption[] | undefined,
  key: string
): string | null {
  return getOptionValues(options, key)[0] ?? null;
}

/**
 * All option values for an attribute key (admin variants may attach multiple sizes/versions).
 */
export function getOptionValues(
  options: VariantOption[] | undefined,
  key: string
): string[] {
  if (!options) {
    return [];
  }

  const values: string[] = [];
  for (const option of options) {
    if (option.key !== key && option.attribute !== key) {
      continue;
    }
    const normalized = normalizeOptionToken(option.value);
    if (normalized) {
      values.push(normalized);
    }
  }
  return values;
}

/** Normalizes size_version labels such as "50", "V50", "Version 50" to "v50". */
export function normalizeVersionToken(value: string | null | undefined): string | null {
  const normalized = normalizeOptionToken(value);
  if (!normalized) {
    return null;
  }
  const compact = normalized.replace(/\s+/g, '');
  const numericMatch = compact.match(/(\d+)/);
  if (!numericMatch) {
    return compact;
  }
  return `v${numericMatch[1]}`;
}

/**
 * True when the variant has the given attribute value among all options for that key.
 */
export function variantHasOptionValue(
  variant: ProductVariant,
  key: string,
  value: string
): boolean {
  if (!variant.options || !value) {
    return false;
  }

  const normalizedValue = normalizeOptionToken(value);
  if (!normalizedValue) {
    return false;
  }

  const matchingOptions = variant.options.filter(
    (opt) => opt.key === key || opt.attribute === key
  );

  return matchingOptions.some((opt) => {
    const optValue = normalizeOptionToken(opt.value);
    if (optValue === normalizedValue) {
      return true;
    }
    if (opt.valueId && opt.valueId === value) {
      return true;
    }
    if (key === 'size_version') {
      return normalizeVersionToken(opt.value) === normalizeVersionToken(value);
    }
    return false;
  });
}

/**
 * Helper function to check if variant has a specific color value (checks ALL color options)
 * A variant can have multiple color values (e.g., color: ["red", "blue"])
 * @param variant - Product variant to check
 * @param color - Color value to check for
 * @returns True if variant has the color
 */
export function variantHasColor(
  variant: ProductVariant,
  color: string
): boolean {
  if (!variant.options || !color) return false;
  const normalizedColor = color.toLowerCase().trim();

  // Check ALL options for color attribute
  const colorOptions = variant.options.filter(
    (opt) => opt.key === 'color' || opt.attribute === 'color'
  );

  // Check if any color option matches
  return colorOptions.some((opt) => {
    const optValue = opt.value?.toLowerCase().trim();
    return optValue === normalizedColor;
  });
}




