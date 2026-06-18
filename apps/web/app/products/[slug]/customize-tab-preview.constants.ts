/** Figma smoky-concept-DEV-MAIN node 1:8769 — customize hero preview tokens. */

/** White gallery card (Rectangle 51, node 1:8770). */
export const CUSTOMIZE_FIGMA_CARD = {
  width: 760,
  height: 625,
  radiusPx: 24,
} as const;

/** Black preview group (node 1:8810) — positions relative to card. */
export const CUSTOMIZE_FIGMA_PREVIEW = {
  width: 450,
  height: 181,
  /** Horizontal center: (760 − 450) / 2 = 155px from card left. */
  leftPx: 155,
  topPx: 222,
  innerInsetXPx: 11,
  innerInsetYPx: 11,
  innerWidth: 428,
  innerHeight: 159,
  outerRadiusPx: 30,
  innerRadiusPx: 18,
  borderWidthPx: 5,
  innerBg: '#111111',
  textSizePx: 40,
  textLineHeightPx: 30,
} as const;

/** Isometric product badge (node 1:8797) — relative to card. */
export const CUSTOMIZE_FIGMA_3D_BADGE = {
  leftPx: 627,
  topPx: 34,
  widthPx: 95,
  heightPx: 142,
} as const;

export const CUSTOMIZE_HERO_PREVIEW_ASSETS = {
  productBadgeSrc: '/assets/product/customize/hero-3d-product-badge.png',
  productLogoSrc: '/assets/product/customize/hero-3d-product-logo.png',
} as const;

/** Card width share — 450 / 760. */
export const CUSTOMIZE_HERO_PREVIEW_WIDTH_RATIO =
  CUSTOMIZE_FIGMA_PREVIEW.width / CUSTOMIZE_FIGMA_CARD.width;

/** Card top offset — 222 / 625. */
export const CUSTOMIZE_HERO_PREVIEW_TOP_RATIO =
  CUSTOMIZE_FIGMA_PREVIEW.topPx / CUSTOMIZE_FIGMA_CARD.height;

/** Card min-height ratio when preview is active — keeps Figma vertical rhythm. */
export const CUSTOMIZE_HERO_CARD_MIN_HEIGHT_RATIO =
  CUSTOMIZE_FIGMA_CARD.height / CUSTOMIZE_FIGMA_CARD.width;

/** 3D badge — top 34/625, right (760−627−95)/760 = 5%. */
export const CUSTOMIZE_HERO_PREVIEW_3D_TOP_RATIO =
  CUSTOMIZE_FIGMA_3D_BADGE.topPx / CUSTOMIZE_FIGMA_CARD.height;

export const CUSTOMIZE_HERO_PREVIEW_3D_RIGHT_RATIO =
  (CUSTOMIZE_FIGMA_CARD.width - CUSTOMIZE_FIGMA_3D_BADGE.leftPx - CUSTOMIZE_FIGMA_3D_BADGE.widthPx) /
  CUSTOMIZE_FIGMA_CARD.width;

export const CUSTOMIZE_HERO_PREVIEW_3D_WIDTH_RATIO =
  CUSTOMIZE_FIGMA_3D_BADGE.widthPx / CUSTOMIZE_FIGMA_CARD.width;

/** Thumbnail strip top — 525 / 625 (Figma node 1:8771). */
export const CUSTOMIZE_HERO_THUMBNAIL_TOP_RATIO = 525 / CUSTOMIZE_FIGMA_CARD.height;

/** Outer dashed frame — Figma 1:8813. Radius applied inline (6.667cqw). */
export const CUSTOMIZE_HERO_PREVIEW_FRAME_CLASS =
  'pointer-events-none absolute inset-0 border-dashed border-black';

/** Inner black body — Figma 1:8811. */
export const CUSTOMIZE_HERO_PREVIEW_BODY_CLASS =
  'absolute flex items-center justify-center overflow-hidden bg-[#111]';

/** White text on black body — Figma 1:8812. Size scales with preview width via cqw. */
export const CUSTOMIZE_HERO_PREVIEW_TEXT_CLASS = [
  'w-full max-w-full break-words text-center font-normal tracking-normal text-white',
  '[&_*]:text-white',
  '[&_b]:font-extrabold [&_em]:italic [&_i]:italic [&_strong]:font-extrabold [&_u]:underline',
].join(' ');

/** Inline styles derived from Figma — applied on the preview root (container-type: inline-size). */
export const CUSTOMIZE_HERO_PREVIEW_INNER_STYLE = {
  top: `${(CUSTOMIZE_FIGMA_PREVIEW.innerInsetYPx / CUSTOMIZE_FIGMA_PREVIEW.height) * 100}%`,
  right: `${(CUSTOMIZE_FIGMA_PREVIEW.innerInsetXPx / CUSTOMIZE_FIGMA_PREVIEW.width) * 100}%`,
  bottom: `${(CUSTOMIZE_FIGMA_PREVIEW.innerInsetYPx / CUSTOMIZE_FIGMA_PREVIEW.height) * 100}%`,
  left: `${(CUSTOMIZE_FIGMA_PREVIEW.innerInsetXPx / CUSTOMIZE_FIGMA_PREVIEW.width) * 100}%`,
  borderRadius: `${(CUSTOMIZE_FIGMA_PREVIEW.innerRadiusPx / CUSTOMIZE_FIGMA_PREVIEW.width) * 100}cqw`,
} as const;

export const CUSTOMIZE_HERO_PREVIEW_FRAME_STYLE = {
  borderRadius: `${(CUSTOMIZE_FIGMA_PREVIEW.outerRadiusPx / CUSTOMIZE_FIGMA_PREVIEW.width) * 100}cqw`,
  borderWidth: `clamp(2.5px, ${(CUSTOMIZE_FIGMA_PREVIEW.borderWidthPx / CUSTOMIZE_FIGMA_PREVIEW.width) * 100}cqw, ${CUSTOMIZE_FIGMA_PREVIEW.borderWidthPx}px)`,
} as const;

export const CUSTOMIZE_HERO_PREVIEW_TEXT_STYLE = {
  fontSize: `${(CUSTOMIZE_FIGMA_PREVIEW.textSizePx / CUSTOMIZE_FIGMA_PREVIEW.width) * 100}cqw`,
  lineHeight: CUSTOMIZE_FIGMA_PREVIEW.textLineHeightPx / CUSTOMIZE_FIGMA_PREVIEW.textSizePx,
} as const;
