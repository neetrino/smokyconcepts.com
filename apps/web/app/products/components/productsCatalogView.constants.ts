import type { SortOption } from './productsCatalogView.types';

export const SECTION_ORDER = ['Classic', 'Premium', 'Atelier', 'Special'] as const;

/** rAF frames where scrollLeft must stay constant before treating smooth scroll as settled. */
export const CATALOG_SCROLL_SETTLE_STABLE_FRAMES = 4;
/** Safety cap so programmatic-scroll flag is always released even if scroll never reports settling. */
export const CATALOG_SCROLL_SETTLE_MAX_WAIT_MS = 1500;
/** Tolerance (px) when matching live scrollLeft to the target page anchor. */
export const CATALOG_SCROLL_TARGET_TOLERANCE_PX = 2;

/** Matches Tailwind `max-lg` so JS scroll offset stays in sync with strip card breakpoints. */
export const CATALOG_STRIP_PEEK_MEDIA_QUERY = '(max-width: 1023px)';

export const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'default', label: 'Sort By' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

/** Applied when a filter control has a non-default selection (desktop selects + sort). */
export const FILTER_CONTROL_ACTIVE =
  'border-[#122a26] bg-[#eef3f2] text-[#122a26] ring-2 ring-[#122a26]/40 ring-offset-2 ring-offset-[#f5f4f1]';
export const FILTER_CONTROL_INACTIVE_BORDER = 'border-transparent bg-white text-[#414141]';
/** Size opener stays on gold; only border/ring indicate active. */
export const SIZE_FILTER_BUTTON_ACTIVE =
  'border-[#122a26] bg-[#c9b07a] text-[#122a26] ring-2 ring-[#122a26]/40 ring-offset-2 ring-offset-[#f5f4f1]';
