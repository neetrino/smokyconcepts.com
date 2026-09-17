/** Matches Card `rounded-2xl` — corner radius on the sticky header row. */
export const PRODUCTS_TABLE_HEADER_TH_STICKY_CLASS =
  'sticky top-16 z-30 bg-[#122a26] shadow-[0_4px_8px_rgba(18,42,38,0.18)]' as const;

export const PRODUCTS_TABLE_HEADER_TH_STICKY_FIRST_CLASS =
  'sticky top-16 z-30 bg-[#122a26] shadow-[0_4px_8px_rgba(18,42,38,0.18)] rounded-tl-2xl' as const;

export const PRODUCTS_TABLE_HEADER_TH_STICKY_LAST_CLASS =
  'sticky top-16 z-30 bg-[#122a26] shadow-[0_4px_8px_rgba(18,42,38,0.18)] rounded-tr-2xl' as const;

export const PRODUCTS_TABLE_HEADER_TEXT_CLASS =
  'text-xs font-semibold text-[#dcc090] uppercase tracking-wider' as const;

/** Compact stock cell — one line so variant chips do not force table scroll. */
export const PRODUCTS_TABLE_STOCK_CELL_CLASS = 'max-w-[9.5rem] px-3 py-4' as const;

export const PRODUCTS_TABLE_STOCK_LINE_CLASS =
  'truncate text-[11px] leading-4 text-[#414141]/70' as const;
