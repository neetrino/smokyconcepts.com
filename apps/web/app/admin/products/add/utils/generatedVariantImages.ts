import type { GeneratedVariant } from '../types';

function uniqueImages(images: string[]): string[] {
  const seen = new Set<string>();
  return images.filter((image) => {
    const trimmed = image.trim();
    if (!trimmed || seen.has(trimmed)) {
      return false;
    }
    seen.add(trimmed);
    return true;
  });
}

export function getGeneratedVariantImages(variant: GeneratedVariant): string[] {
  return uniqueImages([...(variant.images ?? []), ...(variant.image ? [variant.image] : [])]);
}

export function getGeneratedVariantMainImageIndex(variant: GeneratedVariant): number {
  const images = getGeneratedVariantImages(variant);
  if (images.length === 0) {
    return 0;
  }
  return Math.min(Math.max(variant.mainImageIndex ?? 0, 0), images.length - 1);
}

export function getGeneratedVariantMainImage(variant: GeneratedVariant): string | null {
  const images = getGeneratedVariantImages(variant);
  if (images.length === 0) {
    return null;
  }
  return images[getGeneratedVariantMainImageIndex(variant)] ?? images[0] ?? null;
}

export function orderGeneratedVariantImagesForSubmit(variant: GeneratedVariant): string[] {
  const images = getGeneratedVariantImages(variant);
  if (images.length <= 1) {
    return images;
  }
  const mainIndex = getGeneratedVariantMainImageIndex(variant);
  const mainImage = images[mainIndex];
  return mainImage ? [mainImage, ...images.filter((_, index) => index !== mainIndex)] : images;
}
