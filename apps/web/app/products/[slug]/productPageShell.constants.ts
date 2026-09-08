/**
 * PDP page shell geometry shared by the live page, the full skeleton and the
 * card-preview shell, so swapping between them never shifts layout.
 */

/**
 * `overflow-x-clip` rather than `hidden`: `hidden` on one axis forces the browser to
 * compute `auto` on the other, which turns these wrappers into scroll containers and
 * shows a second vertical scrollbar next to the document one.
 */
export const PRODUCT_PAGE_BACKDROP_CLASS = 'overflow-x-clip overflow-y-visible bg-[#efefef]';

export const PRODUCT_PAGE_CONTAINER_CLASS =
  'mx-auto max-w-[1920px] overflow-x-clip overflow-y-visible px-4 pb-16 pt-2 sm:px-6 lg:px-[120px] lg:pb-24 lg:pt-5';

export const PRODUCT_PAGE_GRID_CLASS =
  'grid min-h-0 items-start gap-8 overflow-visible xl:grid-cols-[minmax(0,640px)_minmax(0,1fr)] xl:items-stretch xl:gap-11';

export const PRODUCT_PAGE_GALLERY_COLUMN_CLASS =
  'flex min-h-0 min-w-0 flex-col gap-5 overflow-visible sm:gap-6';

/** Placeholder styling for blocks whose content is still loading. */
export const SKELETON_PULSE_CLASS = 'animate-pulse rounded-lg bg-[#e4e2dc]';
