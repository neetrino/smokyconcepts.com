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

export const SIZE_ATTRIBUTE_KEY = 'size';
export const SIZE_VERSION_ATTRIBUTE_KEY = 'size_version';

const SIZE_COLLECTION_ID_PREFIX = 'size-catalog-collection:';
const SIZE_VERSION_ID_PREFIX = 'size-catalog-version:';

export function parseCollectionTokenFromSizeValueId(valueId: string): string | null {
  if (!valueId.startsWith(SIZE_COLLECTION_ID_PREFIX)) {
    return null;
  }
  return valueId.slice(SIZE_COLLECTION_ID_PREFIX.length) || null;
}

function parseCollectionTokenFromVersionValueId(valueId: string): string | null {
  if (!valueId.startsWith(SIZE_VERSION_ID_PREFIX)) {
    return null;
  }
  const payload = valueId.slice(SIZE_VERSION_ID_PREFIX.length);
  const separatorIdx = payload.indexOf(':');
  if (separatorIdx === -1) {
    return null;
  }
  return payload.slice(0, separatorIdx) || null;
}

export function getSelectedSizeCollectionTokens(
  variant: GeneratedVariant,
  sizeAttribute: CategoryAttribute | undefined
): string[] {
  if (!sizeAttribute) {
    return [];
  }
  return getSelectedValueIdsForAttribute(variant, sizeAttribute)
    .map((valueId) => parseCollectionTokenFromSizeValueId(valueId))
    .filter((token): token is string => Boolean(token));
}

function normalizeVersionLabelKey(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, '-');
}

/** Limits version choices to catalog versions for the variant's selected size collections. */
export function filterSizeVersionAttributeForVariant(
  sizeVersionAttribute: CategoryAttribute,
  selectedCollectionTokens: string[]
): CategoryAttribute {
  if (selectedCollectionTokens.length === 0) {
    return { ...sizeVersionAttribute, values: [] };
  }

  const selectedCollectionTokenSet = new Set(selectedCollectionTokens);
  const seenVersionKeys = new Set<string>();
  const values = sizeVersionAttribute.values.filter((value) => {
    const token = parseCollectionTokenFromVersionValueId(value.id);
    if (token === null || !selectedCollectionTokenSet.has(token)) {
      return false;
    }
    const versionKey = normalizeVersionLabelKey(value.label);
    if (seenVersionKeys.has(versionKey)) {
      return false;
    }
    seenVersionKeys.add(versionKey);
    return true;
  });

  return { ...sizeVersionAttribute, values };
}

/** Expands deduplicated version picks to all selected size collections. */
export function expandSizeVersionSelection(
  confirmedValueIds: string[],
  sizeVersionAttribute: CategoryAttribute,
  selectedCollectionTokens: string[]
): string[] {
  if (confirmedValueIds.length === 0 || selectedCollectionTokens.length === 0) {
    return [];
  }

  const selectedVersionKeys = new Set<string>();
  for (const valueId of confirmedValueIds) {
    const value = sizeVersionAttribute.values.find((item) => item.id === valueId);
    if (value) {
      selectedVersionKeys.add(normalizeVersionLabelKey(value.label));
    }
  }

  if (selectedVersionKeys.size === 0) {
    return [];
  }

  const selectedCollectionTokenSet = new Set(selectedCollectionTokens);
  return sizeVersionAttribute.values
    .filter((value) => {
      const token = parseCollectionTokenFromVersionValueId(value.id);
      if (token === null || !selectedCollectionTokenSet.has(token)) {
        return false;
      }
      return selectedVersionKeys.has(normalizeVersionLabelKey(value.label));
    })
    .map((value) => value.id)
    .sort();
}

/** Maps stored version ids to deduplicated picker ids for display/checkbox state. */
export function resolveSelectedSizeVersionIdsForDisplay(
  variant: GeneratedVariant,
  sizeVersionAttribute: CategoryAttribute,
  dedupedSizeVersionAttribute: CategoryAttribute
): string[] {
  const selectedVersionKeys = new Set(
    getSelectedValueIdsForAttribute(variant, sizeVersionAttribute).map((valueId) => {
      const value = sizeVersionAttribute.values.find((item) => item.id === valueId);
      return value ? normalizeVersionLabelKey(value.label) : null;
    }).filter((key): key is string => Boolean(key))
  );

  return dedupedSizeVersionAttribute.values
    .filter((value) => selectedVersionKeys.has(normalizeVersionLabelKey(value.label)))
    .map((value) => value.id);
}

/** Keeps size_version value ids only when their parent size collection is selected. */
export function enforceSizeVersionCompatibility(
  selectedValueIds: string[],
  sizeVersionAttribute: CategoryAttribute | undefined
): string[] {
  if (!sizeVersionAttribute) {
    return selectedValueIds;
  }
  const sizeVersionValueIdSet = new Set(sizeVersionAttribute.values.map((value) => value.id));
  const selectedCollectionTokens = selectedValueIds
    .map((valueId) => parseCollectionTokenFromSizeValueId(valueId))
    .filter((token): token is string => Boolean(token));

  if (selectedCollectionTokens.length === 0) {
    return selectedValueIds.filter((valueId) => !sizeVersionValueIdSet.has(valueId));
  }

  const selectedCollectionTokenSet = new Set(selectedCollectionTokens);
  return selectedValueIds.filter((valueId) => {
    if (!sizeVersionValueIdSet.has(valueId)) {
      return true;
    }
    const token = parseCollectionTokenFromVersionValueId(valueId);
    return token !== null && selectedCollectionTokenSet.has(token);
  });
}
