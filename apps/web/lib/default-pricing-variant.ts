const DEFAULT_PRICING_ATTRIBUTE_KEY = "__default_pricing__";

interface VariantAttributesEntry {
  attributeKey?: unknown;
}

interface VariantLike {
  attributes?: unknown;
}

export function buildDefaultPricingAttributes(): Array<{ attributeKey: string; value: string }> {
  return [{ attributeKey: DEFAULT_PRICING_ATTRIBUTE_KEY, value: "true" }];
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

