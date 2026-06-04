/** Matches `TrendingFeaturedSection` shop CTA sizing and xl placement. */
export const UPCOMING_SHOP_BUTTON_CLASS_NAME =
  '!w-fit !min-h-8 !translate-y-0 !rounded-[0.5rem] !border-[2.5px] !border-[#dcc090] !px-2.5 !py-2 !text-[0.75rem] !font-black !uppercase !leading-none !tracking-[0.07em] sm:!w-auto sm:!min-h-9 sm:!translate-y-[2rem] sm:!rounded-[0.5rem] sm:!border-[2.5px] sm:!border-[#dcc090] sm:!px-5 sm:!py-0 sm:!text-[0.75rem] sm:!font-black sm:!leading-none sm:!tracking-[0.14em] xl:absolute xl:right-[7.5rem] xl:!translate-y-[2rem]';

/** Mobile: tighter strip padding so cards sit closer to the section title and pagination. */
export const UPCOMING_MOBILE_SCROLL_TOP_PADDING_CLASS = 'max-sm:pt-[5.5rem]';
export const UPCOMING_MOBILE_SCROLL_BOTTOM_PADDING_CLASS = 'max-sm:pb-4';
export const UPCOMING_MOBILE_PAGINATION_MARGIN_TOP_CLASS = 'max-sm:mt-2';
export const UPCOMING_MOBILE_SECTION_GAP_CLASS = 'max-sm:gap-2';

/** Matches home page `lg:px-[7.5rem]` content column. */
export const UPCOMING_HOME_DESKTOP_CONTENT_INSET_REM = 7.5;

/** Hero bleed uses `lg:pl-10` (2.5rem) on the strip — partial compensation so card edges match neighbouring sections. */
export const UPCOMING_DESKTOP_STRIP_LEADING_INSET_REM = 5;

/** Desktop leading inset — scrolls away so the strip can fill the viewport left edge. */
export const UPCOMING_DESKTOP_STRIP_LEADING_INSET_CLASS_NAME =
  'hidden shrink-0 lg:block lg:w-[5rem]';

/** Escapes home `overflow-x-hidden` so strip heroes are not clipped while scrolling into the left bleed. */
export const UPCOMING_SECTION_BLEED_WRAPPER_CLASS_NAME =
  'relative min-w-0 overflow-x-visible lg:-mx-[7.5rem]';

/** Extra scroll room so scaled heroes stay visible at the strip’s left edge while scrolling. */
export const UPCOMING_DESKTOP_STRIP_HERO_HORIZONTAL_BLEED_CLASS_NAME = 'lg:-ml-10 lg:pl-10';

/** Home upcoming strip — wider mobile cards + trailing gutter for end-of-strip scroll. */
export const UPCOMING_PRODUCT_STRIP_FLEX_CLASS_NAME =
  `flex min-w-max items-stretch max-sm:gap-4 max-sm:pr-5 gap-4 sm:gap-7 lg:gap-10 lg:pr-[7.5rem] ${UPCOMING_DESKTOP_STRIP_HERO_HORIZONTAL_BLEED_CLASS_NAME}`;

export const UPCOMING_CARDS_PER_PAGE_MOBILE = 2;
export const UPCOMING_CARDS_PER_PAGE_SM_UP = 6;
export const UPCOMING_SCROLL_IDLE_UPDATE_DELAY_MS = 90;
/** rAF frames where scrollLeft must stay constant before treating smooth scroll as settled. */
export const UPCOMING_SCROLL_SETTLE_STABLE_FRAMES = 4;
/** Safety cap so programmatic-scroll flag is always released even if scroll never reports settling. */
export const UPCOMING_SCROLL_SETTLE_MAX_WAIT_MS = 1500;
/** Tolerance (px) when matching live scrollLeft to the target page anchor. */
export const UPCOMING_SCROLL_TARGET_TOLERANCE_PX = 2;

/** Mobile: gutter via `.products-catalog-mobile-strip-scroll` on page 1 (see `globals.css`). */
export const UPCOMING_MOBILE_SCROLL_BLEED_CLASS = '';

/** Desktop: kept for `/products` parity; home upcoming uses {@link UPCOMING_SECTION_BLEED_WRAPPER_CLASS_NAME} instead. */
export const UPCOMING_SCROLL_CONTAINER_LEFT_BLEED_CLASS_NAME =
  'lg:-ml-[7.5rem] lg:w-[calc(100%+7.5rem)]';

/** Matches `/products` catalog section strip (hero overlap + scroll padding). */
export const UPCOMING_SCROLL_CONTAINER_CLASS_NAME =
  `scrollbar-hide max-sm:mt-1 mt-3 overflow-x-auto overflow-y-visible overscroll-x-contain max-sm:snap-x max-sm:snap-mandatory pb-10 ${UPCOMING_MOBILE_SCROLL_BOTTOM_PADDING_CLASS} pt-[5.5rem] ${UPCOMING_MOBILE_SCROLL_TOP_PADDING_CLASS} ${UPCOMING_MOBILE_SCROLL_BLEED_CLASS} sm:mt-6 sm:mx-0 sm:px-0 sm:pb-12 sm:pt-[6rem] lg:pb-14 lg:pt-[5.75rem]`;
