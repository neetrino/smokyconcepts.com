/** Minimum table width so columns do not overlap on narrow viewports (horizontal scroll). */
export const ADMIN_ORDERS_TABLE_MIN_WIDTH_CLASS = 'min-w-[56rem]' as const;

export const ADMIN_ORDERS_TABLE_SCROLL_CLASS = 'overflow-x-auto' as const;

/**
 * Single sticky header on desktop only. Per-`th` sticky (products table) stacks and overlaps
 * ORDER # when the table scrolls horizontally on mobile.
 */
export const ADMIN_ORDERS_TABLE_HEAD_CLASS =
  'bg-[#122a26] lg:sticky lg:top-16 lg:z-20 lg:shadow-[0_4px_8px_rgba(18,42,38,0.18)]' as const;

export const ADMIN_ORDERS_TABLE_TH_CLASS = 'bg-[#122a26]' as const;

export const ADMIN_ORDERS_TABLE_TH_FIRST_CLASS = 'rounded-tl-2xl bg-[#122a26]' as const;

export const ADMIN_ORDERS_TABLE_TH_LAST_CLASS = 'rounded-tr-2xl bg-[#122a26]' as const;