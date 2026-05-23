import { normalizeSizeCatalogCategoryTitleKey } from '@/lib/size-catalog/resolve-size-catalog-category-price-amd';
import type { SizeCatalogCategoryDto } from '@/lib/types/size-catalog';
import type { Product, ProductVariant, VariantOption } from '../types';

const SIZE_CATALOG_CATEGORY_ID_KEY = '__size_catalog_category_id__';
const SIZE_CATALOG_CATEGORY_TITLE_KEY = '__size_catalog_category_title__';
const DEFAULT_PRICING_KEY = '__default_pricing__';

export interface ProductSizeCatalogSelection {
  categoryId: string | null;
  categoryTitle: string | null;
}

export function extractSizeCatalogSelectionFromVariantOptions(
  options: VariantOption[] | undefined
): ProductSizeCatalogSelection {
  if (!options?.length) {
    return { categoryId: null, categoryTitle: null };
  }

  let categoryId: string | null = null;
  let categoryTitle: string | null = null;

  for (const option of options) {
    const key = (option.key || option.attribute || '').trim();
    const value = (option.value || '').trim();
    if (!value) {
      continue;
    }
    if (key === SIZE_CATALOG_CATEGORY_ID_KEY) {
      categoryId = value;
    }
    if (key === SIZE_CATALOG_CATEGORY_TITLE_KEY) {
      categoryTitle = value;
    }
  }

  return { categoryId, categoryTitle };
}

function variantHasDefaultPricingFlag(options: VariantOption[] | undefined): boolean {
  return (
    options?.some((option) => {
      const key = (option.key || option.attribute || '').trim();
      return key === DEFAULT_PRICING_KEY;
    }) ?? false
  );
}

/** Admin default-pricing variant holds size-catalog template id/title. */
export function findProductDefaultPricingVariant(product: Product): ProductVariant | null {
  const fromFlag = product.variants.find((variant) =>
    variantHasDefaultPricingFlag(variant.options)
  );
  if (fromFlag) {
    return fromFlag;
  }
  if (product.defaultVariantId) {
    return (
      product.variants.find(
        (variant) =>
          variant.id === product.defaultVariantId ||
          variant.id.endsWith(product.defaultVariantId as string)
      ) ?? null
    );
  }
  return null;
}

export function resolveProductSizeCatalogSelection(
  product: Product,
  currentVariant: ProductVariant | null
): ProductSizeCatalogSelection {
  const fromApi = product.defaultSizeCatalogSelection;
  if (fromApi?.categoryId?.trim() || fromApi?.categoryTitle?.trim()) {
    return {
      categoryId: fromApi.categoryId?.trim() || null,
      categoryTitle: fromApi.categoryTitle?.trim() || null,
    };
  }

  const defaultVariant = findProductDefaultPricingVariant(product);
  const fromDefault = extractSizeCatalogSelectionFromVariantOptions(defaultVariant?.options);
  if (fromDefault.categoryId || fromDefault.categoryTitle) {
    return fromDefault;
  }
  return extractSizeCatalogSelectionFromVariantOptions(currentVariant?.options);
}

/** Category ids/titles explicitly assigned on product variants (admin default-pricing / template). */
export function collectProductSizeCatalogCategoryKeys(product: Product): {
  ids: Set<string>;
  titleKeys: Set<string>;
} {
  const ids = new Set<string>();
  const titleKeys = new Set<string>();

  for (const id of product.sizeCatalogCategoryIds ?? []) {
    const trimmed = id.trim();
    if (trimmed) {
      ids.add(trimmed);
    }
  }
  for (const title of product.sizeCatalogCategoryTitles ?? []) {
    const titleKey = normalizeSizeCatalogCategoryTitleKey(title);
    if (titleKey) {
      titleKeys.add(titleKey);
    }
  }

  for (const variant of product.variants) {
    const selection = extractSizeCatalogSelectionFromVariantOptions(variant.options);
    const id = selection.categoryId?.trim();
    if (id) {
      ids.add(id);
    }
    const titleKey = normalizeSizeCatalogCategoryTitleKey(selection.categoryTitle);
    if (titleKey) {
      titleKeys.add(titleKey);
    }
  }

  return { ids, titleKeys };
}

/** True when the product variant data includes this size-catalog template category. */
export function productAllowsSizeCatalogCategorySelection(
  product: Product,
  selection: ProductSizeCatalogSelection
): boolean {
  const { ids, titleKeys } = collectProductSizeCatalogCategoryKeys(product);
  const id = selection.categoryId?.trim();
  if (id && ids.has(id)) {
    return true;
  }
  const titleKey = normalizeSizeCatalogCategoryTitleKey(selection.categoryTitle);
  return titleKey !== '' && titleKeys.has(titleKey);
}

function getVariantSizeLabel(variant: ProductVariant | null): string | null {
  if (!variant?.options?.length) {
    return null;
  }
  const sizeOpt = variant.options.find((option) => {
    const key = `${option.attribute || ''} ${option.key || ''}`.toLowerCase();
    return key.includes('size') && !key.includes('version') && !key.includes('catalog');
  });
  return sizeOpt?.value?.trim() ?? null;
}

/** Explicit admin assignment, or active variant size matches the collection title. */
export function productAllowsCustomizeCollectionSelection(
  product: Product,
  currentVariant: ProductVariant | null,
  selection: ProductSizeCatalogSelection,
  selectedSizeLabel: string | null
): boolean {
  if (productAllowsSizeCatalogCategorySelection(product, selection)) {
    return true;
  }

  const categoryKey = normalizeSizeCatalogCategoryTitleKey(selection.categoryTitle);
  if (!categoryKey) {
    return false;
  }

  const activeSizeKeys = [
    normalizeSizeCatalogCategoryTitleKey(selectedSizeLabel),
    normalizeSizeCatalogCategoryTitleKey(getVariantSizeLabel(currentVariant)),
  ].filter((key) => key !== '');

  return activeSizeKeys.some((sizeKey) => sizeKey === categoryKey);
}

function isEmptySelection(selection: ProductSizeCatalogSelection): boolean {
  return !selection.categoryId?.trim() && !selection.categoryTitle?.trim();
}

function pushUniqueSelection(
  candidates: ProductSizeCatalogSelection[],
  selection: ProductSizeCatalogSelection
): void {
  if (isEmptySelection(selection)) {
    return;
  }
  const id = selection.categoryId?.trim() ?? '';
  const titleKey = normalizeSizeCatalogCategoryTitleKey(selection.categoryTitle);
  const duplicate = candidates.some((candidate) => {
    const candidateId = candidate.categoryId?.trim() ?? '';
    const candidateTitleKey = normalizeSizeCatalogCategoryTitleKey(candidate.categoryTitle);
    return (id !== '' && candidateId === id) || (titleKey !== '' && candidateTitleKey === titleKey);
  });
  if (!duplicate) {
    candidates.push(selection);
  }
}

/**
 * Customize surcharge category — prefers active size/catalog pick, then product template.
 * Only returns a selection that the product is allowed to use.
 */
export function resolveCustomizeCollectionSelection(params: {
  product: Product;
  currentVariant: ProductVariant | null;
  categories: SizeCatalogCategoryDto[];
  selectedCatalogSize: { categoryId: string; categoryTitle: string } | null;
  selectedSizeLabel: string | null;
}): ProductSizeCatalogSelection {
  const { product, currentVariant, categories, selectedCatalogSize, selectedSizeLabel } = params;
  const candidates: ProductSizeCatalogSelection[] = [];

  if (selectedCatalogSize != null) {
    pushUniqueSelection(candidates, {
      categoryId: selectedCatalogSize.categoryId,
      categoryTitle: selectedCatalogSize.categoryTitle,
    });
  }

  const sizeKey = normalizeSizeCatalogCategoryTitleKey(selectedSizeLabel);
  if (sizeKey) {
    for (const title of product.sizeCatalogCategoryTitles ?? []) {
      if (normalizeSizeCatalogCategoryTitleKey(title) === sizeKey) {
        pushUniqueSelection(candidates, { categoryId: null, categoryTitle: title });
      }
    }
    for (const cat of categories) {
      if (normalizeSizeCatalogCategoryTitleKey(cat.title) === sizeKey) {
        pushUniqueSelection(candidates, { categoryId: cat.id, categoryTitle: cat.title });
      }
    }
  }

  pushUniqueSelection(candidates, resolveProductSizeCatalogSelection(product, currentVariant));

  for (const selection of candidates) {
    if (
      !productAllowsCustomizeCollectionSelection(
        product,
        currentVariant,
        selection,
        selectedSizeLabel
      )
    ) {
      continue;
    }
    const resolved = resolveCollectionPriceAmdFromCategories(categories, selection);
    if (resolved.priceAmd > 0) {
      return selection;
    }
  }

  return { categoryId: null, categoryTitle: null };
}

export function resolveCollectionPriceAmdFromCategories(
  categories: SizeCatalogCategoryDto[],
  selection: ProductSizeCatalogSelection
): { priceAmd: number; categoryTitle: string | null } {
  const idKey = selection.categoryId?.trim() ?? '';
  if (idKey) {
    const byId = categories.find((cat) => cat.id === idKey);
    if (byId) {
      return { priceAmd: byId.priceAmd, categoryTitle: byId.title };
    }
  }

  const titleKey = normalizeSizeCatalogCategoryTitleKey(selection.categoryTitle);
  if (titleKey) {
    let maxPrice = 0;
    let matchedTitle: string | null = null;
    for (const cat of categories) {
      if (normalizeSizeCatalogCategoryTitleKey(cat.title) !== titleKey) {
        continue;
      }
      if (cat.priceAmd > maxPrice) {
        maxPrice = cat.priceAmd;
        matchedTitle = cat.title;
      }
    }
    if (maxPrice > 0) {
      return { priceAmd: maxPrice, categoryTitle: matchedTitle };
    }
  }

  return { priceAmd: 0, categoryTitle: null };
}
