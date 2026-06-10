import {
  extractSizeCatalogSelectionFromAttributes,
  isDefaultPricingVariant,
  isDisplayVariant,
} from '@/lib/default-pricing-variant';
import { smartSplitUrls } from '@/lib/services/utils/image-utils';
import { buildAutoSkuForVariantIndex } from './autoSku';
import type { GeneratedVariant, ProductData } from '../types';

type VariantItem = NonNullable<ProductData['variants']>[number];

function toPriceString(value: unknown): string {
  const num = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(num) && num > 0 ? String(num) : '';
}

function toStockString(value: unknown): string {
  const num = typeof value === 'number' ? value : parseInt(String(value ?? '0'), 10);
  return Number.isFinite(num) ? String(num) : '0';
}

function mapVariantItem(v: VariantItem, idx: number, slug: string): GeneratedVariant {
  const apiSku = typeof v.sku === 'string' ? v.sku.trim() : '';
  const compareNum =
    typeof v.compareAtPrice === 'number' ? v.compareAtPrice : parseFloat(String(v.compareAtPrice ?? '')) || 0;
  const images =
    typeof v.imageUrl === 'string' && v.imageUrl.trim() !== '' ? smartSplitUrls(v.imageUrl) : [];

  return {
    id: v.id || `variant-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    selectedValueIds: Array.isArray(v.selectedValueIds) ? v.selectedValueIds : [],
    price: toPriceString(v.price),
    compareAtPrice: compareNum > 0 ? String(compareNum) : '',
    stock: toStockString(v.stock),
    sku: apiSku !== '' ? apiSku : buildAutoSkuForVariantIndex(slug, idx),
    image: images[0] ?? null,
    images,
    mainImageIndex: 0,
    isDisplayVariant: false,
  };
}

export function mapApiVariantsToGeneratedVariants(
  apiVariants: VariantItem[],
  productSlug: string,
  productMedia: string[] = []
): { generatedVariants: GeneratedVariant[]; sizeCatalogCategoryId: string; sizeCatalogCategoryTitle: string } {
  if (apiVariants.length === 0) {
    return { generatedVariants: [], sizeCatalogCategoryId: '', sizeCatalogCategoryTitle: '' };
  }

  const defaultPricingVariant = apiVariants.find((variant) => isDefaultPricingVariant(variant));
  const selectableVariants = apiVariants.filter((variant) => !isDefaultPricingVariant(variant));
  const sourceVariants = selectableVariants.length > 0 ? selectableVariants : apiVariants;
  const slug = productSlug || '';

  const generated = sourceVariants.map((v, idx) => mapVariantItem(v, idx, slug));

  const displayFromApi = sourceVariants.find((v) => isDisplayVariant(v));
  const sizeCatalogSource = displayFromApi ?? defaultPricingVariant ?? sourceVariants[0];
  const sizeCatalogSelection = extractSizeCatalogSelectionFromAttributes(sizeCatalogSource?.attributes);

  let displayIndex = sourceVariants.findIndex((v) => isDisplayVariant(v));
  if (displayIndex < 0 && productMedia.length > 0) {
    displayIndex = generated.findIndex((v) => v.image && productMedia.some((media) => media === v.image));
  }
  if (displayIndex < 0) {
    displayIndex = 0;
  }

  const generatedVariants = generated.map((variant, index) => ({
    ...variant,
    isDisplayVariant: index === displayIndex,
  }));

  return {
    generatedVariants,
    sizeCatalogCategoryId: sizeCatalogSelection.categoryId || '',
    sizeCatalogCategoryTitle: sizeCatalogSelection.categoryTitle || '',
  };
}
