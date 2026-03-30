import { db } from "@white-shop/db";
import {
  CATEGORY_ATTRIBUTES_SETTING_KEY,
  GLOBAL_PRODUCT_ATTRIBUTES_SETTING_KEY,
  normalizeAttributeTitle,
  normalizeAttributeValueLabel,
  slugifyAttributeKey,
  type CategoryAttribute,
  type CategoryAttributesMap,
  type CategoryAttributeValue,
} from "@/lib/category-attributes";

function mergeLegacyCategoryAttributesMap(map: CategoryAttributesMap): CategoryAttribute[] {
  const merged: CategoryAttribute[] = [];
  const seenIds = new Set<string>();
  for (const categoryId of Object.keys(map)) {
    const list = map[categoryId];
    if (!Array.isArray(list)) {
      continue;
    }
    for (const attribute of list) {
      if (attribute && typeof attribute.id === "string" && !seenIds.has(attribute.id)) {
        seenIds.add(attribute.id);
        merged.push(attribute);
      }
    }
  }
  return merged;
}

class AdminGlobalAttributesService {
  private async persistGlobalAttributes(attributes: CategoryAttribute[]): Promise<void> {
    await db.settings.upsert({
      where: {
        key: GLOBAL_PRODUCT_ATTRIBUTES_SETTING_KEY,
      },
      update: {
        value: attributes,
        updatedAt: new Date(),
      },
      create: {
        key: GLOBAL_PRODUCT_ATTRIBUTES_SETTING_KEY,
        value: attributes,
        description: "Global variant attributes for all categories",
      },
    });
  }

  /**
   * Loads global attributes. Migrates from legacy per-category map once if global row is absent.
   */
  private async loadGlobalAttributesWithMigration(): Promise<CategoryAttribute[]> {
    const globalSetting = await db.settings.findUnique({
      where: { key: GLOBAL_PRODUCT_ATTRIBUTES_SETTING_KEY },
    });

    if (globalSetting && Array.isArray(globalSetting.value)) {
      return globalSetting.value as CategoryAttribute[];
    }

    const legacySetting = await db.settings.findUnique({
      where: { key: CATEGORY_ATTRIBUTES_SETTING_KEY },
    });

    if (
      legacySetting &&
      typeof legacySetting.value === "object" &&
      legacySetting.value !== null &&
      !Array.isArray(legacySetting.value)
    ) {
      const merged = mergeLegacyCategoryAttributesMap(legacySetting.value as CategoryAttributesMap);
      await this.persistGlobalAttributes(merged);
      return merged;
    }

    if (!globalSetting) {
      await this.persistGlobalAttributes([]);
    }

    return [];
  }

  async getGlobalAttributes() {
    const data = await this.loadGlobalAttributesWithMigration();
    return { data };
  }

  async createGlobalAttribute(data: { title: string }) {
    const title = normalizeAttributeTitle(data.title);
    if (!title) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation Error",
        detail: "Attribute title is required",
      };
    }

    const existingAttributes = await this.loadGlobalAttributesWithMigration();

    const baseKey = slugifyAttributeKey(title) || "attribute";
    let nextKey = baseKey;
    let keyCounter = 1;
    while (existingAttributes.some((attribute) => attribute.key === nextKey)) {
      nextKey = `${baseKey}_${keyCounter}`;
      keyCounter += 1;
    }

    const nextAttribute: CategoryAttribute = {
      id: crypto.randomUUID(),
      key: nextKey,
      title,
      values: [],
    };

    await this.persistGlobalAttributes([...existingAttributes, nextAttribute]);

    return {
      data: nextAttribute,
    };
  }

  async updateGlobalAttribute(attributeId: string, data: { title?: string }) {
    const existingAttributes = await this.loadGlobalAttributesWithMigration();
    const attributeIndex = existingAttributes.findIndex((attribute) => attribute.id === attributeId);

    if (attributeIndex === -1) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Attribute not found",
        detail: `Attribute with id '${attributeId}' does not exist`,
      };
    }

    const currentAttribute = existingAttributes[attributeIndex];
    const nextTitle = data.title !== undefined ? normalizeAttributeTitle(data.title) : currentAttribute.title;
    if (!nextTitle) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation Error",
        detail: "Attribute title is required",
      };
    }

    const nextAttributes = [...existingAttributes];
    nextAttributes[attributeIndex] = {
      ...currentAttribute,
      title: nextTitle,
    };

    await this.persistGlobalAttributes(nextAttributes);

    return {
      data: nextAttributes[attributeIndex],
    };
  }

  async deleteGlobalAttribute(attributeId: string) {
    const existingAttributes = await this.loadGlobalAttributesWithMigration();
    const nextAttributes = existingAttributes.filter((attribute) => attribute.id !== attributeId);

    await this.persistGlobalAttributes(nextAttributes);

    return { success: true };
  }

  async addGlobalAttributeValue(
    attributeId: string,
    data: {
      label: string;
      colors?: string[];
      imageUrl?: string | null;
    }
  ) {
    const label = normalizeAttributeValueLabel(data.label);
    if (!label) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation Error",
        detail: "Attribute value label is required",
      };
    }

    const existingAttributes = await this.loadGlobalAttributesWithMigration();
    const attributeIndex = existingAttributes.findIndex((attribute) => attribute.id === attributeId);

    if (attributeIndex === -1) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Attribute not found",
        detail: `Attribute with id '${attributeId}' does not exist`,
      };
    }

    const currentAttribute = existingAttributes[attributeIndex];
    const normalizedLabel = label.toLowerCase();
    if (currentAttribute.values.some((value) => value.label.trim().toLowerCase() === normalizedLabel)) {
      throw {
        status: 409,
        type: "https://api.shop.am/problems/conflict",
        title: "Attribute value already exists",
        detail: `Value '${label}' already exists for this attribute`,
      };
    }

    const nextValue: CategoryAttributeValue = {
      id: crypto.randomUUID(),
      value: slugifyAttributeKey(label) || label.toLowerCase(),
      label,
      colors: Array.isArray(data.colors) ? data.colors.filter((color) => typeof color === "string" && color.trim().length > 0) : [],
      imageUrl: typeof data.imageUrl === "string" && data.imageUrl.trim().length > 0 ? data.imageUrl.trim() : null,
    };

    const nextAttributes = [...existingAttributes];
    nextAttributes[attributeIndex] = {
      ...currentAttribute,
      values: [...currentAttribute.values, nextValue],
    };

    await this.persistGlobalAttributes(nextAttributes);

    return {
      data: nextAttributes[attributeIndex],
    };
  }

  async updateGlobalAttributeValue(
    attributeId: string,
    valueId: string,
    data: {
      label?: string;
      colors?: string[];
      imageUrl?: string | null;
    }
  ) {
    const existingAttributes = await this.loadGlobalAttributesWithMigration();
    const attributeIndex = existingAttributes.findIndex((attribute) => attribute.id === attributeId);

    if (attributeIndex === -1) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Attribute not found",
        detail: `Attribute with id '${attributeId}' does not exist`,
      };
    }

    const currentAttribute = existingAttributes[attributeIndex];
    const valueIndex = currentAttribute.values.findIndex((value) => value.id === valueId);

    if (valueIndex === -1) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Attribute value not found",
        detail: `Attribute value with id '${valueId}' does not exist`,
      };
    }

    const currentValue = currentAttribute.values[valueIndex];
    const nextLabel = data.label !== undefined ? normalizeAttributeValueLabel(data.label) : currentValue.label;
    if (!nextLabel) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation Error",
        detail: "Attribute value label is required",
      };
    }

    const nextValues = [...currentAttribute.values];
    nextValues[valueIndex] = {
      ...currentValue,
      label: nextLabel,
      value: slugifyAttributeKey(nextLabel) || nextLabel.toLowerCase(),
      colors: Array.isArray(data.colors)
        ? data.colors.filter((color) => typeof color === "string" && color.trim().length > 0)
        : currentValue.colors,
      imageUrl:
        data.imageUrl !== undefined
          ? typeof data.imageUrl === "string" && data.imageUrl.trim().length > 0
            ? data.imageUrl.trim()
            : null
          : currentValue.imageUrl,
    };

    const nextAttributes = [...existingAttributes];
    nextAttributes[attributeIndex] = {
      ...currentAttribute,
      values: nextValues,
    };

    await this.persistGlobalAttributes(nextAttributes);

    return {
      data: nextAttributes[attributeIndex],
    };
  }

  async deleteGlobalAttributeValue(attributeId: string, valueId: string) {
    const existingAttributes = await this.loadGlobalAttributesWithMigration();
    const attributeIndex = existingAttributes.findIndex((attribute) => attribute.id === attributeId);

    if (attributeIndex === -1) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Attribute not found",
        detail: `Attribute with id '${attributeId}' does not exist`,
      };
    }

    const currentAttribute = existingAttributes[attributeIndex];
    const nextAttributes = [...existingAttributes];
    nextAttributes[attributeIndex] = {
      ...currentAttribute,
      values: currentAttribute.values.filter((value) => value.id !== valueId),
    };

    await this.persistGlobalAttributes(nextAttributes);

    return { success: true };
  }
}

export const adminGlobalAttributesService = new AdminGlobalAttributesService();
