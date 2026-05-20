import type { SizeCatalogCategoryDto } from '@/lib/types/size-catalog';

/** Retained Image nodes so decoded bitmaps stay in memory across modal open/close. */
const loadedImages = new Map<string, HTMLImageElement>();

/** In-flight preload; shared promise per URL avoids duplicate network requests. */
const inflightPreloads = new Map<string, Promise<void>>();

/**
 * Unique image URLs from published size-catalog categories (order preserved).
 */
export function collectSizeCatalogImageUrls(
  categories: readonly SizeCatalogCategoryDto[]
): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const category of categories) {
    for (const item of category.items) {
      const url = item.imageUrl?.trim();
      if (!url || seen.has(url)) {
        continue;
      }
      seen.add(url);
      urls.push(url);
    }
  }
  return urls;
}

export function isSizeCatalogImageCached(url: string): boolean {
  const normalized = url.trim();
  return normalized.length > 0 && loadedImages.has(normalized);
}

function preloadSingleUrl(url: string): Promise<void> {
  const normalized = url.trim();
  if (!normalized) {
    return Promise.resolve();
  }
  if (loadedImages.has(normalized)) {
    return Promise.resolve();
  }
  const existing = inflightPreloads.get(normalized);
  if (existing) {
    return existing;
  }

  const promise = new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      loadedImages.set(normalized, img);
      inflightPreloads.delete(normalized);
      resolve();
    };
    img.onerror = () => {
      inflightPreloads.delete(normalized);
      resolve();
    };
    img.src = normalized;
  });

  inflightPreloads.set(normalized, promise);
  return promise;
}

/**
 * Warm browser + in-memory cache for all size-catalog thumbnails.
 * Safe to call repeatedly; already-loaded URLs resolve immediately.
 */
export function preloadSizeCatalogImageUrls(urls: readonly string[]): Promise<void> {
  if (urls.length === 0) {
    return Promise.resolve();
  }
  return Promise.all(urls.map(preloadSingleUrl)).then(() => undefined);
}

export function preloadSizeCatalogCategories(
  categories: readonly SizeCatalogCategoryDto[]
): Promise<void> {
  return preloadSizeCatalogImageUrls(collectSizeCatalogImageUrls(categories));
}
