/**
 * Gallery frame geometry shared by {@link ProductImageGallery} and the PDP card
 * preview, so the instant shell and the live gallery occupy identical boxes.
 */

/** Space below the site header before the white card (pairs with {@link HERO_PULL_ABOVE_CARD}). */
export const GALLERY_TOP_OFFSET_CLASSES = 'pt-5 sm:pt-14 lg:pt-16';

/**
 * Pulls the product hero slightly above the card top.
 * Kept for customize preview too so the white card height matches the description tab.
 * The 3D badge is positioned on the card (not the pulled hero) so it stays inside.
 * Pairs with {@link GALLERY_TOP_OFFSET_CLASSES} for header clearance.
 */
export const HERO_PULL_ABOVE_CARD = 'max-sm:-mt-7 sm:-mt-12 lg:-mt-14';

/** Mobile hero height (px) — fits typical phone viewport without clipping below the fold. */
const MOBILE_HERO_IMAGE_HEIGHT_CLASS = 'h-[270px]';

/** Fixed hero frame — small sources scale up, large sources scale down (no crop). */
export const HERO_IMAGE_BOX_SIZE_CLASSES = `${MOBILE_HERO_IMAGE_HEIGHT_CLASS} w-full max-w-full shrink-0 sm:h-[440px] lg:h-[480px]`;

/** Compact thumbnail frame — fixed square, does not stretch with flex. */
export const THUMBNAIL_IMAGE_BOX_SIZE_CLASSES = 'size-[36px] shrink-0 sm:size-[40px]';

/**
 * Fills the fixed hero/thumb frame without layout jump from intrinsic image size.
 * `absolute inset-0` keeps the CSS box stable before decode; object-contain scales the bitmap.
 */
export const GALLERY_IMAGE_FIT_CLASSES = 'absolute inset-0 size-full object-contain object-center';

/** Vertical rhythm between hero and thumbnail strip inside the card. */
export const GALLERY_SECTION_GAP_CLASSES = 'gap-3 sm:gap-4';

/** White gallery card surface (hover elevation only applies to the live gallery). */
export const GALLERY_CARD_BASE_CLASS =
  'relative z-0 mx-auto w-full max-w-[520px] overflow-visible rounded-[20px] bg-white px-3 pb-4 pt-3 shadow-none sm:max-w-[540px] sm:overflow-x-clip sm:overflow-y-visible sm:rounded-[24px] sm:px-5 sm:pb-5 sm:pt-4 sm:shadow-[0_1px_0_rgba(18,42,38,0.04)] lg:max-w-[580px]';

/** Hover/elevation behaviour layered on top of {@link GALLERY_CARD_BASE_CLASS}. */
export const GALLERY_CARD_HOVER_CLASS =
  'transition-shadow duration-200 has-[.product-hero:hover]:z-10 sm:has-[.product-hero:hover]:shadow-[0_12px_32px_rgba(18,42,38,0.12)]';
