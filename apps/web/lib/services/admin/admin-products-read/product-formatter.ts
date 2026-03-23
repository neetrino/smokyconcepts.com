interface ProductListCategory {
  translations?: Array<{
    title: string;
  }>;
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
  variants?: Array<{
    price: number;
    stock: number;
    compareAtPrice: number | null;
  }>;
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
  
  // Безопасное получение variant с проверкой на существование массива
  const variant = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants[0]
    : null;
  
  const image = extractImageFromMedia(product.media);
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
    price: variant?.price || 0,
    stock: variant?.stock || 0,
    discountPercent: product.discountPercent || 0,
    compareAtPrice: variant?.compareAtPrice || null,
    categories,
    colorStocks: [], // Can be enhanced later
    image,
    createdAt: product.createdAt.toISOString(),
  };
}

/**
 * Extract image from media array
 */
function extractImageFromMedia(media: unknown[] | undefined): string | null {
  if (!Array.isArray(media) || media.length === 0) {
    return null;
  }

  const firstMedia = media[0];
  
  if (typeof firstMedia === "string") {
    return firstMedia;
  }
  
  if (firstMedia && typeof firstMedia === "object" && "url" in firstMedia) {
    const mediaObj = firstMedia as { url?: string };
    return mediaObj.url || null;
  }

  return null;
}




