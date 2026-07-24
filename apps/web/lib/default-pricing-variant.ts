const DEFAULT_PRICING_ATTRIBUTE_KEY = "__default_pricing__";
const SIZE_CATALOG_CATEGORY_ID_ATTRIBUTE_KEY = "__size_catalog_category_id__";
const SIZE_CATALOG_CATEGORY_TITLE_ATTRIBUTE_KEY = "__size_catalog_category_title__";

const INTERNAL_VARIANT_ATTRIBUTE_KEYS = new Set<string>([
  DEFAULT_PRICING_ATTRIBUTE_KEY,
  SIZE_CATALOG_CATEGORY_ID_ATTRIBUTE_KEY,
  SIZE_CATALOG_CATEGORY_TITLE_ATTRIBUTE_KEY,
]);

/** Keys stored on variants for pricing/catalog plumbing — not shown as color/size in orders. */
export function isInternalVariantAttributeKey(key: string | null | undefined): boolean {
  if (!key) {
    return false;
  }
  return INTERNAL_VARIANT_ATTRIBUTE_KEYS.has(key.trim());
}

export function filterDisplayableVariantOptions<T extends { attributeKey?: string | null }>(
  options: T[]
): T[] {
  return options.filter((option) => !isInternalVariantAttributeKey(option.attributeKey));
}

interface VariantAttributesEntry {
  attributeKey?: unknown;
}

interface VariantLike {
  attributes?: unknown;
}

export function buildDefaultPricingAttributes(sizeCatalogSelection?: {
  categoryId?: string | null;
  categoryTitle?: string | null;
}): Array<{ attributeKey: string; value: string }> {
  const attributes: Array<{ attributeKey: string; value: string }> = [
    { attributeKey: DEFAULT_PRICING_ATTRIBUTE_KEY, value: "true" },
  ];

  const categoryId = sizeCatalogSelection?.categoryId?.trim();
  const categoryTitle = sizeCatalogSelection?.categoryTitle?.trim();

  if (categoryId) {
    attributes.push({
      attributeKey: SIZE_CATALOG_CATEGORY_ID_ATTRIBUTE_KEY,
      value: categoryId,
    });
  }

  if (categoryTitle) {
    attributes.push({
      attributeKey: SIZE_CATALOG_CATEGORY_TITLE_ATTRIBUTE_KEY,
      value: categoryTitle,
    });
  }

  return attributes;
}

export function isDefaultPricingVariant(variant: VariantLike | null | undefined): boolean {
  if (!variant) {
    return false;
  }

  const attributes = variant.attributes;
  if (!Array.isArray(attributes)) {
    return false;
  }

  return attributes.some((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }
    const entry = item as VariantAttributesEntry;
    return entry.attributeKey === DEFAULT_PRICING_ATTRIBUTE_KEY;
  });
}

export function extractSizeCatalogSelectionFromAttributes(
  attributes: unknown
): { categoryId: string | null; categoryTitle: string | null } {
  if (!Array.isArray(attributes)) {
    return { categoryId: null, categoryTitle: null };
  }

  let categoryId: string | null = null;
  let categoryTitle: string | null = null;

  attributes.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const entry = item as { attributeKey?: unknown; value?: unknown };
    if (typeof entry.attributeKey !== "string" || typeof entry.value !== "string") {
      return;
    }

    if (entry.attributeKey === SIZE_CATALOG_CATEGORY_ID_ATTRIBUTE_KEY) {
      categoryId = entry.value.trim() || null;
    }
    if (entry.attributeKey === SIZE_CATALOG_CATEGORY_TITLE_ATTRIBUTE_KEY) {
      categoryTitle = entry.value.trim() || null;
    }
  });

  return { categoryId, categoryTitle };
}

