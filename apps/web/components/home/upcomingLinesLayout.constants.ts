/**
 * Sub-xl masonry (2×3 cards): vertical `gap-y` between rows; keep tight so tiles read as one strip.
 */
export const UPCOMING_LINES_MASONRY_STACK_CLASS = 'flex w-full flex-col gap-y-1 sm:gap-y-2 xl:hidden';
export const UPCOMING_LINES_MASONRY_ROW_CLASS = 'flex min-w-0 gap-x-2.5 sm:gap-x-3.5';
/** Row 3 — `items-end` so Documents + Wallets white tiles share one bottom edge (sub-xl). */
export const UPCOMING_LINES_MASONRY_ROW3_CLASS = `${UPCOMING_LINES_MASONRY_ROW_CLASS} items-end`;
/** Row 1 — Phones (1) wider/taller; Notebooks nudged up (Figma). */
export const MASONRY_ROW1_LEFT = 'min-w-0 flex-[0.92] sm:flex-[0.93]';
export const MASONRY_ROW1_RIGHT = 'min-w-0 flex-[1.08] sm:flex-[1.07] -translate-y-1 sm:-translate-y-1.5';
/** Row 2 — card 3 narrow/tall, card 4 wider. */
export const MASONRY_ROW2_LEFT = 'min-w-0 flex-[0.7] sm:flex-[0.74]';
export const MASONRY_ROW2_RIGHT = 'min-w-0 flex-[1.3] sm:flex-[1.26]';
/** Row 3 — Documents narrower, Wallets wider (sub-xl masonry). */
export const MASONRY_ROW3_LEFT = 'min-w-0 flex-[1.48] sm:flex-[1.44]';
export const MASONRY_ROW3_RIGHT = 'min-w-0 flex-[1.02] sm:flex-[1.06]';
/** Figma Mob — 2×2 grid; horizontal gap between cards in the same row. */
export const COVER_COLLECTIONS_MOBILE_GRID_GAP_X_CLASS = 'max-sm:gap-x-[clamp(0.5rem,4vw,1.5rem)]';
export const COVER_COLLECTIONS_MOBILE_GRID_GAP_Y_CLASS = 'max-sm:gap-y-[clamp(2.5rem,13vw,4.5rem)]';
/** Mobile: pull card grid closer to section title. */
export const COVER_COLLECTIONS_MOBILE_SECTION_GAP_CLASS = 'max-sm:gap-5';
export const COVER_COLLECTIONS_MOBILE_GRID_MARGIN_TOP_CLASS = 'max-sm:mt-0';
