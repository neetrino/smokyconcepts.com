import { CATALOG_PRODUCT_CARD_HERO_MIN_FIT_SCALE } from './catalogProductCardHeroScale';

/** Max pixels the hero may extend above the white card top — also raises max hero scale (see {@link getCatalogProductsPageHeroMaxScale}). */
export const CATALOG_PRODUCT_CARD_HERO_MAX_TOP_OVERFLOW_PX = 110;

/** Overflow px paired with {@link CATALOG_PRODUCTS_PAGE_HERO_MAX_SCALE_AT_BASE}. */
export const CATALOG_PRODUCTS_PAGE_HERO_OVERFLOW_SCALE_BASELINE_PX = 20;

/** Default max `transform: scale()` on `/products` at {@link CATALOG_PRODUCTS_PAGE_HERO_OVERFLOW_SCALE_BASELINE_PX}. */
export const CATALOG_PRODUCTS_PAGE_HERO_MAX_SCALE_AT_BASE = 1.24;

/** Hard ceiling for `/products` hero scale regardless of overflow px. */
export const CATALOG_PRODUCTS_PAGE_HERO_MAX_SCALE_ABSOLUTE = 1.36;

/** Hero scale growth per overflow px above {@link CATALOG_PRODUCTS_PAGE_HERO_OVERFLOW_SCALE_BASELINE_PX}. */
export const CATALOG_PRODUCTS_PAGE_HERO_SCALE_GROWTH_PER_OVERFLOW_PX = 0.001;

/** Target scale sits slightly under max so top-cap can still shrink outliers. */
export const CATALOG_PRODUCTS_PAGE_HERO_TARGET_SCALE_INSET = 0;

/**
 * Max hero scale on `/products` — grows with {@link CATALOG_PRODUCT_CARD_HERO_MAX_TOP_OVERFLOW_PX}.
 */
export function getCatalogProductsPageHeroMaxScale(
  maxTopOverflowPx: number = CATALOG_PRODUCT_CARD_HERO_MAX_TOP_OVERFLOW_PX
): number {
  const extraPx = Math.max(0, maxTopOverflowPx - CATALOG_PRODUCTS_PAGE_HERO_OVERFLOW_SCALE_BASELINE_PX);
  const scale =
    CATALOG_PRODUCTS_PAGE_HERO_MAX_SCALE_AT_BASE +
    extraPx * CATALOG_PRODUCTS_PAGE_HERO_SCALE_GROWTH_PER_OVERFLOW_PX;

  return Math.min(CATALOG_PRODUCTS_PAGE_HERO_MAX_SCALE_ABSOLUTE, scale);
}

/**
 * Base hero scale on `/products` before per-card boost and top-cap shrink.
 */
export function getCatalogProductsPageHeroTargetScale(
  imageNudgeDown: boolean,
  maxTopOverflowPx: number = CATALOG_PRODUCT_CARD_HERO_MAX_TOP_OVERFLOW_PX
): number {
  const maxScale = getCatalogProductsPageHeroMaxScale(maxTopOverflowPx);

  if (imageNudgeDown) {
    return Math.min(1.05, maxScale);
  }

  return Math.max(
    CATALOG_PRODUCT_CARD_HERO_MIN_FIT_SCALE,
    maxScale - CATALOG_PRODUCTS_PAGE_HERO_TARGET_SCALE_INSET
  );
}

/** Shared tap target — transparent overlay, no visual chrome. */
const CATALOG_PRODUCT_CARD_HERO_TAP_ZONE_BASE_CLASS_NAME =
  'pointer-events-auto absolute inset-x-0 z-40 cursor-pointer border-0 bg-transparent p-0';
/**
 * Matches {@link CATALOG_PRODUCTS_PAGE_CARD_HERO_PULL_UP_CLASS_NAME} — hit layer includes pack overflow above the card.
 */
export const CATALOG_PRODUCTS_PAGE_HERO_GALLERY_HIT_LAYER_CLASS_NAME =
  'pointer-events-none absolute inset-x-0 bottom-0 -top-[7rem] z-30 sm:-top-[5.75rem] lg:-top-[6.25rem]';

/** Previous image — upper band (includes area above the white card top). */
export const CATALOG_PRODUCT_CARD_HERO_TOP_TAP_ZONE_CLASS_NAME = `${CATALOG_PRODUCT_CARD_HERO_TAP_ZONE_BASE_CLASS_NAME} top-0 h-[42%]`;

/** Next image — lower band above the pagination dot row. */
export const CATALOG_PRODUCT_CARD_HERO_BOTTOM_TAP_ZONE_CLASS_NAME = `${CATALOG_PRODUCT_CARD_HERO_TAP_ZONE_BASE_CLASS_NAME} bottom-0 h-[38%]`;

/**
 * Bottom inset — matches {@link CATALOG_PRODUCTS_PAGE_CARD_DETAILS_OFFSET_CLASS_NAME}
 * so the hero baseline stays above the in-card image dots (squeeze, not clip).
 */
export const CATALOG_PRODUCTS_PAGE_HERO_BOTTOM_SQUEEZE_CLASS_NAME =
  'pb-[1.5rem] sm:pb-[2.25rem] lg:pb-[2.75rem]';

/**
 * Must stay `overflow-visible` — pairing `overflow-x-hidden` with `overflow-y-visible`
 * forces both axes to clip in browsers.
 */
export const CATALOG_PRODUCTS_PAGE_HERO_BOUNDARY_FRAME_CLASS_NAME =
  'flex min-h-0 w-full flex-col justify-end overflow-visible';

/** Full card width — hero background aligns with card left/right edges. */
export const CATALOG_PRODUCTS_PAGE_HERO_BOUNDARY_MAX_WIDTH_CLASS_NAME = 'w-full max-w-full';

/** Width constraint; vertical overflow paints into strip padding (not clipped at top). */
export const CATALOG_PRODUCTS_PAGE_HERO_BOUNDARY_CLIP_CLASS_NAME =
  `relative shrink-0 overflow-visible ${CATALOG_PRODUCTS_PAGE_HERO_BOUNDARY_MAX_WIDTH_CLASS_NAME}`;

/** Outer hero wrapper on `/products` — must stay visible so pull-up is not clipped. */
export const CATALOG_PRODUCTS_PAGE_HERO_WRAPPER_OVERFLOW_CLASS_NAME = 'overflow-visible';

/**
 * `/products` strip — frame classes that keep the hero baseline above in-card image dots.
 * Top bleed above the white card is capped at {@link CATALOG_PRODUCT_CARD_HERO_MAX_TOP_OVERFLOW_PX} via layout.
 */
export function getCatalogProductsPageHeroImageFrameClassName(
  extraFrameClassName?: string
): string {
  return [
    CATALOG_PRODUCTS_PAGE_HERO_BOUNDARY_CLIP_CLASS_NAME,
    CATALOG_PRODUCTS_PAGE_HERO_BOUNDARY_FRAME_CLASS_NAME,
    CATALOG_PRODUCTS_PAGE_HERO_BOTTOM_SQUEEZE_CLASS_NAME,
    extraFrameClassName ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * Cycles catalog card gallery index with wrap-around.
 */
export function getNextCatalogProductImageIndex(
  currentIndex: number,
  totalImages: number,
  direction: -1 | 1
): number {
  if (totalImages <= 0) {
    return 0;
  }
  return (currentIndex + direction + totalImages) % totalImages;
}
