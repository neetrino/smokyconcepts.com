import type { CategoryAttribute } from '@/lib/category-attributes';
import type { SizeCatalogCategoryDto } from '@/lib/types/size-catalog';

export const DYNAMIC_SIZE_ATTRIBUTE_ID = '__dynamic_size_catalog_attribute__';
export const DYNAMIC_SIZE_VERSION_ATTRIBUTE_ID = '__dynamic_size_catalog_version_attribute__';
export const DYNAMIC_SIZE_ATTRIBUTE_KEY = 'size';
export const DYNAMIC_SIZE_VERSION_ATTRIBUTE_KEY = 'size_version';
const DYNAMIC_SIZE_ATTRIBUTE_TITLE = 'Sizes';
const DYNAMIC_SIZE_VERSION_ATTRIBUTE_TITLE = 'Version';

function normalizeCatalogToken(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

export function buildCategoryAttributesWithSizeCatalog(
  categoryAttributes: CategoryAttribute[],
  sizeCatalogCategories: SizeCatalogCategoryDto[]
): CategoryAttribute[] {
  const baseAttributes = categoryAttributes.filter(
    (attribute) =>
      attribute.key !== DYNAMIC_SIZE_ATTRIBUTE_KEY &&
      attribute.key !== DYNAMIC_SIZE_VERSION_ATTRIBUTE_KEY
  );
  if (sizeCatalogCategories.length === 0) {
    return baseAttributes;
  }

  const collectionMap = new Map<
    string,
    {
      title: string;
      token: string;
      previewImageUrl: string | null;
      versions: Set<string>;
    }
  >();

  sizeCatalogCategories.forEach((category) => {
    const title = category.title.trim();
    if (!title) {
      return;
    }
    const normalizedTitle = title.toLowerCase();
    const token = normalizeCatalogToken(title);
    const current = collectionMap.get(normalizedTitle) ?? {
      title,
      token,
      previewImageUrl: null,
      versions: new Set<string>(),
    };

    if (!current.previewImageUrl) {
      const firstImage = category.items.find((item) => item.imageUrl)?.imageUrl ?? null;
      current.previewImageUrl = firstImage;
    }

    category.items.forEach((item) => {
      const version = item.version.trim();
      if (version) {
        current.versions.add(version);
      }
    });

    collectionMap.set(normalizedTitle, current);
  });

  const collections = Array.from(collectionMap.values()).sort((a, b) => a.title.localeCompare(b.title));
  if (collections.length === 0) {
    return baseAttributes;
  }

  const sizeAttribute: CategoryAttribute = {
    id: DYNAMIC_SIZE_ATTRIBUTE_ID,
    key: DYNAMIC_SIZE_ATTRIBUTE_KEY,
    title: DYNAMIC_SIZE_ATTRIBUTE_TITLE,
    values: collections.map((collection) => ({
      id: `size-catalog-collection:${collection.token}`,
      value: collection.title,
      label: collection.title,
      colors: [],
      imageUrl: collection.previewImageUrl,
    })),
  };

  const versionAttribute: CategoryAttribute = {
    id: DYNAMIC_SIZE_VERSION_ATTRIBUTE_ID,
    key: DYNAMIC_SIZE_VERSION_ATTRIBUTE_KEY,
    title: DYNAMIC_SIZE_VERSION_ATTRIBUTE_TITLE,
    values: collections.flatMap((collection) =>
      Array.from(collection.versions)
        .sort((a, b) => a.localeCompare(b))
        .map((version) => ({
          id: `size-catalog-version:${collection.token}:${normalizeCatalogToken(version)}`,
          value: version,
          label: version,
          colors: [],
          imageUrl: null,
        }))
    ),
  };

  return [...baseAttributes, sizeAttribute, versionAttribute];
}
