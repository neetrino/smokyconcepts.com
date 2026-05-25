import {
  TRENDING_CARD_GAP_REM,
  TRENDING_CARD_WIDTH_REM,
  TRENDING_ITEMS_PER_PAGE,
  TRENDING_PAGE_SHIFT_REM,
} from './trendingFeaturedCarousel';

export const ITEMS_PER_PAGE = TRENDING_ITEMS_PER_PAGE;
/** Desktop card width — matches products catalog `xl:w-[13rem]`. */
export const CARD_WIDTH_REM = TRENDING_CARD_WIDTH_REM;
export const CARD_GAP_REM = TRENDING_CARD_GAP_REM;
/** Tight cluster width: 3 cards + 2 gaps (one focal page's product row). */
export const CLUSTER_INNER_REM = TRENDING_PAGE_SHIFT_REM;
/** Each track slot reserves a bit more than the cluster so adjacent (faded) clusters breathe. */
export const PAGE_FRAME_REM = CLUSTER_INNER_REM + 2;

export const XL_MEDIA_QUERY = '(min-width: 1280px)';
export const TRENDING_TRACK_BUFFER_COPIES = 3;
export const TRACK_TRANSITION_MS = 520;
export const TRACK_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const TRENDING_FEATURED_PAGE_SIZE = 100;
