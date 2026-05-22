/** Matches `TrendingFeaturedSection` shop CTA sizing and xl placement. */
export const UPCOMING_SHOP_BUTTON_CLASS_NAME =
  '!w-fit !min-h-8 !translate-y-[2rem] !rounded-[0.5rem] !border-[2.5px] !border-[#dcc090] !px-2.5 !py-2 !text-[0.75rem] !font-black !uppercase !leading-none !tracking-[0.07em] sm:!w-auto sm:!min-h-9 sm:!translate-y-[2rem] sm:!rounded-[0.5rem] sm:!border-[2.5px] sm:!border-[#dcc090] sm:!px-5 sm:!py-0 sm:!text-[0.75rem] sm:!font-black sm:!leading-none sm:!tracking-[0.14em] xl:absolute xl:right-[7.5rem] xl:!translate-y-[2rem]';

export const UPCOMING_LIMIT = 12;
export const UPCOMING_CARDS_PER_PAGE_MOBILE = 2;
export const UPCOMING_CARDS_PER_PAGE_SM_UP = 6;
export const UPCOMING_PAGE_ANIMATION_DURATION_MS = 300;
export const UPCOMING_SCROLL_IDLE_UPDATE_DELAY_MS = 90;
/** rAF frames where scrollLeft must stay constant before treating smooth scroll as settled. */
export const UPCOMING_SCROLL_SETTLE_STABLE_FRAMES = 4;
/** Safety cap so programmatic-scroll flag is always released even if scroll never reports settling. */
export const UPCOMING_SCROLL_SETTLE_MAX_WAIT_MS = 1500;
/** Tolerance (px) when matching live scrollLeft to the target page anchor. */
export const UPCOMING_SCROLL_TARGET_TOLERANCE_PX = 2;

export const UPCOMING_PAGE_STAGGER_DELAY_CLASSES = [
  'delay-[10ms]',
  'delay-[50ms]',
  'delay-[154ms]',
  'delay-[296ms]',
  'delay-[428ms]',
  'delay-[516ms]',
] as const;

/** Matches `/products` catalog section strip (hero overlap + scroll padding). */
export const UPCOMING_SCROLL_CONTAINER_CLASS_NAME =
  'scrollbar-hide mt-3 overflow-x-auto overflow-y-visible overscroll-x-contain max-sm:snap-x max-sm:snap-mandatory max-sm:pb-14 pb-10 max-sm:pt-[7.5rem] pt-[5.5rem] sm:mt-6 sm:pb-12 sm:pt-[6rem] lg:pb-14 lg:pt-[5.75rem]';
