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

/** `/products` horizontal strip — spacing between cards from `sm` up. */
export const CATALOG_PRODUCTS_PAGE_STRIP_GAP_CLASS_NAME = 'gap-4 sm:gap-7 lg:gap-10';

/** Top padding for overlapping product heroes in horizontal strips (mobile). */
export const CATALOG_PRODUCT_CARD_MOBILE_STRIP_TOP_PADDING_CLASS_NAME = 'max-sm:pt-[7.25rem]';

/** `/products` strip — tighter gap under section titles while keeping hero overlap. */
export const CATALOG_PRODUCTS_PAGE_MOBILE_STRIP_TOP_PADDING_CLASS_NAME = 'max-sm:pt-[5rem]';

/** `/products` — less space between section heading and card strip on mobile. */
export const CATALOG_PRODUCTS_PAGE_MOBILE_STRIP_MARGIN_CLASS_NAME = 'max-sm:mt-0';

/**
 * Two cards per mobile viewport: `50vw` minus page `px-4` (2rem) and half of `gap-4` (1rem).
 * Replaces fixed `10rem` width that left a sliver of the next card clipped at the strip edge.
 */
export const CATALOG_PRODUCTS_PAGE_MOBILE_STRIP_CARD_WIDTH_CLASS_NAME =
  'max-sm:w-[calc(50vw-1.5rem)] max-sm:min-w-[calc(50vw-1.5rem)] max-sm:max-w-none';

/**
 * Home page (`px-5` gutters): two cards per row with `gap-4` — trending / upcoming on home.
 */
export const HOME_PAGE_MOBILE_STRIP_CARD_WIDTH_CLASS_NAME =
  'max-sm:w-[calc(50vw-1.75rem)] max-sm:min-w-[calc(50vw-1.75rem)] max-sm:max-w-none';

/** One mobile coverflow page width on home (`px-5` horizontal padding). */
export const HOME_PAGE_MOBILE_CAROUSEL_SLOT_WIDTH_CSS = 'calc(100vw - 2.5rem)';

/**
 * Home trending staggered cluster — hero sits lower; white card extends higher behind the pack.
 */
export const HOME_TRENDING_MOBILE_IMAGE_FRAME_CLASS_NAME =
  'max-sm:translate-y-2 sm:translate-y-0 sm:-translate-y-1 lg:-translate-y-2';

export const HOME_TRENDING_MOBILE_HERO_PULL_UP_CLASS_NAME =
  'max-sm:-mt-[5.5rem] sm:-mt-[5.75rem] lg:-mt-[6.25rem]';

export const HOME_TRENDING_MOBILE_CARD_TOP_PADDING_CLASS_NAME =
  'max-sm:pt-[3.75rem] sm:pt-[3.5rem] lg:pt-[4rem]';

export const HOME_TRENDING_MOBILE_DETAILS_OFFSET_CLASS_NAME =
  'max-sm:-mt-[2.75rem] sm:-mt-[4.25rem] lg:-mt-[4.5rem]';

/** Tighter gap between hero and dots/title on home trending (mobile). */
export const HOME_TRENDING_MOBILE_IMAGE_BOTTOM_MARGIN_CLASS_NAME = 'mb-0 max-sm:mb-1 sm:mb-1';

/** Home trending / upcoming horizontal strip — `px-5` card width below `sm`. */
export const HOME_TRENDING_MOBILE_ITEM_WRAPPER_CLASS_NAME =
  `max-sm:flex max-sm:shrink-0 max-sm:flex-col max-sm:justify-center ${HOME_PAGE_MOBILE_STRIP_CARD_WIDTH_CLASS_NAME}`;

/** Home upcoming horizontal strip — same wrapper as trending. */
export const HOME_UPCOMING_MOBILE_ITEM_WRAPPER_CLASS_NAME = HOME_TRENDING_MOBILE_ITEM_WRAPPER_CLASS_NAME;

/** Home upcoming strip reuses trending mobile hero + copy spacing. */
export const HOME_UPCOMING_MOBILE_IMAGE_FRAME_CLASS_NAME = HOME_TRENDING_MOBILE_IMAGE_FRAME_CLASS_NAME;
export const HOME_UPCOMING_MOBILE_HERO_PULL_UP_CLASS_NAME = HOME_TRENDING_MOBILE_HERO_PULL_UP_CLASS_NAME;
export const HOME_UPCOMING_MOBILE_CARD_TOP_PADDING_CLASS_NAME = HOME_TRENDING_MOBILE_CARD_TOP_PADDING_CLASS_NAME;
export const HOME_UPCOMING_MOBILE_DETAILS_OFFSET_CLASS_NAME = HOME_TRENDING_MOBILE_DETAILS_OFFSET_CLASS_NAME;
export const HOME_UPCOMING_MOBILE_IMAGE_BOTTOM_MARGIN_CLASS_NAME =
  HOME_TRENDING_MOBILE_IMAGE_BOTTOM_MARGIN_CLASS_NAME;

/** Outer strip/grid cell — caps card width on narrow viewports. */
export const CATALOG_PRODUCT_CARD_MOBILE_ITEM_WRAPPER_CLASS_NAME =
  `max-sm:flex max-sm:shrink-0 max-sm:flex-col max-sm:justify-center max-sm:translate-y-3 ${CATALOG_PRODUCTS_PAGE_MOBILE_STRIP_CARD_WIDTH_CLASS_NAME}`;

/**
 * `/products` landing strip cell — `px-4` card width; layout matches home Upcoming wrapper.
 */
export const CATALOG_PRODUCTS_PAGE_MOBILE_ITEM_WRAPPER_CLASS_NAME =
  `flex min-h-0 max-sm:shrink-0 max-sm:flex-col max-sm:self-stretch max-sm:justify-center ${CATALOG_PRODUCTS_PAGE_MOBILE_STRIP_CARD_WIDTH_CLASS_NAME}`;

/** `/products` strip — slightly smaller hero/copy spacing from `lg` (desktop). */
export const CATALOG_PRODUCTS_PAGE_DESKTOP_IMAGE_FRAME_CLASS_NAME =
  'max-sm:-translate-y-2 sm:translate-y-0 sm:-translate-y-1 lg:translate-y-0';

export const CATALOG_PRODUCTS_PAGE_DESKTOP_HERO_PULL_UP_CLASS_NAME =
  'max-sm:-mt-[6rem] sm:-mt-[7rem] lg:-mt-[6.5rem]';

export const CATALOG_PRODUCTS_PAGE_DESKTOP_CARD_TOP_PADDING_CLASS_NAME =
  'max-sm:pt-[4.5rem] sm:pt-[5rem] lg:pt-[4.5rem]';

export const CATALOG_PRODUCTS_PAGE_DESKTOP_CARD_BOTTOM_PADDING_CLASS_NAME =
  'pb-4 max-sm:pb-3.5 sm:pb-5';

export const CATALOG_PRODUCTS_PAGE_DESKTOP_DETAILS_OFFSET_CLASS_NAME =
  'max-sm:-mt-[3.7rem] sm:-mt-[4.25rem] lg:-mt-[3.5rem]';

/** `/products` landing mobile — same hero/copy spacing as home Upcoming. */
export const PRODUCTS_CATALOG_LANDING_MOBILE_IMAGE_FRAME_CLASS_NAME =
  HOME_UPCOMING_MOBILE_IMAGE_FRAME_CLASS_NAME;
export const PRODUCTS_CATALOG_LANDING_MOBILE_HERO_PULL_UP_CLASS_NAME =
  HOME_UPCOMING_MOBILE_HERO_PULL_UP_CLASS_NAME;
export const PRODUCTS_CATALOG_LANDING_MOBILE_CARD_TOP_PADDING_CLASS_NAME =
  HOME_UPCOMING_MOBILE_CARD_TOP_PADDING_CLASS_NAME;
export const PRODUCTS_CATALOG_LANDING_MOBILE_DETAILS_OFFSET_CLASS_NAME =
  HOME_UPCOMING_MOBILE_DETAILS_OFFSET_CLASS_NAME;
export const PRODUCTS_CATALOG_LANDING_MOBILE_IMAGE_BOTTOM_MARGIN_CLASS_NAME =
  HOME_UPCOMING_MOBILE_IMAGE_BOTTOM_MARGIN_CLASS_NAME;

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

/** `/products` horizontal strip — scroll container (legacy / full-page strip). */
export const CATALOG_PRODUCTS_PAGE_STRIP_SCROLL_CLASS_NAME = `scrollbar-hide mt-4 overflow-x-auto overflow-y-visible overscroll-x-contain max-sm:snap-x max-sm:snap-mandatory max-sm:pb-14 pb-10 pt-[8rem] sm:pb-12 sm:pt-[8.5rem] lg:pb-14 lg:pt-[9rem] ${CATALOG_PRODUCTS_PAGE_MOBILE_STRIP_MARGIN_CLASS_NAME} ${CATALOG_PRODUCTS_PAGE_MOBILE_STRIP_TOP_PADDING_CLASS_NAME}`;

/** `/products` catalog sections — room for overlapping heroes below section h2. */
export const CATALOG_PRODUCTS_PAGE_SECTION_STRIP_SCROLL_CLASS_NAME = `scrollbar-hide mt-0.5 overflow-x-auto overflow-y-visible overscroll-x-contain max-sm:snap-x max-sm:snap-mandatory max-sm:pb-10 pb-10 max-sm:pt-[5.75rem] pt-[5.5rem] sm:pb-12 sm:pt-[6rem] lg:pb-14 lg:pt-[5.75rem] ${CATALOG_PRODUCTS_PAGE_MOBILE_STRIP_MARGIN_CLASS_NAME}`;

/** Pagination row spacing below catalog / related strips. */
export const CATALOG_PRODUCTS_PAGE_PAGINATION_WRAPPER_CLASS_NAME =
  'relative z-20 mt-4 flex justify-center px-4 max-sm:mt-5 sm:mt-6 sm:mt-8';

/** `/products` horizontal strip — card flex row. */
export const CATALOG_PRODUCTS_PAGE_STRIP_FLEX_CLASS_NAME = `flex min-w-max max-lg:pr-4 lg:pr-[7.5rem] ${CATALOG_PRODUCTS_PAGE_STRIP_GAP_CLASS_NAME} ${CATALOG_PRODUCT_CARD_MOBILE_STRIP_GAP_CLASS_NAME}`;

/** `/products` strip — slightly smaller hero on positions 2 and 5 in each group of six (0-based: 1, 4). */
export const PRODUCTS_CATALOG_PAGE_SMALLER_IMAGE_SCALE_MULTIPLIER = 0.85;

/** Home trending — same stagger positions, legacy scale from before catalog strip tuning. */
export const TRENDING_SECTION_SMALLER_IMAGE_SCALE_MULTIPLIER = 0.9;

export function isProductsCatalogPageSmallerImageCard(cardIndex: number): boolean {
  return cardIndex % 6 === 1 || cardIndex % 6 === 4;
}

export function getProductsCatalogPageSmallerImageScaleMultiplier(cardIndex: number): number {
  return isProductsCatalogPageSmallerImageCard(cardIndex)
    ? PRODUCTS_CATALOG_PAGE_SMALLER_IMAGE_SCALE_MULTIPLIER
    : 1;
}

export function getTrendingSectionSmallerImageScaleMultiplier(cardIndex: number): number {
  return isProductsCatalogPageSmallerImageCard(cardIndex)
    ? TRENDING_SECTION_SMALLER_IMAGE_SCALE_MULTIPLIER
    : 1;
}

/** Keeps hero scale consistent across cards (PNG-friendly normalization). */
export function getCatalogProductCardImageScaleBoost(cardIndex: number): number {
  void cardIndex;
  // Keep every product image at the same visual scale (especially for transparent PNG assets).
  return 0;
}
