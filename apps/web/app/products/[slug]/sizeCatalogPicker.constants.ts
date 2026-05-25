/**
 * Offset between category *sections* (heading + first cards) on modal open.
 * Must stay small: heading uses `animate-size-modal-block-in` with fill-both, so a large delay
 * keeps later collection titles and grids invisible until the delay elapses.
 */
export const SIZE_CATALOG_CATEGORY_SECTION_STEP_MS = 72;
/** Delay before size cards animate in on non-first pages (first page shows immediately). */
export const SIZE_CARD_STAGGER_BASE_MS = 0;
/**
 * Base delay for cards when a non-first page scrolls into view (matches modal block stagger ~90ms).
 */
export const SIZE_CATALOG_PAGE_CARD_STAGGER_BASE_MS = 90;
/** Intersection ratio at which a catalog page is treated as “entered” for reveal animation. */
export const SIZE_CATALOG_PAGE_INTERSECT_VISIBLE_RATIO = 0.35;
/** Below this ratio the page is treated as left, so a later re-enter can replay the reveal. */
export const SIZE_CATALOG_PAGE_INTERSECT_HIDDEN_RATIO = 0.15;
