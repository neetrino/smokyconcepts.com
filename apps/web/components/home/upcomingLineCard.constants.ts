/** Elevation for masonry tiles; matches catalog card token. */
export const UPCOMING_LINE_MASONRY_SHADOW = 'shadow-[0_4px_22.5px_rgba(0,0,0,0.08)]';

/** No `flex-1` — avoids stretching sibling tiles when one row card has a larger `min-h`. */
const MASONRY_INNER_BASE =
  'relative flex flex-col justify-end rounded-[1.1rem] bg-white px-2.5 pb-2 sm:rounded-[1.75rem] sm:px-5 xl:min-h-0';

export type UpcomingLineMasonryTile =
  | 'phones'
  | 'notebooks'
  | 'knives'
  | 'keys'
  | 'documents'
  | 'wallets';

export const MASONRY_INNER_BY_TILE: Record<UpcomingLineMasonryTile, string> = {
  phones: `${MASONRY_INNER_BASE} min-h-[8.25rem] pt-9 ${UPCOMING_LINE_MASONRY_SHADOW} sm:min-h-[11.25rem] sm:pb-4 sm:pt-12`,
  notebooks: `${MASONRY_INNER_BASE} min-h-[9.5rem] pt-10 ${UPCOMING_LINE_MASONRY_SHADOW} sm:min-h-[12.25rem] sm:pb-5 sm:pt-[3.35rem]`,
  knives: `${MASONRY_INNER_BASE} min-h-[11.25rem] pt-3 ${UPCOMING_LINE_MASONRY_SHADOW} sm:min-h-[14.75rem] sm:pb-5 sm:pt-6`,
  keys: `${MASONRY_INNER_BASE} min-h-[9.25rem] pt-7 ${UPCOMING_LINE_MASONRY_SHADOW} sm:min-h-[13rem] sm:pb-4 sm:pt-10`,
  documents: `${MASONRY_INNER_BASE} min-h-[6.25rem] pt-3 ${UPCOMING_LINE_MASONRY_SHADOW} sm:min-h-[9rem] sm:pb-4 sm:pt-6`,
  wallets: `${MASONRY_INNER_BASE} min-h-[8rem] pt-4 ${UPCOMING_LINE_MASONRY_SHADOW} sm:min-h-[11.25rem] sm:pb-4 sm:pt-6`,
};

export function getMasonryInnerShellClassName(tile: UpcomingLineMasonryTile): string {
  return MASONRY_INNER_BY_TILE[tile];
}

export const UPCOMING_LINE_DEFAULT_INNER_SHELL =
  'relative flex min-h-[7rem] flex-1 flex-col justify-end rounded-[1.1rem] bg-[#f3f3f3] px-2.5 pb-2 pt-9 sm:min-h-[10.5rem] sm:rounded-[1.75rem] sm:bg-white sm:px-5 sm:pb-5 sm:pt-12 xl:min-h-0';
