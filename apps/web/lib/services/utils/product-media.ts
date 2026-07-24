import {
  normalizeUrlForComparison,
  processImageUrl,
} from './image-utils';

export type ProductMediaItem = {
  url: string;
  isFeatured?: boolean;
};

type MediaUrlInput = string | null | undefined | { url?: string; src?: string; value?: string };

type MediaRecord = {
  url?: string;
  src?: string;
  value?: string;
  isFeatured?: boolean;
};

function readMediaRecord(item: unknown): MediaRecord | null {
  if (typeof item === 'string') {
    return { url: item };
  }
  if (typeof item === 'object' && item !== null) {
    return item as MediaRecord;
  }
  return null;
}

/**
 * Re-applies featured flag after URL-only cleanup steps.
 */
export function mergeProductMediaMetadata(
  cleanedUrls: string[],
  originalItems: Array<string | ProductMediaItem | MediaUrlInput>
): ProductMediaItem[] {
  const flagsByUrl = new Map<string, Pick<ProductMediaItem, 'isFeatured'>>();

  for (const item of originalItems) {
    const record = readMediaRecord(item);
    if (!record) {
      continue;
    }
    const url = processImageUrl(record);
    if (!url) {
      continue;
    }
    flagsByUrl.set(normalizeUrlForComparison(url), {
      isFeatured: record.isFeatured === true,
    });
  }

  return cleanedUrls.map((url) => {
    const flags = flagsByUrl.get(normalizeUrlForComparison(url));
    const mediaItem: ProductMediaItem = { url };
    if (flags?.isFeatured) {
      mediaItem.isFeatured = true;
    }
    return mediaItem;
  });
}

/**
 * Normalizes product media for DB storage while preserving featured flag.
 */
export function normalizeProductMediaForStorage(
  items: Array<string | ProductMediaItem | MediaUrlInput>
): ProductMediaItem[] {
  const result: ProductMediaItem[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const record = readMediaRecord(item);
    if (!record) {
      continue;
    }

    const url = processImageUrl(record);
    if (!url) {
      continue;
    }

    const normalized = normalizeUrlForComparison(url);
    if (seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);

    const mediaItem: ProductMediaItem = { url };
    if (record.isFeatured === true) {
      mediaItem.isFeatured = true;
    }
    result.push(mediaItem);
  }

  return result;
}
