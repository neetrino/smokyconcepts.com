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

const CATALOG_IMAGE_SCALE_LARGE = 0.2;
const CATALOG_IMAGE_SCALE_SMALL = 0.15;
const CATALOG_IMAGE_SCALE_PATTERN_LENGTH = 6;
const CATALOG_SMALL_SCALE_POSITIONS = new Set([2, 5]);

/** Mobile strip gap — matches home upcoming / trending (`gap-x-4`). */
export const CATALOG_PRODUCT_CARD_MOBILE_STRIP_GAP_CLASS_NAME = 'max-sm:gap-4';

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

/**
 * Alternating hero scale boost used on home upcoming and catalog mobile cards.
 */
export function getCatalogProductCardImageScaleBoost(cardIndex: number): number {
  const oneBasedPosition = (cardIndex % CATALOG_IMAGE_SCALE_PATTERN_LENGTH) + 1;
  return CATALOG_SMALL_SCALE_POSITIONS.has(oneBasedPosition)
    ? CATALOG_IMAGE_SCALE_SMALL
    : CATALOG_IMAGE_SCALE_LARGE;
}
