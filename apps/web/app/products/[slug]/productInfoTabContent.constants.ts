/**
 * Below xl: tab panel keeps a fixed height so the purchase row (price) does not jump
 * when switching tabs. Long copy scrolls inside the panel.
 * Desktop (xl): tab block grows to fill column; panel scrolls when copy is long.
 */
export const PRODUCT_INFO_TAB_BLOCK_HEIGHT_CLASS =
  'xl:min-h-0 xl:flex-1';

/**
 * Shared mobile/tablet panel height (padding included). Tall enough for customize
 * saved text + CTA + delete without an inner scrollbar; longer tabs still scroll.
 */
export const PRODUCT_INFO_TAB_PANEL_FIXED_HEIGHT_CLASS = 'h-[220px]';

/** Matches {@link GALLERY_TOP_OFFSET_CLASSES} in ProductImageGallery so title aligns with the white card top on xl+. */
export const PRODUCT_INFO_ROOT_CLASS = [
  'flex h-full min-h-0 w-full max-w-[763px] flex-1 flex-col',
  'pt-0 xl:pt-16',
].join(' ');

/**
 * Tabs + purchase row — desktop panel scrolls inside the column; header stays overflow-visible for size shake.
 * `overflow-x-clip` (not `hidden`) keeps the vertical axis truly `visible`: pairing
 * `hidden` with `visible` makes the browser compute `overflow-y: auto`, which added a
 * stray vertical scrollbar on mobile.
 */
export const PRODUCT_INFO_SCROLL_BODY_CLASS =
  'flex min-h-0 flex-1 flex-col overflow-x-clip overflow-y-visible xl:overflow-hidden';

/**
 * Customize tab: same containment as other tabs so the page body does not grow a
 * second scrollbar. Font menu is position:fixed (see CustomizeFontDropdown).
 */
export const PRODUCT_INFO_SCROLL_BODY_CUSTOMIZE_CLASS = PRODUCT_INFO_SCROLL_BODY_CLASS;

/** Above gallery hero hover (`z-10`) and in-hero nav icons (`z-30` within that card). */
export const PRODUCT_INFO_HEADER_CLASS = 'relative z-40 shrink-0 overflow-visible';

export const PRODUCT_INFO_TABS_SECTION_CLASS = [
  'mt-8 flex min-h-0 shrink-0 flex-col overflow-x-clip overflow-y-visible',
  'xl:mt-10 xl:min-h-0 xl:flex-1 xl:shrink xl:overflow-hidden xl:grid xl:grid-rows-[auto_minmax(0,1fr)]',
  PRODUCT_INFO_TAB_BLOCK_HEIGHT_CLASS,
].join(' ');

export const PRODUCT_INFO_TAB_PANEL_CLASS = [
  PRODUCT_INFO_TAB_PANEL_FIXED_HEIGHT_CLASS,
  'min-h-0 overflow-y-auto overscroll-y-contain pt-7 sm:pt-8',
  'scrollbar-hide [-webkit-overflow-scrolling:touch]',
  'xl:h-auto xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:overscroll-y-contain',
].join(' ');

/** Customize tab: same fixed height + hidden scrollbar; font menu uses fixed positioning. */
export const PRODUCT_INFO_TABS_SECTION_CUSTOMIZE_CLASS = PRODUCT_INFO_TABS_SECTION_CLASS;

export const PRODUCT_INFO_TAB_PANEL_CUSTOMIZE_CLASS = PRODUCT_INFO_TAB_PANEL_CLASS;

/** Mobile teaser (Figma): heading + intro + outline CTA before the editor opens. */
export const PRODUCT_INFO_CUSTOMIZE_HEADING_CLASS =
  'font-montserrat text-[14px] font-extrabold leading-[22px] text-[#414141]';

export const PRODUCT_INFO_CUSTOMIZE_INTRO_CLASS =
  'mt-1 font-montserrat text-[12px] font-semibold leading-[18px] text-[#414141]';

export const PRODUCT_INFO_CUSTOMIZE_CTA_CLASS = [
  'mt-3 inline-flex h-9 items-center justify-center self-center rounded-[6px]',
  'border border-[#dcc090] bg-[#faf8f4] px-5',
  'font-montserrat text-[14px] font-semibold leading-none text-[#dcc090]',
  'transition-colors hover:bg-[#f3efe6]',
].join(' ');

/** Saved customize line shown between intro and Customize CTA (mobile). */
export const PRODUCT_INFO_CUSTOMIZE_SAVED_TEXT_CLASS = [
  'mt-3 w-full break-words text-center font-montserrat text-[16px]',
  'leading-[24px] tracking-normal text-[#414141]',
].join(' ');

export const PRODUCT_INFO_CUSTOMIZE_TEASER_CLASS =
  'flex flex-col items-start sm:hidden';

/** Desktop: copy first then format row. Mobile editor: input + toolbar only. */
export const PRODUCT_INFO_CUSTOMIZE_PANEL_CLASS =
  'flex min-h-0 flex-1 flex-col gap-5';

export const PRODUCT_INFO_CUSTOMIZE_EDITOR_CLASS =
  'flex min-h-0 flex-1 flex-col gap-5';

/** Desktop copy block inside the always-desktop editor column. */
export const PRODUCT_INFO_CUSTOMIZE_DESKTOP_COPY_CLASS = 'block';

export const PRODUCT_INFO_TAB_INDICATOR_BASE_CLASS =
  'absolute bottom-0 left-0 right-0 h-0.5 rounded-[2px]';

/**
 * Desktop grid cell: `h-0` + `min-h-full` stretches to the gallery row height without
 * growing the row when tab copy is long (see PDP grid in `page.tsx`).
 */
export const PRODUCT_INFO_COLUMN_CLASS = [
  'relative z-30 flex min-h-0 min-w-0 flex-col overflow-x-clip overflow-y-visible',
  'xl:h-0 xl:min-h-full',
].join(' ');

/** Space between tab body and purchase row (matches legacy 48px). */
export const PRODUCT_INFO_PURCHASE_ROW_TOP_PADDING_CLASS = 'pt-12';

export const PRODUCT_INFO_PURCHASE_ROW_CLASS = `shrink-0 ${PRODUCT_INFO_PURCHASE_ROW_TOP_PADDING_CLASS}`;

/** Purchase row layout — price left, CTA right. */
export const PRODUCT_INFO_PURCHASE_ROW_LAYOUT_CLASS =
  'flex w-full min-w-0 items-end justify-between gap-4 sm:gap-6';

export const PRODUCT_INFO_TITLE_CLASS =
  'min-w-0 font-montserrat text-[26px] font-black leading-tight text-[#414141] sm:text-[30px]';

export const PRODUCT_INFO_PRICE_CLASS =
  'font-montserrat text-[30px] font-extrabold leading-none text-black sm:text-[32px]';

/** Collection / label pill under the title (color classes are appended per badge). */
export const PRODUCT_INFO_BADGE_BASE_CLASS =
  'inline-flex items-center rounded-full px-2.5 py-1 font-montserrat text-xs font-medium leading-none sm:text-[13px]';

export const PRODUCT_INFO_BADGE_ROW_CLASS = 'mt-2 flex flex-wrap items-center gap-1.5';

export const PRODUCT_INFO_ADD_TO_CART_BUTTON_CLASS =
  'h-10 shrink-0 rounded-[8px] !bg-[#dcc090] px-4 text-[16px] font-bold capitalize tracking-normal !text-[#122a26] hover:!bg-[#d3b67f] disabled:cursor-wait disabled:!opacity-100 sm:px-5 sm:text-[20px]';

/** Attribute section (size / color) heading. */
export const PRODUCT_INFO_SECTION_LABEL_CLASS =
  'font-montserrat text-[18px] font-extrabold leading-none text-[#414141]';

/** Size block wrapper — spacing is added per section position. */
export const PRODUCT_INFO_SIZE_SECTION_CLASS = 'relative z-40 overflow-visible px-1';

/** First attribute section spacing depends on whether title-row badges are present. */
export const PRODUCT_INFO_FIRST_SECTION_SPACING_WITH_BADGES_CLASS = 'mt-6';
export const PRODUCT_INFO_FIRST_SECTION_SPACING_CLASS = 'mt-8';

export const PRODUCT_INFO_SIZE_BUTTON_CLASS =
  'relative z-40 mt-3 flex w-full min-h-9 items-center justify-center gap-2 overflow-visible rounded-[6px] bg-[#dcc090] px-3 py-2 text-center font-montserrat text-[16px] font-bold leading-normal tracking-normal text-neutral-700 sm:inline-flex sm:w-auto sm:min-w-[160px]';

/** Horizontal tab-label rail (scrolls on narrow viewports, scrollbar hidden). */
export const PRODUCT_INFO_TABS_SCROLLER_CLASS =
  'w-full min-w-0 shrink-0 overflow-x-auto overscroll-x-contain scroll-px-1 pb-2 scrollbar-hide [-webkit-overflow-scrolling:touch] sm:pb-0';

export const PRODUCT_INFO_TABLIST_CLASS =
  'flex w-max max-w-none snap-x snap-mandatory flex-nowrap items-end gap-5 pr-4 sm:snap-none sm:gap-7 sm:pr-5';

export const PRODUCT_INFO_TAB_KEYS = ['description', 'details', 'shipping', 'customize'] as const;

export type ProductInfoTabKey = (typeof PRODUCT_INFO_TAB_KEYS)[number];

/** i18n keys for the tab labels, in rail order. */
export const PRODUCT_INFO_TAB_LABEL_KEYS: Record<ProductInfoTabKey, string> = {
  description: 'product.description_title',
  details: 'product.details_title',
  shipping: 'product.shipping_title',
  customize: 'product.customize_title',
};

/** Latin copy needs one step larger than Armenian/Russian to look optically equal. */
export function getProductTabLabelClass(language: string): string {
  return language === 'en'
    ? 'pb-3 font-montserrat text-[17px] font-black leading-none sm:text-[18px] md:text-[19px]'
    : 'pb-3 font-montserrat text-[16px] font-black leading-none sm:text-[17px] md:text-[18px]';
}
