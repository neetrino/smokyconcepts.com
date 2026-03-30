import { getCombinationKey } from '@/lib/category-attributes';
import type { CategoryAttribute } from '@/lib/category-attributes';
import type { GeneratedVariant } from '../types';

/** All value ids from this attribute present on the variant (multi-select). */
export function getSelectedValueIdsForAttribute(
  variant: GeneratedVariant,
  attribute: CategoryAttribute
): string[] {
  const allowed = new Set(attribute.values.map((v) => v.id));
  return variant.selectedValueIds.filter((id) => allowed.has(id)).sort();
}

/** Replace this attribute's contribution in the flat selectedValueIds array. */
export function mergeVariantAttributeValues(
  variant: GeneratedVariant,
  attribute: CategoryAttribute,
  valueIds: string[]
): string[] {
  const without = variant.selectedValueIds.filter((id) => !attribute.values.some((v) => v.id === id));
  const allowedSet = new Set(attribute.values.map((v) => v.id));
  const next = valueIds.filter((id) => allowedSet.has(id));
  return [...without, ...next].sort();
}

export function removeAttributeValuesFromVariant(
  variant: GeneratedVariant,
  attribute: CategoryAttribute
): string[] {
  return variant.selectedValueIds.filter((id) => !attribute.values.some((v) => v.id === id));
}

export function isDuplicateVariantCombination(
  nextSelectedValueIds: string[],
  generatedVariants: GeneratedVariant[],
  excludeVariantId: string
): boolean {
  if (nextSelectedValueIds.length === 0) {
    return false;
  }
  const key = getCombinationKey(nextSelectedValueIds);
  return generatedVariants.some(
    (v) =>
      v.id !== excludeVariantId &&
      v.selectedValueIds.length > 0 &&
      getCombinationKey(v.selectedValueIds) === key
  );
}

/** Empty combinations are keyed per variant id so multiple draft rows can coexist. */
export function hasDuplicateVariantCombinations(variants: GeneratedVariant[]): boolean {
  const keys = variants.map((v) =>
    v.selectedValueIds.length === 0 ? `__draft__:${v.id}` : getCombinationKey(v.selectedValueIds)
  );
  return new Set(keys).size !== keys.length;
}
