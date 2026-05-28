export const BAG_ICON_PATH = '/assets/home/icons/bag.svg';
export const CATALOG_BAG_ICON_PATH = '/assets/home/icons/bag-catalog.svg';
export const IMAGE_SIZES = '(max-width: 640px) 160px, (max-width: 768px) 200px, 240px';
export const MAX_PRODUCT_IMAGE_SCALE = 1.28;
export const COMPACT_PRODUCT_IMAGE_UNIFORM_SCALE = 1.14;
export const PRODUCTS_CATALOG_PAGE_DESIRED_IMAGE_SCALE = 0.98;
export const PRODUCTS_CATALOG_PAGE_SAFE_MAX_IMAGE_SCALE = 0.98;
export const COMPACT_PRODUCT_IMAGE_ASPECT_TARGET = 1;
export const MAX_ASPECT_COMPENSATION_SCALE = 1.2;
export const MAX_PNG_OPAQUE_COMPENSATION_SCALE = 1.35;
const PNG_OPAQUE_ALPHA_THRESHOLD = 8;

export const COMPACT_PRODUCT_IMAGE_BOX_CLASS_NAME =
  'relative h-[9.5rem] w-[9.5rem] overflow-hidden sm:h-[11rem] sm:w-[11rem]';
export const PRODUCTS_CATALOG_PAGE_IMAGE_BOX_CLASS_NAME =
  'relative -translate-y-[3.45rem] sm:-translate-y-[3.55rem] lg:-translate-y-[3.25rem] flex h-[12rem] w-[8.5rem] items-end justify-center overflow-hidden rounded-[0.875rem] bg-transparent sm:h-[14.25rem] sm:w-[10rem] lg:h-[12rem] lg:w-[8.75rem]';

/** Home trending — pre–catalog-strip hero frame (centered, no `lg` resize). */
export const TRENDING_SECTION_IMAGE_BOX_CLASS_NAME =
  'relative -translate-y-[2.55rem] sm:-translate-y-[2.75rem] flex h-[12rem] w-[8.5rem] items-center justify-center overflow-hidden rounded-[0.875rem] bg-white sm:h-[14.25rem] sm:w-[10rem]';

export const MAX_IMAGE_DOT_COUNT = 8;

/** Default card elevation (catalog, home, upcoming — same token for consistent look). */
export const CARD_SHADOW_TAILWIND = 'shadow-[0_4px_22.5px_rgba(0,0,0,0.08)]';

function isLikelyPngImageSource(src: string | null): boolean {
  if (!src) {
    return false;
  }
  const normalized = src.trim().toLowerCase();
  return normalized.startsWith('data:image/png') || normalized.includes('.png');
}

export function resolveOpaqueCompensationScale(
  imageElement: HTMLImageElement,
  source: string | null
): number {
  if (typeof document === 'undefined' || !isLikelyPngImageSource(source)) {
    return 1;
  }

  const naturalWidth = imageElement.naturalWidth;
  const naturalHeight = imageElement.naturalHeight;
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return 1;
  }

  const canvas = document.createElement('canvas');
  canvas.width = naturalWidth;
  canvas.height = naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return 1;
  }

  try {
    ctx.drawImage(imageElement, 0, 0, naturalWidth, naturalHeight);
    const pixelData = ctx.getImageData(0, 0, naturalWidth, naturalHeight).data;
    let minX = naturalWidth;
    let minY = naturalHeight;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < naturalHeight; y += 1) {
      for (let x = 0; x < naturalWidth; x += 1) {
        const alpha = pixelData[(y * naturalWidth + x) * 4 + 3];
        if (alpha < PNG_OPAQUE_ALPHA_THRESHOLD) {
          continue;
        }
        if (x < minX) {
          minX = x;
        }
        if (y < minY) {
          minY = y;
        }
        if (x > maxX) {
          maxX = x;
        }
        if (y > maxY) {
          maxY = y;
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      return 1;
    }

    const opaqueHeightRatio = (maxY - minY + 1) / naturalHeight;
    if (opaqueHeightRatio >= 0.99) {
      return 1;
    }

    return Math.min(1 / opaqueHeightRatio, MAX_PNG_OPAQUE_COMPENSATION_SCALE);
  } catch {
    return 1;
  }
}
