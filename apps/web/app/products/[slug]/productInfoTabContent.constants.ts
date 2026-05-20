/**
 * Stacked layouts: fixed tab block height so purchase row does not shift between tabs.
 */
export const PRODUCT_INFO_TAB_BLOCK_HEIGHT_CLASS =
  'h-[15rem] min-h-[15rem] max-h-[15rem] sm:h-[16.25rem] sm:min-h-[16.25rem] sm:max-h-[16.25rem]';

export const PRODUCT_INFO_ROOT_CLASS = [
  'flex min-h-0 w-full max-w-[763px] flex-1 flex-col',
  'pt-[clamp(3rem,7.8vw,11.25rem)]',
  'xl:h-full',
].join(' ');

export const PRODUCT_INFO_HEADER_CLASS = 'shrink-0';

export const PRODUCT_INFO_TABS_SECTION_CLASS = [
  'mt-8 grid min-h-0 shrink-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden',
  PRODUCT_INFO_TAB_BLOCK_HEIGHT_CLASS,
  'xl:mt-10 xl:h-auto xl:min-h-0 xl:max-h-none xl:flex-1',
].join(' ');

export const PRODUCT_INFO_TAB_PANEL_CLASS =
  'min-h-0 overflow-y-auto overscroll-y-contain pt-7 sm:pt-8';

export const PRODUCT_INFO_TAB_INDICATOR_BASE_CLASS =
  'absolute bottom-0 left-0 right-0 h-0.5 rounded-[2px]';

/** Desktop grid column — gallery defines height; no forced min on stacked mobile. */
export const PRODUCT_INFO_COLUMN_CLASS = 'flex min-h-0 min-w-0 flex-col xl:h-full';

/** Space between tab body and purchase row (matches legacy 48px). */
export const PRODUCT_INFO_PURCHASE_ROW_TOP_PADDING_CLASS = 'pt-12';

export const PRODUCT_INFO_PURCHASE_ROW_CLASS = `shrink-0 ${PRODUCT_INFO_PURCHASE_ROW_TOP_PADDING_CLASS}`;
