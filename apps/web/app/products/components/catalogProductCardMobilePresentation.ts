/** Matches Tailwind `sm` (640px): below = mobile strip card sizing. */
export const CATALOG_PRODUCT_CARD_SM_VIEWPORT_QUERY = '(min-width: 640px)';

/** `/products` horizontal strip — cards per pagination step below `sm`. */
export const CATALOG_PRODUCTS_PAGE_MOBILE_CARDS_PER_PAGE = 2;

const CATALOG_SCROLL_IDLE_UPDATE_DELAY_MS = 90;

export function subscribeCatalogProductsSmViewport(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const mq = window.matchMedia(CATALOG_PRODUCT_CARD_SM_VIEWPORT_QUERY);
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

export function getCatalogProductsSmViewportSnapshot(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(CATALOG_PRODUCT_CARD_SM_VIEWPORT_QUERY).matches;
}

/** SSR: assume mobile strip pagination (2 per step). */
export function getServerCatalogProductsSmViewportSnapshot(): boolean {
  return false;
}

export { CATALOG_SCROLL_IDLE_UPDATE_DELAY_MS };

/** Mobile strip gap — matches home upcoming / trending (`gap-x-4`). */
export const CATALOG_PRODUCT_CARD_MOBILE_STRIP_GAP_CLASS_NAME = 'max-sm:gap-4';

/** `/products` horizontal strip — tighter spacing between cards from `sm` up. */
export const CATALOG_PRODUCTS_PAGE_STRIP_GAP_CLASS_NAME = 'gap-4 sm:gap-5 lg:gap-6';

/** Top padding for overlapping product heroes in horizontal strips (mobile). */
export const CATALOG_PRODUCT_CARD_MOBILE_STRIP_TOP_PADDING_CLASS_NAME = 'max-sm:pt-[7.25rem]';

/** `/products` strip — tighter gap under section titles while keeping hero overlap. */
export const CATALOG_PRODUCTS_PAGE_MOBILE_STRIP_TOP_PADDING_CLASS_NAME = 'max-sm:pt-[5rem]';

/** `/products` — less space between section heading and card strip on mobile. */
export const CATALOG_PRODUCTS_PAGE_MOBILE_STRIP_MARGIN_CLASS_NAME = 'max-sm:mt-0';

/** Outer strip/grid cell — caps card width on narrow viewports. */
export const CATALOG_PRODUCT_CARD_MOBILE_ITEM_WRAPPER_CLASS_NAME =
  'max-sm:flex max-sm:w-full max-sm:max-w-[10rem] max-sm:shrink-0 max-sm:flex-col max-sm:justify-center max-sm:translate-y-3';

/** `/products` strip cell — no extra downward nudge under the section title. */
export const CATALOG_PRODUCTS_PAGE_MOBILE_ITEM_WRAPPER_CLASS_NAME =
  'max-sm:flex max-sm:w-full max-sm:max-w-[10rem] max-sm:shrink-0 max-sm:flex-col max-sm:justify-center';

/** Passed to `ProductsCatalogCard` `className` below `sm`. */
export const CATALOG_PRODUCT_CARD_MOBILE_ARTICLE_CLASS_NAME = '!h-auto w-full max-w-none';

/** Nudges hero image toward image-switch dots on narrow viewports only. */
export const CATALOG_PRODUCT_CARD_MOBILE_IMAGE_FRAME_CLASS_NAME = 'max-sm:translate-y-5';

/** Mobile: pull hero up. Desktop: lifted strip layout. */
export const CATALOG_PRODUCTS_PAGE_IMAGE_FRAME_CLASS_NAME =
  'max-sm:-translate-y-2 sm:translate-y-0 sm:-translate-y-1 lg:-translate-y-2';

/** Cap inline hero scale on catalog strip below `sm` (avoids spill onto pagination). */
export const CATALOG_PRODUCTS_PAGE_MOBILE_HERO_MAX_SCALE = 1.08;

/** Mobile: taller white body behind hero. Desktop: extends upward behind mid-hero. */
export const CATALOG_PRODUCTS_PAGE_CARD_TOP_PADDING_CLASS_NAME =
  'max-sm:pt-[2.75rem] sm:pt-[3.5rem] lg:pt-[4rem]';

/** Mobile catalog strip — compact details stack (no forced min-height gap). */
export const CATALOG_PRODUCTS_PAGE_CARD_MOBILE_DETAILS_LAYOUT_CLASS_NAME =
  'max-sm:justify-start';

/** Mobile: strong pull-up so scaled hero does not sit on pagination dots. */
export const CATALOG_PRODUCTS_PAGE_CARD_HERO_PULL_UP_CLASS_NAME =
  'max-sm:-mt-[7rem] sm:-mt-[5.75rem] lg:-mt-[6.25rem]';

/** Mobile: tuck copy under hero without a large dead zone before price row. */
export const CATALOG_PRODUCTS_PAGE_CARD_DETAILS_OFFSET_CLASS_NAME =
  'max-sm:-mt-[2.75rem] sm:-mt-[4.25rem] lg:-mt-[4.5rem]';

/** Mobile pagination row — all segments on one line; width shrinks as page count grows. */
export const CATALOG_MOBILE_PAGINATION_ROW_CLASS_NAME =
  'flex w-full max-w-[calc(100vw-2rem)] flex-nowrap items-center gap-1.5';

/** `/products` horizontal strip — scroll container (PDP related products). */
export const CATALOG_PRODUCTS_PAGE_STRIP_SCROLL_CLASS_NAME = `scrollbar-hide mt-4 overflow-x-auto max-sm:overflow-y-clip overflow-y-visible overscroll-x-contain max-sm:snap-x max-sm:snap-mandatory max-sm:pb-14 pb-10 pt-[8rem] sm:pb-12 sm:pt-[8.5rem] lg:pb-14 lg:pt-[9rem] ${CATALOG_PRODUCTS_PAGE_MOBILE_STRIP_MARGIN_CLASS_NAME} ${CATALOG_PRODUCTS_PAGE_MOBILE_STRIP_TOP_PADDING_CLASS_NAME}`;

/** `/products` catalog sections — less space under section h2 than PDP related strip. */
export const CATALOG_PRODUCTS_PAGE_SECTION_STRIP_SCROLL_CLASS_NAME = `scrollbar-hide mt-1.5 overflow-x-auto max-sm:overflow-y-clip overflow-y-visible overscroll-x-contain max-sm:snap-x max-sm:snap-mandatory max-sm:pb-14 pb-10 max-sm:pt-[3rem] pt-[5.5rem] sm:pb-12 sm:pt-[6rem] lg:pb-14 lg:pt-[6.5rem] ${CATALOG_PRODUCTS_PAGE_MOBILE_STRIP_MARGIN_CLASS_NAME}`;

/** Pagination row spacing below catalog / related strips. */
export const CATALOG_PRODUCTS_PAGE_PAGINATION_WRAPPER_CLASS_NAME =
  'relative z-20 mt-4 flex justify-center px-4 max-sm:mt-10 sm:mt-6 sm:mt-8';

/** `/products` horizontal strip — card flex row. */
export const CATALOG_PRODUCTS_PAGE_STRIP_FLEX_CLASS_NAME = `flex min-w-max max-lg:pr-4 ${CATALOG_PRODUCTS_PAGE_STRIP_GAP_CLASS_NAME} ${CATALOG_PRODUCT_CARD_MOBILE_STRIP_GAP_CLASS_NAME}`;

/** Keeps hero scale consistent across cards (PNG-friendly normalization). */
export function getCatalogProductCardImageScaleBoost(cardIndex: number): number {
  void cardIndex;
  // Keep every product image at the same visual scale (especially for transparent PNG assets).
  return 0;
}
