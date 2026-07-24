/** Panel slide in — keep in sync with `sizeModalPanelClass` enter branch */
export const SIZE_MODAL_PANEL_ENTER_DURATION_MS = 480;

/** Panel slide out — slightly snappier than enter */
export const SIZE_MODAL_PANEL_EXIT_DURATION_MS = 420;

/** Panel slides immediately on close — inner content stays visible and moves with it */
export const SIZE_MODAL_PANEL_EXIT_DELAY_MS = 0;

/** Backdrop fade in */
export const SIZE_MODAL_BACKDROP_ENTER_DURATION_MS = 380;

/** Backdrop fade out */
export const SIZE_MODAL_BACKDROP_EXIT_DURATION_MS = 320;

export const SIZE_MODAL_BACKDROP_EXIT_DELAY_MS = 48;

/** Chrome blocks (title, search) */
export const SIZE_MODAL_BLOCK_ENTER_DURATION_MS = 420;

/** Catalog body enter only — on exit the panel carries content out without a separate fade */
export const SIZE_MODAL_CONTENT_ENTER_DURATION_MS = 420;

/** Stagger: header → search → body on open; reversed on close */
export const SIZE_MODAL_BLOCK_ENTER_DELAY_HEADER_MS = 90;

export const SIZE_MODAL_BLOCK_ENTER_DELAY_SEARCH_MS = 160;

export const SIZE_MODAL_BLOCK_ENTER_DELAY_BODY_MS = 220;

/** Unmount after the longest close transition finishes */
export const SIZE_MODAL_EXIT_DURATION_MS = Math.max(
  SIZE_MODAL_PANEL_EXIT_DELAY_MS + SIZE_MODAL_PANEL_EXIT_DURATION_MS,
  SIZE_MODAL_BACKDROP_EXIT_DELAY_MS + SIZE_MODAL_BACKDROP_EXIT_DURATION_MS
);

/** Instant close when user prefers reduced motion */
export const SIZE_MODAL_REDUCED_MOTION_EXIT_MS = 0;
