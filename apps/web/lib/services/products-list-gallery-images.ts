import {
  processImageUrl,
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

/**
 * Product list / catalog cards: admin-uploaded media only (variant images excluded — same as PDP `useProductImages`).
 */
export function buildCatalogGalleryImages(media: unknown): string[] {
  const mainStrings = extractProductImages(media);
  const cleanedMain = cleanImageUrls(mainStrings);
  const uniqueMainImages: string[] = [];
  const seenNormalized = new Set<string>();

  cleanedMain.forEach((img) => {
    const processed = processImageUrl(img) || img;
    const normalized = normalizeUrlForComparison(processed);
    if (!seenNormalized.has(normalized)) {
      uniqueMainImages.push(img);
      seenNormalized.add(normalized);
    }
  });

  return uniqueMainImages;
}
