/** Header cell background (all breakpoints). */
export const ADMIN_ORDERS_TABLE_TH_CLASS = 'bg-[#122a26]' as const;

/** Products-style sticky — desktop only (never on mobile). */
export const ADMIN_ORDERS_TABLE_TH_LG_STICKY =
  'lg:sticky lg:top-16 lg:z-30 lg:shadow-[0_4px_8px_rgba(18,42,38,0.18)]' as const;

export const ADMIN_ORDERS_TABLE_TH_FIRST_CLASS =
  `${ADMIN_ORDERS_TABLE_TH_CLASS} ${ADMIN_ORDERS_TABLE_TH_LG_STICKY} max-lg:rounded-none lg:rounded-tl-2xl` as const;

export const ADMIN_ORDERS_TABLE_TH_MIDDLE_CLASS =
  `${ADMIN_ORDERS_TABLE_TH_CLASS} ${ADMIN_ORDERS_TABLE_TH_LG_STICKY}` as const;

export const ADMIN_ORDERS_TABLE_TH_LAST_CLASS =
  `${ADMIN_ORDERS_TABLE_TH_CLASS} ${ADMIN_ORDERS_TABLE_TH_LG_STICKY} max-lg:rounded-none lg:rounded-tr-2xl` as const;

export const ADMIN_ORDERS_TABLE_CLASS =
  'w-full border-separate border-spacing-y-2 max-lg:border-spacing-0 lg:border-spacing-0 lg:table-fixed' as const;

/** Minimum width — horizontal scroll on mobile without squashing columns. */
export const ADMIN_ORDERS_TABLE_MIN_WIDTH_CLASS = 'min-w-[56rem] lg:min-w-full' as const;

/** Mobile only — overflow-x on desktop breaks sticky table headers (viewport scroll). */
export const ADMIN_ORDERS_TABLE_SCROLL_CLASS = 'max-lg:overflow-x-auto' as const;
