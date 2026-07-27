import type { SizeCatalogItemDto } from '@/lib/types/size-catalog';

import type { ProductVariant } from '../types';
import {
  getOptionValues,
  normalizeVersionToken,
  variantHasColor,
  variantHasOptionValue,
} from './variant-helpers';

/** Internal option key used on display/pricing variants for size collection title. */
const SIZE_CATALOG_CATEGORY_TITLE_OPTION_KEY = '__size_catalog_category_title__';

function normalizeCatalogSizeValue(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

function variantMatchesSizeCategory(
  variant: ProductVariant,
  normalizedCategoryTitle: string
): boolean {
  if (variantHasOptionValue(variant, 'size', normalizedCategoryTitle)) {
    return true;
  }
  return variantHasOptionValue(
    variant,
    SIZE_CATALOG_CATEGORY_TITLE_OPTION_KEY,
    normalizedCategoryTitle
  );
}

function collectAllowedVersionTokens(variants: ProductVariant[]): Set<string> {
  const tokens = new Set<string>();
  for (const variant of variants) {
    for (const rawVersion of getOptionValues(variant.options, 'size_version')) {
      const token = normalizeVersionToken(rawVersion);
      if (token) {
        tokens.add(token);
      }
    }
  }
  return tokens;
}

function variantsWithSizeVersions(variants: ProductVariant[]): ProductVariant[] {
  return variants.filter(
    (variant) => getOptionValues(variant.options, 'size_version').length > 0
  );
}

/**
 * Prefers color-matched variants that have size_version; otherwise falls back to
 * any size-matched variants with size_version so a color without versions does not
 * unlock every catalog version.
 */
function resolveVersionSourceVariants(
  sizeMatchedVariants: ProductVariant[],
  selectedColor: string | null
): ProductVariant[] {
  if (selectedColor !== null) {
    const colorMatched = sizeMatchedVariants.filter((variant) =>
      variantHasColor(variant, selectedColor)
    );
    const colorWithVersions = variantsWithSizeVersions(colorMatched);
    if (colorWithVersions.length > 0) {
      return colorWithVersions;
    }
  }

  return variantsWithSizeVersions(sizeMatchedVariants);
}

export interface CatalogSizeItemSelectableParams {
  item: SizeCatalogItemDto;
  variants: ProductVariant[];
  selectableCatalogSizeValues: Set<string>;
  selectedColor: string | null;
}

/**
 * True when a size-catalog card may be chosen for the current product/color.
 * Admin must select size collections (and optionally versions); unselected stay visible but disabled.
 */
export function isCatalogSizeItemSelectable({
  item,
  variants,
  selectableCatalogSizeValues,
  selectedColor,
}: CatalogSizeItemSelectableParams): boolean {
  const normalizedCategoryTitle = normalizeCatalogSizeValue(item.categoryTitle);
  if (!normalizedCategoryTitle) {
    return false;
  }

  // No admin size selection on this product → nothing is selectable.
  if (selectableCatalogSizeValues.size === 0) {
    return false;
  }

  if (!selectableCatalogSizeValues.has(normalizedCategoryTitle)) {
    return false;
  }

  const sizeMatchedVariants = variants.filter((variant) =>
    variantMatchesSizeCategory(variant, normalizedCategoryTitle)
  );
  if (sizeMatchedVariants.length === 0) {
    return false;
  }

  const versionSourceVariants = resolveVersionSourceVariants(
    sizeMatchedVariants,
    selectedColor
  );
  const allowedVersions = collectAllowedVersionTokens(versionSourceVariants);

  // Size selected, but no size_version on variants → all items in that collection allowed.
  if (allowedVersions.size === 0) {
    return true;
  }

  const normalizedVersion = normalizeVersionToken(item.version);
  if (!normalizedVersion) {
    return false;
  }

  return allowedVersions.has(normalizedVersion);
}
