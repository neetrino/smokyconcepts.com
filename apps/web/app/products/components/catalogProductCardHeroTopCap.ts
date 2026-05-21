import {
  CATALOG_PRODUCT_CARD_HERO_MAX_TOP_OVERFLOW_PX,
  getCatalogProductsPageHeroMaxScale,
} from './catalogProductCardHeroBoundary';
import {
  CATALOG_PRODUCT_CARD_HERO_MIN_FIT_SCALE,
  CATALOG_PRODUCT_CARD_HERO_NORMALIZED_MAX_SCALE,
  CATALOG_PRODUCT_CARD_HERO_NORMALIZED_SLOT_HEIGHT_RATIO,
  CATALOG_PRODUCTS_PAGE_HERO_NORMALIZED_SLOT_HEIGHT_RATIO,
} from './catalogProductCardHeroScale';
import { CATALOG_PRODUCT_CARD_REM_PX } from './catalogProductCardImageSlot';

export type CatalogProductHeroViewportBand = 'mobile' | 'sm' | 'lg';

/** Keep in sync with compact {@link ProductsCatalogCard} inner frame (`h-[13.75rem]` / `sm:h-[16.5rem]`). */
const COMPACT_HERO_FRAME_INNER_REM_BY_BAND: Record<CatalogProductHeroViewportBand, number> = {
  mobile: 13.75,
  sm: 16.5,
  lg: 16.5,
};

/** Keep in sync with {@link CATALOG_PRODUCTS_PAGE_HERO_FRAME_HEIGHT_CLASS_NAME}. */
const PRODUCTS_CATALOG_HERO_FRAME_INNER_REM_BY_BAND: Record<CatalogProductHeroViewportBand, number> = {
  mobile: 19.25,
  sm: 22,
  lg: 22,
};

/** Modest float above the drawable frame baseline (not the white card top). */
export const CATALOG_PRODUCT_CARD_HERO_MAX_OVERFLOW_ABOVE_FRAME_PX = 32;

export type CatalogProductHeroStripLayout = 'homeCompact' | 'productsCatalog';

const CARD_TOP_PADDING_REM_BY_BAND: Record<CatalogProductHeroViewportBand, number> = {
  mobile: 2.75,
  sm: 4,
  lg: 4.5,
};

/** Keep in sync with {@link CATALOG_PRODUCTS_PAGE_CARD_HERO_PULL_UP_CLASS_NAME}. */
const HERO_PULL_UP_REM_BY_BAND: Record<CatalogProductHeroViewportBand, number> = {
  mobile: 7,
  sm: 5.75,
  lg: 6.25,
};

/** Keep in sync with {@link CATALOG_PRODUCTS_PAGE_HERO_BOTTOM_SQUEEZE_CLASS_NAME}. */
const HERO_BOTTOM_SQUEEZE_REM_BY_BAND: Record<CatalogProductHeroViewportBand, number> = {
  mobile: 1.5,
  sm: 2.25,
  lg: 2.75,
};

/** Keep in sync with {@link CATALOG_PRODUCTS_PAGE_IMAGE_FRAME_CLASS_NAME} translate. */
const HERO_FRAME_TRANSLATE_UP_PX_BY_BAND: Record<CatalogProductHeroViewportBand, number> = {
  mobile: 8,
  sm: 4,
  lg: 6,
};

/**
 * Layout bleed above the white card top (pull-up minus padding + frame translate).
 */
export function getCatalogProductsPageStructuralOverflowAboveCardPx(
  band: CatalogProductHeroViewportBand
): number {
  const remPx = CATALOG_PRODUCT_CARD_REM_PX;
  const paddingPx = CARD_TOP_PADDING_REM_BY_BAND[band] * remPx;
  const pullUpPx = HERO_PULL_UP_REM_BY_BAND[band] * remPx;
  return Math.max(0, pullUpPx - paddingPx) + HERO_FRAME_TRANSLATE_UP_PX_BY_BAND[band];
}

const HOME_COMPACT_PULL_UP_REM_BY_BAND: Record<CatalogProductHeroViewportBand, number> = {
  mobile: 5.125,
  sm: 6.25,
  lg: 6.25,
};

const HOME_COMPACT_CARD_TOP_PADDING_REM_BY_BAND: Record<CatalogProductHeroViewportBand, number> = {
  mobile: 0.5,
  sm: 0.625,
  lg: 0.625,
};

/** Matches {@link CATALOG_PRODUCT_CARD_MOBILE_IMAGE_FRAME_CLASS_NAME} `max-sm:translate-y-5`. */
const HOME_COMPACT_FRAME_TRANSLATE_UP_PX_BY_BAND: Record<CatalogProductHeroViewportBand, number> = {
  mobile: 20,
  sm: 16,
  lg: 24,
};

/**
 * Structural bleed above the card top for hero top-cap math (home vs `/products` strip).
 */
export function getCatalogProductCardStructuralOverflowAboveCardPx(
  band: CatalogProductHeroViewportBand,
  layout: CatalogProductHeroStripLayout
): number {
  if (layout === 'productsCatalog') {
    return getCatalogProductsPageStructuralOverflowAboveCardPx(band);
  }

  const remPx = CATALOG_PRODUCT_CARD_REM_PX;
  const pullUpPx = HOME_COMPACT_PULL_UP_REM_BY_BAND[band] * remPx;
  const paddingPx = HOME_COMPACT_CARD_TOP_PADDING_REM_BY_BAND[band] * remPx;

  return (
    Math.max(0, pullUpPx - paddingPx) + HOME_COMPACT_FRAME_TRANSLATE_UP_PX_BY_BAND[band]
  );
}

export function getCompactHeroDrawableHeightPx(
  band: CatalogProductHeroViewportBand,
  applyBottomSqueeze: boolean,
  stripLayout: CatalogProductHeroStripLayout = 'homeCompact'
): number {
  const frameRemByBand =
    stripLayout === 'productsCatalog'
      ? PRODUCTS_CATALOG_HERO_FRAME_INNER_REM_BY_BAND
      : COMPACT_HERO_FRAME_INNER_REM_BY_BAND;
  const framePx = frameRemByBand[band] * CATALOG_PRODUCT_CARD_REM_PX;
  const squeezePx = applyBottomSqueeze
    ? HERO_BOTTOM_SQUEEZE_REM_BY_BAND[band] * CATALOG_PRODUCT_CARD_REM_PX
    : 0;

  return Math.max(0, framePx - squeezePx);
}

/** @deprecated Use {@link getCompactHeroDrawableHeightPx}. */
export function getCatalogProductsPageHeroFrameHeightPx(
  band: CatalogProductHeroViewportBand
): number {
  return getCompactHeroDrawableHeightPx(band, true, 'productsCatalog');
}

/** Image layout area inside the hero frame (optionally excludes bottom squeeze padding). */
export function measureCatalogProductHeroFrameSize(
  element: HTMLElement,
  band: CatalogProductHeroViewportBand,
  applyBottomSqueeze: boolean
): { width: number; height: number } {
  const squeezePx = applyBottomSqueeze
    ? HERO_BOTTOM_SQUEEZE_REM_BY_BAND[band] * CATALOG_PRODUCT_CARD_REM_PX
    : 0;

  return {
    width: element.clientWidth,
    height: Math.max(0, element.clientHeight - squeezePx),
  };
}

function getCatalogProductHeroContainDimensions(
  frameHeightPx: number,
  frameWidthPx: number,
  naturalWidth: number,
  naturalHeight: number
): { containWidth: number; containHeight: number } {
  if (naturalWidth <= 0 || naturalHeight <= 0 || frameWidthPx <= 0 || frameHeightPx <= 0) {
    return { containWidth: 0, containHeight: 0 };
  }

  return {
    containWidth: Math.min(frameWidthPx, (frameHeightPx * naturalWidth) / naturalHeight),
    containHeight: Math.min(frameHeightPx, (frameWidthPx * naturalHeight) / naturalWidth),
  };
}

/**
 * Caps scale so `object-contain` + transform does not spill past the drawable frame
 * (width-limited assets cannot scale past 1 without horizontal overflow).
 */
export function resolveCatalogProductCardHeroContainFitScale(
  targetScale: number,
  frameHeightPx: number,
  frameWidthPx: number,
  naturalWidth: number,
  naturalHeight: number,
  maxOverflowAboveFramePx: number = CATALOG_PRODUCT_CARD_HERO_MAX_OVERFLOW_ABOVE_FRAME_PX
): number {
  const { containWidth, containHeight } = getCatalogProductHeroContainDimensions(
    frameHeightPx,
    frameWidthPx,
    naturalWidth,
    naturalHeight
  );

  if (containWidth <= 0 || containHeight <= 0) {
    return targetScale;
  }

  const maxScaleByWidth = frameWidthPx / containWidth;
  const maxScaleByHeight = (frameHeightPx + maxOverflowAboveFramePx) / containHeight;

  let scale = targetScale;

  if (targetScale > maxScaleByWidth) {
    scale = Math.min(scale, maxScaleByWidth);
  }

  if (targetScale > maxScaleByHeight) {
    scale = Math.min(scale, maxScaleByHeight);
  }

  return scale;
}

export function getCatalogProductHeroViewportBand(isSmUp: boolean): CatalogProductHeroViewportBand {
  if (!isSmUp) {
    return 'mobile';
  }
  if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
    return 'lg';
  }
  return 'sm';
}

/**
 * Shrinks {@link targetScale} only when the scaled hero extends past
 * {@link maxTopOverflowPx} above the white card (layout-only bleed does not trigger cap).
 */
export function resolveCatalogProductCardHeroTopCapScale(
  targetScale: number,
  frameHeightPx: number,
  frameWidthPx: number,
  naturalWidth: number,
  naturalHeight: number,
  structuralOverflowAboveCardPx: number,
  maxTopOverflowPx: number = CATALOG_PRODUCT_CARD_HERO_MAX_TOP_OVERFLOW_PX
): number {
  if (naturalWidth <= 0 || naturalHeight <= 0 || frameWidthPx <= 0 || frameHeightPx <= 0) {
    return targetScale;
  }

  const { containHeight } = getCatalogProductHeroContainDimensions(
    frameHeightPx,
    frameWidthPx,
    naturalWidth,
    naturalHeight
  );
  const scaledHeight = containHeight * targetScale;
  const imageOverflowAboveFrame = Math.max(0, scaledHeight - frameHeightPx);

  if (imageOverflowAboveFrame <= 0) {
    return targetScale;
  }

  const bleedAboveCardTop = structuralOverflowAboveCardPx + imageOverflowAboveFrame;

  if (bleedAboveCardTop <= maxTopOverflowPx) {
    return targetScale;
  }

  const excessBleed = bleedAboveCardTop - maxTopOverflowPx;
  const maxScaledHeight = frameHeightPx + imageOverflowAboveFrame - excessBleed;

  if (scaledHeight <= 0 || maxScaledHeight <= 0) {
    return targetScale;
  }

  const cappedScale = targetScale * (maxScaledHeight / scaledHeight);
  return Math.max(CATALOG_PRODUCT_CARD_HERO_MIN_FIT_SCALE, cappedScale);
}

/**
 * Per-image scale so `object-contain` heroes land near a shared visual height in the slot.
 */
export function resolveCatalogProductCardHeroNormalizedScale(
  naturalWidth: number,
  naturalHeight: number,
  slotHeightPx: number,
  slotWidthPx: number,
  maxScale: number = CATALOG_PRODUCT_CARD_HERO_NORMALIZED_MAX_SCALE,
  heightRatio: number = CATALOG_PRODUCT_CARD_HERO_NORMALIZED_SLOT_HEIGHT_RATIO
): number {
  const { containHeight } = getCatalogProductHeroContainDimensions(
    slotHeightPx,
    slotWidthPx,
    naturalWidth,
    naturalHeight
  );

  if (containHeight <= 0) {
    return maxScale;
  }

  const desiredScaledHeight = slotHeightPx * heightRatio;
  const scale = desiredScaledHeight / containHeight;

  return Math.max(
    CATALOG_PRODUCT_CARD_HERO_MIN_FIT_SCALE,
    Math.min(maxScale, scale)
  );
}

/**
 * Normalized hero height, contain fit, then top-overflow cap.
 */
export function resolveCatalogProductCardHeroDisplayScale(
  naturalWidth: number,
  naturalHeight: number,
  targetScale: number,
  frameHeightPx: number,
  frameWidthPx: number,
  structuralOverflowAboveCardPx: number,
  maxHeroScale: number = getCatalogProductsPageHeroMaxScale(),
  maxTopOverflowPx: number = CATALOG_PRODUCT_CARD_HERO_MAX_TOP_OVERFLOW_PX,
  normalizedSlotHeightRatio: number = CATALOG_PRODUCT_CARD_HERO_NORMALIZED_SLOT_HEIGHT_RATIO
): number {
  const normalizationMaxScale = Math.max(
    maxHeroScale,
    targetScale,
    CATALOG_PRODUCT_CARD_HERO_NORMALIZED_MAX_SCALE
  );

  const heightNormalized = resolveCatalogProductCardHeroNormalizedScale(
    naturalWidth,
    naturalHeight,
    frameHeightPx,
    frameWidthPx,
    normalizationMaxScale,
    normalizedSlotHeightRatio
  );

  const containFit = resolveCatalogProductCardHeroContainFitScale(
    heightNormalized,
    frameHeightPx,
    frameWidthPx,
    naturalWidth,
    naturalHeight
  );

  return resolveCatalogProductCardHeroTopCapScale(
    containFit,
    frameHeightPx,
    frameWidthPx,
    naturalWidth,
    naturalHeight,
    structuralOverflowAboveCardPx,
    maxTopOverflowPx
  );
}
