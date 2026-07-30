import type { LanguageCode } from './language';

/** sessionStorage key prefix for PDP related-products lists. */
const RELATED_PRODUCTS_CACHE_KEY_PREFIX = 'related-products:v1:';

/** How long a cached related list is considered fresh (30 minutes). */
const RELATED_PRODUCTS_CACHE_TTL_MS = 30 * 60 * 1000;

export interface RelatedProductCacheItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  originalPrice?: number | null;
  compareAtPrice: number | null;
  discountPercent?: number | null;
  image: string | null;
  images?: string[];
  inStock: boolean;
  brand?: {
    id: string;
    name: string;
  } | null;
  categories?: Array<{
    id: string;
    slug: string;
    title: string;
  }>;
  skus?: string[];
  defaultVariantId?: string | null;
  defaultVariantStock?: number;
  defaultSku?: string;
  variants?: Array<{
    options?: Array<{
      key: string;
      value: string;
    }>;
  }>;
}

interface RelatedProductsCacheEntry {
  savedAt: number;
  products: RelatedProductCacheItem[];
}

const memoryCache = new Map<string, RelatedProductsCacheEntry>();

function buildRelatedProductsCacheKey(
  categorySlug: string | undefined,
  language: LanguageCode
): string {
  return `${RELATED_PRODUCTS_CACHE_KEY_PREFIX}${language}:${categorySlug ?? 'all'}`;
}

function isEntryFresh(entry: RelatedProductsCacheEntry): boolean {
  return Date.now() - entry.savedAt < RELATED_PRODUCTS_CACHE_TTL_MS;
}

function readSessionEntry(key: string): RelatedProductsCacheEntry | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as RelatedProductsCacheEntry;
    if (!parsed || !Array.isArray(parsed.products) || typeof parsed.savedAt !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeSessionEntry(key: string, entry: RelatedProductsCacheEntry): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Quota / private mode — memory cache still works for the session.
  }
}

/**
 * Returns a fresh related-products list for category + language, or null.
 * Survives full page reload via sessionStorage; also kept in memory.
 */
export function getRelatedProductsCache(
  categorySlug: string | undefined,
  language: LanguageCode
): RelatedProductCacheItem[] | null {
  const key = buildRelatedProductsCacheKey(categorySlug, language);
  const memoryEntry = memoryCache.get(key);
  if (memoryEntry && isEntryFresh(memoryEntry) && memoryEntry.products.length > 0) {
    return memoryEntry.products;
  }

  const sessionEntry = readSessionEntry(key);
  if (!sessionEntry || !isEntryFresh(sessionEntry) || sessionEntry.products.length === 0) {
    return null;
  }

  memoryCache.set(key, sessionEntry);
  return sessionEntry.products;
}

/**
 * Persists related products for the category + language (reload-safe).
 */
export function setRelatedProductsCache(
  categorySlug: string | undefined,
  language: LanguageCode,
  products: RelatedProductCacheItem[]
): void {
  if (products.length === 0) {
    return;
  }

  const key = buildRelatedProductsCacheKey(categorySlug, language);
  const entry: RelatedProductsCacheEntry = {
    savedAt: Date.now(),
    products,
  };
  memoryCache.set(key, entry);
  writeSessionEntry(key, entry);
}
