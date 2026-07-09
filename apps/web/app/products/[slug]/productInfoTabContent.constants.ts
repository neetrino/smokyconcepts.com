/**
 * Mobile: page scrolls as one unit (no nested tab panel scroll).
 * Desktop (xl): tab block grows to fill column; panel scrolls when copy is long.
 */
export const PRODUCT_INFO_TAB_BLOCK_HEIGHT_CLASS =
  'xl:min-h-0 xl:flex-1';

/** Matches {@link GALLERY_TOP_OFFSET_CLASSES} in ProductImageGallery so title aligns with the white card top on xl+. */
export const PRODUCT_INFO_ROOT_CLASS = [
  'flex h-full min-h-0 w-full max-w-[763px] flex-1 flex-col',
  'pt-0 xl:pt-16',
].join(' ');

/** Tabs + purchase row — desktop panel scrolls inside the column; header stays overflow-visible for size shake. */
export const PRODUCT_INFO_SCROLL_BODY_CLASS =
  'flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-visible xl:overflow-hidden';

/** Customize tab: allow font menu to extend into the purchase-row gap without clipping. */
export const PRODUCT_INFO_SCROLL_BODY_CUSTOMIZE_CLASS =
  'flex min-h-0 flex-1 flex-col overflow-visible';

/** Above gallery hero hover (`z-10`) and in-hero nav icons (`z-30` within that card). */
export const PRODUCT_INFO_HEADER_CLASS = 'relative z-40 shrink-0 overflow-visible';

export const PRODUCT_INFO_TABS_SECTION_CLASS = [
  'mt-8 flex min-h-0 flex-col overflow-x-hidden overflow-y-visible',
  'xl:mt-10 xl:min-h-0 xl:flex-1 xl:overflow-hidden xl:grid xl:grid-rows-[auto_minmax(0,1fr)]',
  PRODUCT_INFO_TAB_BLOCK_HEIGHT_CLASS,
].join(' ');

export const PRODUCT_INFO_TAB_PANEL_CLASS =
  'min-h-0 flex-1 overflow-visible pt-7 sm:pt-8 xl:overflow-y-auto xl:overscroll-y-contain xl:scrollbar-visible xl:[-webkit-overflow-scrolling:touch]';

/** Customize tab: natural height, no inner scroll — font menu uses the gap below. */
export const PRODUCT_INFO_TABS_SECTION_CUSTOMIZE_CLASS = [
  'mt-8 flex min-h-0 shrink-0 flex-col overflow-visible',
  'xl:mt-10 xl:min-h-0 xl:flex-1',
].join(' ');

export const PRODUCT_INFO_TAB_PANEL_CUSTOMIZE_CLASS =
  'flex min-h-0 flex-1 flex-col overflow-visible pt-7 sm:pt-8';

export const PRODUCT_INFO_CUSTOMIZE_COPY_CLASS =
  'font-montserrat text-[16px] font-bold leading-[26px] text-[#414141]';

/** Mobile: text input + toolbar above copy; desktop keeps copy first (Figma). */
export const PRODUCT_INFO_CUSTOMIZE_PANEL_CLASS =
  'flex min-h-0 flex-1 flex-col gap-5 max-sm:flex-col-reverse';

export const PRODUCT_INFO_TAB_INDICATOR_BASE_CLASS =
  'absolute bottom-0 left-0 right-0 h-0.5 rounded-[2px]';

/**
 * Desktop grid cell: `h-0` + `min-h-full` stretches to the gallery row height without
 * growing the row when tab copy is long (see PDP grid in `page.tsx`).
 */
export const PRODUCT_INFO_COLUMN_CLASS = [
  'relative z-30 flex min-h-0 min-w-0 flex-col overflow-x-hidden overflow-y-visible',
  'xl:h-0 xl:min-h-full',
].join(' ');

/** Space between tab body and purchase row (matches legacy 48px). */
export const PRODUCT_INFO_PURCHASE_ROW_TOP_PADDING_CLASS = 'pt-12';

export const PRODUCT_INFO_PURCHASE_ROW_CLASS = `shrink-0 ${PRODUCT_INFO_PURCHASE_ROW_TOP_PADDING_CLASS}`;
