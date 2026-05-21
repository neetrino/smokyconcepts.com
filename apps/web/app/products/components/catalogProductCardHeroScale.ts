/** Height/width ratio treated as a standard pack-shot hero (matches typical catalog assets). */
export const CATALOG_PRODUCT_CARD_STANDARD_ASPECT_MAX = 1.4;

const CATALOG_PRODUCT_CARD_HERO_MIN_FIT_SCALE = 0.72;

export interface CatalogProductCardHeroScaleResult {
  scale: number;
  /** When true, clip the image frame so scaled heroes do not cover title/price. */
  constrainOverflow: boolean;
}

/**
 * Keeps the designed hero scale for standard images; reduces scale only for taller assets.
 */
export function resolveCatalogProductCardHeroScale(
  naturalWidth: number,
  naturalHeight: number,
  targetScale: number
): CatalogProductCardHeroScaleResult {
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return { scale: targetScale, constrainOverflow: false };
  }

  const aspect = naturalHeight / naturalWidth;
  if (aspect <= CATALOG_PRODUCT_CARD_STANDARD_ASPECT_MAX) {
    return { scale: targetScale, constrainOverflow: false };
  }

  const scale = Math.max(
    CATALOG_PRODUCT_CARD_HERO_MIN_FIT_SCALE,
    targetScale * (CATALOG_PRODUCT_CARD_STANDARD_ASPECT_MAX / aspect)
  );

  return { scale, constrainOverflow: true };
}
