/** Figma header (node 6513:232) — layout and asset paths */
export const HEADER_HEIGHT_PX = 64;
export const HEADER_SWITCHER_GAP_PX = 8;
export const HEADER_UTILITIES_GAP_PX = 16;

export const HEADER_ASSET_PATHS = {
  currencyBanknote: '/assets/header/currency-banknote.svg',
  globe: '/assets/header/globe.svg',
  bag: '/assets/header/bag.svg',
  account: '/assets/header/account.svg',
  logo: '/assets/header/logo.svg',
} as const;

export const HEADER_LABEL_CLASS =
  'text-[15px] font-normal uppercase tracking-[0.1em] text-[#dcc090]';

export const HEADER_SWITCHER_PILL_CLASS =
  'flex h-[2.125rem] min-w-[11.9375rem] items-center rounded-[0.9375rem] border border-solid border-[#dcc090] py-[0.4375rem] pl-[1.125rem] pr-[0.9375rem] font-[family-name:var(--font-montserrat)]';

/** Cart / account — same row height as locale switcher pill (34px) */
export const HEADER_ACTION_HIT_CLASS =
  'inline-flex h-[2.125rem] min-w-[2.125rem] shrink-0 items-center justify-center transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcc090]';

/** Cart / account icons — slightly larger than switcher globe (24px) */
export const HEADER_ACTION_ICON_CLASS = 'size-6 object-contain';

export const HEADER_BAG_ICON_CLASS = 'h-6 w-[1.3125rem] object-contain';

export const HEADER_UTILITIES_ROW_CLASS = 'flex items-center';
