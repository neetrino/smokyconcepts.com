/** Figma Product Page 1:8388 — customize format row (nodes 1:8510–1:8520). */

export const CUSTOMIZE_FORMAT_ASSETS = {
  chevronSrc: '/assets/product/customize/format-chevron.svg',
  boldSrc: '/assets/product/customize/format-bold.svg',
  italicSrc: '/assets/product/customize/format-italic.svg',
} as const;

/** ~88% of Figma px — fits PDP info column (~763px) without horizontal scroll. */
export const CUSTOMIZE_FORMAT_LAYOUT = {
  inputMaxWidthPx: 256,
  fontTriggerWidthPx: 156,
  formatButtonSizePx: 43,
  controlHeightPx: 42,
  iconSizePx: 18,
  fontLabelPx: 16,
  dropdownOptionPx: 16,
  dropdownRowHeightPx: 42,
  /** 3 options × 42px + 2 dividers (1px). */
  dropdownPanelHeightPx: 128,
} as const;

/** Font trigger + dropdown panel share the same width (Figma node 1:8710). */
export const CUSTOMIZE_FONT_CONTROL_WIDTH_CLASS = 'w-[156px] min-w-[156px] max-w-[156px]';

/** Compact font menu — fits below trigger without clipping the purchase row gap. */
export const CUSTOMIZE_FONT_DROPDOWN_LAYOUT = {
  rowHeightPx: 34,
  optionFontPx: 14,
  optionLineHeightPx: 20,
  horizontalPaddingPx: 12,
  /** 3 rows × 34px + 2 dividers (1px). */
  panelHeightPx: 104,
} as const;

export const CUSTOMIZE_FONT_DROPDOWN_PANEL_CLASS = [
  'fixed z-[130] overflow-hidden rounded-[6px] bg-white shadow-[0px_4px_22.5px_rgba(0,0,0,0.1)]',
  CUSTOMIZE_FONT_CONTROL_WIDTH_CLASS,
].join(' ');

export const CUSTOMIZE_FONT_DROPDOWN_OPTION_CLASS =
  'flex h-[34px] w-full items-center px-3 text-left text-[14px] leading-5 text-[#414141]';

export const CUSTOMIZE_FORMAT_CONTROL_HEIGHT_CLASS = 'h-[42px]';
export const CUSTOMIZE_FORMAT_FONT_TRIGGER_CLASS = [
  'flex h-[42px] items-center justify-between rounded-[6px] px-3 transition-colors',
  CUSTOMIZE_FONT_CONTROL_WIDTH_CLASS,
].join(' ');
export const CUSTOMIZE_FORMAT_BUTTON_CLASS =
  'flex h-[42px] w-[43px] shrink-0 items-center justify-center rounded-[6px] transition-colors';
/** Idle surface — mutually exclusive with active (avoid bg-white winning over active). */
export const CUSTOMIZE_FORMAT_CONTROL_IDLE_CLASS =
  'border border-transparent bg-white';
/** Font trigger / filled controls — gold outline when open (matches Save / B·I). */
export const CUSTOMIZE_FORMAT_CONTROL_ACTIVE_CLASS =
  'border border-[#dcc090] bg-white';
/** B/I idle — transparent border keeps size stable vs selected outline. */
export const CUSTOMIZE_FORMAT_TOGGLE_IDLE_CLASS =
  'border border-transparent bg-white';
/** B/I selected — gold outline like Save (no filled green). */
export const CUSTOMIZE_FORMAT_TOGGLE_ACTIVE_CLASS =
  'border border-[#dcc090] bg-white';
/** Light foreground for labels/icons on the filled active surface. */
export const CUSTOMIZE_FORMAT_CONTROL_ACTIVE_FG_CLASS = 'text-[#faf8f4]';
export const CUSTOMIZE_FORMAT_CONTROL_ACTIVE_ICON_CLASS =
  'brightness-0 invert';
/** Font trigger outline while a mandatory font pick is missing. */
export const CUSTOMIZE_FORMAT_CONTROL_INVALID_CLASS = 'ring-1 ring-red-600';
export const CUSTOMIZE_FONT_REQUIRED_HINT_CLASS =
  'mt-1 font-montserrat text-[12px] font-medium leading-4 text-red-600';

/** Toolbar + font validation hint stacked, so the hint stays under the font control. */
export const CUSTOMIZE_FORMAT_TOOLBAR_COLUMN_CLASS = 'flex min-w-0 shrink-0 flex-col';

/** Font dropdown + B/I — single row (Figma node 1:8510). */
export const CUSTOMIZE_FORMAT_TOOLBAR_CLASS =
  'relative flex shrink-0 flex-nowrap items-center gap-2 overflow-visible sm:gap-3';

/** Customize format row — mobile: input then toolbar; desktop: input left, toolbar flush right. */
export const CUSTOMIZE_FORMAT_ROW_CLASS =
  'flex w-full min-w-0 flex-col items-stretch gap-3 overflow-visible sm:flex-row sm:items-end sm:gap-6';

export const CUSTOMIZE_FORMAT_INPUT_WRAPPER_CLASS =
  'min-w-0 w-full shrink sm:max-w-[200px]';

/** Desktop-only flex spacer between input and toolbar. */
export const CUSTOMIZE_FORMAT_ROW_SPACER_CLASS = 'hidden min-w-0 flex-1 sm:block';
