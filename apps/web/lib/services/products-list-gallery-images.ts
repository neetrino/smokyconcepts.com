import {
  processImageUrl,
  smartSplitUrls,
  normalizeUrlForComparison,
  cleanImageUrls,
} from "./utils/image-utils";

function extractProductImages(media: unknown): string[] {
  if (!Array.isArray(media)) {
    return [];
  }

  return media
    .map((item) =>
      processImageUrl(item as string | null | undefined | { url?: string; src?: string; value?: string })
    )
    .filter((url, index, urls): url is string => url !== null && urls.indexOf(url) === index);
}

export type VariantGallerySource = {
  imageUrl?: string | null;
  position?: number | null;
};

/**
 * Product list / catalog API: same gallery order as PDP `useProductImages` — main media, then variant images (by position).
 */
export function buildCatalogGalleryImages(
  media: unknown,
  variants: VariantGallerySource[]
): string[] {
  const mainStrings = extractProductImages(media);
  const cleanedMain = cleanImageUrls(mainStrings);

  const sortedVariants = [...variants].sort((a, b) => {
    const aPos = typeof a.position === "number" ? a.position : 0;
    const bPos = typeof b.position === "number" ? b.position : 0;
    return aPos - bPos;
  });

  const variantUrls: string[] = [];
  sortedVariants.forEach((v) => {
    if (v.imageUrl) {
      variantUrls.push(...smartSplitUrls(v.imageUrl));
    }
  });

  const cleanedVariantImages = cleanImageUrls(variantUrls);
  const allImages: string[] = [];
  const seenNormalized = new Set<string>();

  cleanedMain.forEach((img) => {
    const processed = processImageUrl(img) || img;
    const normalized = normalizeUrlForComparison(processed);
    if (!seenNormalized.has(normalized)) {
      allImages.push(img);
      seenNormalized.add(normalized);
    }
  });

  cleanedVariantImages.forEach((img) => {
    const processed = processImageUrl(img) || img;
    const normalized = normalizeUrlForComparison(processed);
    if (!seenNormalized.has(normalized)) {
      allImages.push(img);
      seenNormalized.add(normalized);
    }
  });

  return allImages;
}
