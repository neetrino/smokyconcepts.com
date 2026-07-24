import { catalogPriceForStorefront } from '@/lib/currency';
import { isDefaultPricingVariant, isDisplayVariant } from '@/lib/default-pricing-variant';
import { processImageUrl, smartSplitUrls } from '../../utils/image-utils';

interface ProductListCategory {
  translations?: Array<{
    title: string;
  }>;
}

interface ProductListVariant {
  price: number;
  stock: number;
  compareAtPrice: number | null;
  imageUrl?: string | null;
  attributes?: unknown;
}

interface ProductListItem {
  id: string;
  published: boolean;
  featured: boolean | null;
  upcoming: boolean | null;
  discountPercent: number | null;
  createdAt: Date;
  primaryCategoryId?: string | null;
  categoryIds?: string[];
  translations?: Array<{
    slug: string;
    title: string;
  }>;
  categories?: ProductListCategory[];
  variants?: ProductListVariant[];
  media?: unknown[];
}

/**
 * Format product for list response
 */
export function formatProductForList(
  product: ProductListItem,
  fallbackCategoryTitlesById: Map<string, string> = new Map()
) {
  // Безопасное получение translation с проверкой на существование массива
  const translation = Array.isArray(product.translations) && product.translations.length > 0
    ? product.translations[0]
    : null;
  
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const defaultPricingVariant = variants.find((item) => isDefaultPricingVariant(item));
  const pricingVariant = defaultPricingVariant ?? variants[0] ?? null;

  const image = resolveProductListImage(product.media, variants);
  const relationCategories = Array.isArray(product.categories)
    ? product.categories
        .map((category) => category.translations?.[0]?.title?.trim() || "")
        .filter((title, index, titles) => title.length > 0 && titles.indexOf(title) === index)
    : [];
  const fallbackCategories = [
    ...(Array.isArray(product.categoryIds) ? product.categoryIds : []),
    product.primaryCategoryId || "",
  ]
    .filter((categoryId, index, categoryIds) => categoryId.length > 0 && categoryIds.indexOf(categoryId) === index)
    .map((categoryId) => fallbackCategoryTitlesById.get(categoryId)?.trim() || "")
    .filter((title, index, titles) => title.length > 0 && titles.indexOf(title) === index);
  const categories = relationCategories.length > 0 ? relationCategories : fallbackCategories;

  return {
    id: product.id,
    slug: translation?.slug || "",
    title: translation?.title || "",
    published: product.published,
    featured: product.featured || false,
    upcoming: product.upcoming || false,
    price: catalogPriceForStorefront(pricingVariant?.price || 0),
    stock: pricingVariant?.stock || 0,
    discountPercent: product.discountPercent || 0,
    compareAtPrice:
      pricingVariant?.compareAtPrice != null ? catalogPriceForStorefront(pricingVariant.compareAtPrice) : null,
    categories,
    colorStocks: [], // Can be enhanced later
    image,
    createdAt: product.createdAt.toISOString(),
  };
}

/**
 * Extract image from media array
 */
function extractFirstVariantImage(
  variant: { imageUrl?: string | null } | null | undefined
): string | null {
  return resolveFirstImageUrl(variant?.imageUrl);
}

function resolveFirstImageUrl(source: string | null | undefined): string | null {
  for (const url of smartSplitUrls(source)) {
    const processed = processImageUrl(url);
    if (processed) return processed;
  }

  return null;
}

function resolveProductListImage(media: unknown[] | undefined, variants: ProductListVariant[]): string | null {
  const displayVariant = variants.find((item) => isDisplayVariant(item));
  const displayImage = extractFirstVariantImage(displayVariant);
  if (displayImage) return displayImage;

  const defaultPricingVariant = variants.find((item) => isDefaultPricingVariant(item));
  const defaultPricingImage = extractFirstVariantImage(defaultPricingVariant);
  if (defaultPricingImage) return defaultPricingImage;

  const mediaImage = extractImageFromMedia(media);
  if (mediaImage) return mediaImage;

  const selectableVariants = variants.filter(
    (item) => !isDefaultPricingVariant(item) && !isDisplayVariant(item)
  );
  for (const selectableVariant of selectableVariants) {
    const image = extractFirstVariantImage(selectableVariant);
    if (image) {
      return image;
    }
  }

  for (const item of variants) {
    const image = extractFirstVariantImage(item);
    if (image) {
      return image;
    }
  }

  return null;
}

function extractImageFromMedia(media: unknown[] | undefined): string | null {
  if (!Array.isArray(media) || media.length === 0) {
    return null;
  }

  const firstMedia = media[0];
  
  if (typeof firstMedia === "string") {
    return resolveFirstImageUrl(firstMedia);
  }
  
  if (firstMedia && typeof firstMedia === "object" && "url" in firstMedia) {
    const mediaObj = firstMedia as { url?: string };
    return resolveFirstImageUrl(mediaObj.url);
  }

  return null;
}
