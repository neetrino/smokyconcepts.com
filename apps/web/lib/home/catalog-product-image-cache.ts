/** Retained Image nodes so decoded bitmaps stay in memory across carousel wrap / remount. */
const loadedImages = new Map<string, HTMLImageElement>();

const inflightPreloads = new Map<string, Promise<void>>();

function normalizeImageUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    return null;
  }
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }
  return `/${trimmed}`;
}

/**
 * Unique image URLs from catalog list rows (order preserved).
 */
export function collectCatalogProductImageUrls(
  products: readonly { image: string | null; images?: string[] }[]
): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const product of products) {
    const candidates =
      product.images && product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [];
    for (const raw of candidates) {
      const url = normalizeImageUrl(raw);
      if (!url || seen.has(url)) {
        continue;
      }
      seen.add(url);
      urls.push(url);
    }
  }
  return urls;
}

export function isCatalogProductImageCached(url: string): boolean {
  const normalized = url.trim();
  return normalized.length > 0 && loadedImages.has(normalized);
}

export function areAllCatalogProductImagesCached(
  products: readonly { image: string | null; images?: string[] }[]
): boolean {
  const urls = collectCatalogProductImageUrls(products);
  return urls.length > 0 && urls.every(isCatalogProductImageCached);
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
      void img.decode?.().finally(() => resolve());
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
 * Warm browser + in-memory cache for catalog product heroes.
 * Safe to call repeatedly; already-loaded URLs resolve immediately.
 */
export function preloadCatalogProductImageUrls(urls: readonly string[]): Promise<void> {
  if (urls.length === 0) {
    return Promise.resolve();
  }
  return Promise.all(urls.map(preloadSingleUrl)).then(() => undefined);
}

export function preloadCatalogProductImages(
  products: readonly { image: string | null; images?: string[] }[]
): Promise<void> {
  return preloadCatalogProductImageUrls(collectCatalogProductImageUrls(products));
}
