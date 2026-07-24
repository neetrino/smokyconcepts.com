/** Desktop carousel: three fixed slots (left / center / right), advancing by one "page" of three products. */

export const TRENDING_ITEMS_PER_PAGE = 3;

/** Desktop card width — matches products catalog `xl:w-[13rem]`. */
export const TRENDING_CARD_WIDTH_REM = 13;

export const TRENDING_CARD_GAP_REM = 0.75;

/** Exact width of one trio on the desktop track (translate distance per step). */
export const TRENDING_PAGE_SHIFT_REM =
  TRENDING_CARD_WIDTH_REM * TRENDING_ITEMS_PER_PAGE +
  TRENDING_CARD_GAP_REM * (TRENDING_ITEMS_PER_PAGE - 1);

/** Viewport clip: page width + small buffer so the right card is not clipped. */
export const TRENDING_VIEWPORT_WIDTH_REM = TRENDING_PAGE_SHIFT_REM + 0.25;

/**
 * Valid `startIndex` values for each carousel "page" when showing `itemsPerPage` products in a row.
 * Mirrors a cyclic window: page k shows indices start, start+1, … (mod n).
 */
export function buildTrendingPageStartIndices(itemCount: number, itemsPerPage: number): number[] {
  if (itemCount <= 0 || itemsPerPage <= 0) {
    return [0];
  }
  const pageCount = Math.max(1, Math.ceil(itemCount / itemsPerPage));
  const starts = Array.from({ length: pageCount }, (_, pageIndex) =>
    Math.min(pageIndex * itemsPerPage, Math.max(0, itemCount - itemsPerPage))
  );
  return starts.filter((start, index, all) => index === 0 || start !== all[index - 1]);
}

/** ~ease-out cubic; duration aligned with device showcase orbit feel (~720ms). */
export const TRENDING_SLOT_TRANSITION_MS = 720;
