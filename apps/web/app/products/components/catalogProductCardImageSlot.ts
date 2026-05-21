export { PRODUCT_IMAGE_ASPECT_4_3_CLASS_NAME as PRODUCT_CARD_IMAGE_ASPECT_CLASS_NAME } from '../../../components/ProductImage';

/** Centered drawable slot — matches the balanced “card 2” look with side breathing room. */
export const PRODUCT_CARD_HERO_SLOT_WIDTH_RATIO = 0.86;
export const PRODUCT_CARD_HERO_SLOT_HEIGHT_RATIO = 0.9;
export const PRODUCT_CARD_HERO_SLOT_WIDTH_CLASS_NAME = 'w-[86%]';
export const PRODUCT_CARD_HERO_SLOT_HEIGHT_CLASS_NAME = 'h-[90%]';

/**
 * Pack hero on catalog cards — fixed frame, full product visible, baseline at bottom.
 * Scales down in-frame only for outliers (see {@link useCatalogProductHeroScale}).
 */
export const PRODUCT_CARD_PACK_HERO_OBJECT_CLASS_NAME =
  'h-full w-full object-contain object-bottom';

/** Catalog cards use 4/3 cover frames via {@link ProductImage}. */
export const PRODUCT_CARD_IMAGE_ASPECT_RATIO = '4/3' as const;

/** Compact strip — outer hero wrapper height (Tailwind `h-[14.75rem]`). */
export const CATALOG_PRODUCT_CARD_COMPACT_HERO_WRAPPER_HEIGHT_CLASS_NAME =
  'h-[14.75rem] sm:h-[17.75rem]';

/** Compact strip — inner frame height used for `object-contain` + scale math. */
export const CATALOG_PRODUCT_CARD_COMPACT_HERO_FRAME_HEIGHT_CLASS_NAME =
  'h-[13.75rem] sm:h-[16.5rem]';

/** `/products` — full card width (edge-to-edge hero, no side gutter). */
export const CATALOG_PRODUCTS_PAGE_HERO_SLOT_WIDTH_RATIO = 1;
export const CATALOG_PRODUCTS_PAGE_HERO_SLOT_HEIGHT_RATIO = 1;
export const CATALOG_PRODUCTS_PAGE_HERO_SLOT_WIDTH_CLASS_NAME = 'w-full';
export const CATALOG_PRODUCTS_PAGE_HERO_SLOT_HEIGHT_CLASS_NAME = 'h-full';

/** `/products` — outer hero wrapper height (overflow visible — room above pack). */
export const CATALOG_PRODUCTS_PAGE_HERO_WRAPPER_HEIGHT_CLASS_NAME =
  'h-[20.25rem] sm:h-[23.25rem]';

/** `/products` — inner image frame. */
export const CATALOG_PRODUCTS_PAGE_HERO_FRAME_HEIGHT_CLASS_NAME =
  'h-[19.25rem] sm:h-[22rem]';

/** Assumed root font size for rem → px hero fit math (matches browser default). */
export const CATALOG_PRODUCT_CARD_REM_PX = 16;
