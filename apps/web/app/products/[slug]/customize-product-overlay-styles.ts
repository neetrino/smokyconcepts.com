/** Shared classes for PDP hero + checkout preview: “glass” text on product image. */

export const CUSTOMIZE_TEXT_ON_IMAGE_MAX_WIDTH_CLASS = 'max-w-[min(92%,220px)] sm:max-w-[280px]';

export const CUSTOMIZE_OVERLAY_IMAGE_ANCHOR_CLASS =
  'pointer-events-none absolute inset-x-0 bottom-[18%] z-10 flex justify-center px-2 sm:bottom-[22%]';

/** No upward (-y) shadow — it reads as a thin black line above glyphs. */
const CUSTOMIZE_ON_IMAGE_GLASS_TEXT_SHADOW_CLASS =
  '[text-shadow:0_1px_0_rgba(255,255,255,0.32),0_2px_12px_rgba(0,0,0,0.28),0_0_1px_rgba(255,255,255,0.12)]';

export const CUSTOMIZE_ON_IMAGE_TEXT_CLASS = [
  CUSTOMIZE_TEXT_ON_IMAGE_MAX_WIDTH_CLASS,
  'px-3 py-2 text-center text-sm font-normal leading-snug tracking-[0.04em] text-gray-500',
  CUSTOMIZE_ON_IMAGE_GLASS_TEXT_SHADOW_CLASS,
  '[&_*]:text-inherit',
  'sm:px-4 sm:py-2.5 sm:text-base',
  '[&_b]:font-extrabold [&_em]:italic [&_i]:italic [&_strong]:font-extrabold [&_u]:underline',
].join(' ');
