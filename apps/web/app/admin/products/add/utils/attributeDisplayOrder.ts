import type { CategoryAttribute } from '@/lib/category-attributes';
import type { GeneratedVariant } from '../types';

/**
 * Attribute ids in the order their values first appear across variants.
 * Used when restoring edit mode so admin table matches stored option order.
 */
export function deriveAttributeOrderFromVariants(
  categoryAttributes: CategoryAttribute[],
  generatedVariants: GeneratedVariant[]
): string[] {
  const order: string[] = [];
  const seen = new Set<string>();
  const valueToAttributeId = new Map<string, string>();

  for (const attribute of categoryAttributes) {
    for (const value of attribute.values) {
      valueToAttributeId.set(value.id, attribute.id);
    }
  }

  for (const variant of generatedVariants) {
    for (const valueId of variant.selectedValueIds) {
      const attributeId = valueToAttributeId.get(valueId);
      if (!attributeId || seen.has(attributeId)) {
        continue;
      }
      seen.add(attributeId);
      order.push(attributeId);
    }
  }

  return order;
}

/** Sort enabled attributes by explicit enable/store order; unknown ids keep catalog order at the end. */
export function orderAttributesByIds(
  attributes: CategoryAttribute[],
  orderedIds: string[]
): CategoryAttribute[] {
  if (orderedIds.length === 0) {
    return attributes;
  }

  const byId = new Map(attributes.map((attribute) => [attribute.id, attribute]));
  const ordered: CategoryAttribute[] = [];
  const used = new Set<string>();

  for (const id of orderedIds) {
    const attribute = byId.get(id);
    if (!attribute || used.has(id)) {
      continue;
    }
    ordered.push(attribute);
    used.add(id);
  }

  for (const attribute of attributes) {
    if (!used.has(attribute.id)) {
      ordered.push(attribute);
    }
  }

  return ordered;
}

export function appendEnabledAttributeOrder(
  previousOrder: string[],
  attributeId: string,
  relatedIds: string[] = []
): string[] {
  const next = previousOrder.filter((id) => id !== attributeId && !relatedIds.includes(id));
  next.push(attributeId);
  for (const relatedId of relatedIds) {
    if (!next.includes(relatedId)) {
      next.push(relatedId);
    }
  }
  return next;
}

export function removeFromEnabledAttributeOrder(
  previousOrder: string[],
  attributeIds: string[]
): string[] {
  const removeSet = new Set(attributeIds);
  return previousOrder.filter((id) => !removeSet.has(id));
}
