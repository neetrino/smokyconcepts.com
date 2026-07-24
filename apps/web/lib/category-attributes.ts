export interface CategoryAttributeValue {
  id: string;
  value: string;
  label: string;
  colors: string[];
  imageUrl: string | null;
}

export interface CategoryAttribute {
  id: string;
  key: string;
  title: string;
  values: CategoryAttributeValue[];
}

export interface StoredVariantAttributeOption {
  attributeKey: string;
  value: string;
  attributeValue: {
    id: string;
    value: string;
    attribute: {
      id: string;
      key: string;
    };
    translations: Array<{
      locale: string;
      label: string;
    }>;
    imageUrl: string | null;
    colors: string[];
  };
}

export type CategoryAttributesMap = Record<string, CategoryAttribute[]>;

/** @deprecated Legacy per-category storage; read only for one-time migration */
export const CATEGORY_ATTRIBUTES_SETTING_KEY = "categoryAttributes";

/** Single list of variant attributes for all categories */
export const GLOBAL_PRODUCT_ATTRIBUTES_SETTING_KEY = "globalProductAttributes";

export function slugifyAttributeKey(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function normalizeAttributeTitle(title: string): string {
  return title.trim();
}

export function normalizeAttributeValueLabel(label: string): string {
  return label.trim();
}

export function getCombinationKey(selectedValueIds: string[]): string {
  return [...selectedValueIds].sort().join("|");
}

export function extractSelectedValueIdsFromVariantAttributes(
  attributes: unknown
): string[] {
  if (!Array.isArray(attributes)) {
    return [];
  }

  return attributes
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }

      const attributeOption = item as {
        attributeValue?: {
          id?: string;
        };
      };

      return typeof attributeOption.attributeValue?.id === "string"
        ? attributeOption.attributeValue.id
        : null;
    })
    .filter((valueId): valueId is string => Boolean(valueId));
}

export function buildVariantAttributePayload(
  selectedValueIds: string[],
  attributes: CategoryAttribute[]
): StoredVariantAttributeOption[] {
  const valueLookup = new Map<
    string,
    { attribute: CategoryAttribute; value: CategoryAttributeValue }
  >();

  for (const attribute of attributes) {
    for (const value of attribute.values) {
      valueLookup.set(value.id, { attribute, value });
    }
  }

  const payload: StoredVariantAttributeOption[] = [];
  for (const valueId of selectedValueIds) {
    const found = valueLookup.get(valueId);
    if (!found) {
      continue;
    }
    const { attribute, value } = found;
    payload.push({
      attributeKey: attribute.key,
      value: value.value,
      attributeValue: {
        id: value.id,
        value: value.value,
        attribute: {
          id: attribute.id,
          key: attribute.key,
        },
        translations: [
          {
            locale: "en",
            label: value.label,
          },
        ],
        imageUrl: value.imageUrl,
        colors: value.colors,
      },
    });
  }

  return payload;
}

export function buildSelectedAttributeValueIdsMap(
  attributes: CategoryAttribute[],
  generatedVariants: Array<{ selectedValueIds: string[] }>
): Record<string, string[]> {
  const valueToAttributeId = new Map<string, string>();
  for (const attribute of attributes) {
    for (const value of attribute.values) {
      valueToAttributeId.set(value.id, attribute.id);
    }
  }

  const accumulator: Record<string, string[]> = {};
  const seenPerAttribute = new Map<string, Set<string>>();

  for (const variant of generatedVariants) {
    for (const valueId of variant.selectedValueIds) {
      const attributeId = valueToAttributeId.get(valueId);
      if (!attributeId) {
        continue;
      }
      let seen = seenPerAttribute.get(attributeId);
      if (!seen) {
        seen = new Set<string>();
        seenPerAttribute.set(attributeId, seen);
        accumulator[attributeId] = [];
      }
      if (seen.has(valueId)) {
        continue;
      }
      seen.add(valueId);
      accumulator[attributeId].push(valueId);
    }
  }

  return accumulator;
}

/** Stable string for comparing attribute id → value id maps (key order and array order ignored). */
export function serializeAttributeValueIdsMap(map: Record<string, string[]>): string {
  const sortedKeys = Object.keys(map).sort();
  return JSON.stringify(
    Object.fromEntries(
      sortedKeys.map((key) => [key, [...map[key]].sort()])
    )
  );
}
