import {
  normalizeUrlForComparison,
  processImageUrl,
} from './image-utils';

export type ProductMediaItem = {
  url: string;
  isFeatured?: boolean;
  isCustomizeOverlay?: boolean;
};

type MediaUrlInput = string | null | undefined | { url?: string; src?: string; value?: string };

type MediaRecord = {
  url?: string;
  src?: string;
  value?: string;
  isFeatured?: boolean;
  isCustomizeOverlay?: boolean;
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
 * Re-applies featured / customize flags after URL-only cleanup steps.
 */
export function mergeProductMediaMetadata(
  cleanedUrls: string[],
  originalItems: Array<string | ProductMediaItem | MediaUrlInput>
): ProductMediaItem[] {
  const flagsByUrl = new Map<string, Pick<ProductMediaItem, 'isFeatured' | 'isCustomizeOverlay'>>();

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
      isCustomizeOverlay: record.isCustomizeOverlay === true,
    });
  }

  return cleanedUrls.map((url) => {
    const flags = flagsByUrl.get(normalizeUrlForComparison(url));
    const mediaItem: ProductMediaItem = { url };
    if (flags?.isFeatured) {
      mediaItem.isFeatured = true;
    }
    if (flags?.isCustomizeOverlay) {
      mediaItem.isCustomizeOverlay = true;
    }
    return mediaItem;
  });
}

/**
 * Normalizes product media for DB storage while preserving featured / customize flags.
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
    if (record.isCustomizeOverlay === true) {
      mediaItem.isCustomizeOverlay = true;
    }
    result.push(mediaItem);
  }

  return result;
}

/**
 * Returns the URL marked for customize text overlay, if any.
 */
export function extractCustomizeOverlayImageUrl(media: unknown): string | null {
  if (!Array.isArray(media)) {
    return null;
  }

  for (const item of media) {
    const record = readMediaRecord(item);
    if (!record || record.isCustomizeOverlay !== true) {
      continue;
    }
    const url = processImageUrl(record);
    if (url) {
      return url;
    }
  }

  return null;
}

/**
 * Finds index in a URL list that matches the customize-overlay media item.
 */
export function findCustomizeOverlayImageIndex(
  media: unknown,
  imageUrls: string[]
): number | null {
  const overlayUrl = extractCustomizeOverlayImageUrl(media);
  if (!overlayUrl) {
    return null;
  }

  const target = normalizeUrlForComparison(overlayUrl);
  const index = imageUrls.findIndex((url) => normalizeUrlForComparison(url) === target);
  return index >= 0 ? index : null;
}
