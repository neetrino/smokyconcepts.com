/** Height/width ratio treated as a standard pack-shot hero (matches typical catalog assets). */
export const CATALOG_PRODUCT_CARD_STANDARD_ASPECT_MAX = 1.4;

/** Lower bound used by fit and overflow-cap math to avoid over-shrinking small heroes. */
export const CATALOG_PRODUCT_CARD_HERO_MIN_FIT_SCALE = 0.72;

/**
 * Normalization target cap for `object-contain` heroes.
 * Keep aligned with `/products` max hero scale behavior.
 */
export const CATALOG_PRODUCT_CARD_HERO_NORMALIZED_MAX_SCALE = 1.24;

/** Compact/home strip: target visible hero height inside the drawable slot. */
export const CATALOG_PRODUCT_CARD_HERO_NORMALIZED_SLOT_HEIGHT_RATIO = 0.9;

/** `/products` strip: slightly taller target visual height than compact cards. */
export const CATALOG_PRODUCTS_PAGE_HERO_NORMALIZED_SLOT_HEIGHT_RATIO = 0.95;

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
