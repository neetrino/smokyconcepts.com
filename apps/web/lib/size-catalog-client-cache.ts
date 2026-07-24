import { apiClient } from './api-client';
import { preloadSizeCatalogCategories } from './size-catalog-image-cache';
import type { SizeCatalogCategoryDto } from '@/lib/types/size-catalog';

let cachedCategories: SizeCatalogCategoryDto[] | null = null;
let inflightLoad: Promise<SizeCatalogCategoryDto[]> | null = null;

async function fetchAndCacheSizeCatalogCategories(): Promise<SizeCatalogCategoryDto[]> {
  try {
    const res = await apiClient.get<{ data: SizeCatalogCategoryDto[] }>('/api/v1/size-catalog');
    const data = Array.isArray(res.data) ? res.data : [];
    cachedCategories = data;
    void preloadSizeCatalogCategories(data);
    return data;
  } catch {
    cachedCategories = [];
    return [];
  }
}

/**
 * Fire-and-forget warm-up (e.g. home “Check Availability” section).
 */
export function prefetchSizeCatalogCategories(): void {
  if (cachedCategories !== null || inflightLoad !== null) {
    return;
  }
  inflightLoad = fetchAndCacheSizeCatalogCategories().finally(() => {
    inflightLoad = null;
  });
}

/**
 * Loads published size catalog; reuses cache or in-flight request.
 */
export function loadSizeCatalogCategories(): Promise<SizeCatalogCategoryDto[]> {
  if (cachedCategories !== null) {
    return Promise.resolve(cachedCategories);
  }
  if (inflightLoad !== null) {
    return inflightLoad;
  }
  inflightLoad = fetchAndCacheSizeCatalogCategories().finally(() => {
    inflightLoad = null;
  });
  return inflightLoad;
}
