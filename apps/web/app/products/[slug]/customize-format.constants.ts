/** Figma Product Page 1:8388 — customize format row (nodes 1:8510–1:8520). */

export const CUSTOMIZE_FORMAT_ASSETS = {
  chevronSrc: '/assets/product/customize/format-chevron.svg',
  boldSrc: '/assets/product/customize/format-bold.svg',
  italicSrc: '/assets/product/customize/format-italic.svg',
  underlineSrc: '/assets/product/customize/format-underline.svg',
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
  'absolute left-0 top-full z-50 mt-0.5 overflow-hidden rounded-[6px] bg-white shadow-[0px_4px_22.5px_rgba(0,0,0,0.1)]',
  CUSTOMIZE_FONT_CONTROL_WIDTH_CLASS,
].join(' ');

export const CUSTOMIZE_FONT_DROPDOWN_OPTION_CLASS =
  'flex h-[34px] w-full items-center px-3 text-left text-[14px] leading-5 text-[#414141]';

export const CUSTOMIZE_FORMAT_CONTROL_HEIGHT_CLASS = 'h-[42px]';
export const CUSTOMIZE_FORMAT_FONT_TRIGGER_CLASS = [
  'flex h-[42px] items-center justify-between rounded-[6px] bg-white px-3',
  CUSTOMIZE_FONT_CONTROL_WIDTH_CLASS,
].join(' ');
export const CUSTOMIZE_FORMAT_BUTTON_CLASS =
  'flex h-[42px] w-[43px] shrink-0 items-center justify-center rounded-[6px] bg-white';
export const CUSTOMIZE_FORMAT_BUTTON_ACTIVE_CLASS = 'bg-[#122a26]/8';

/** Font dropdown + B/I/U — single row (Figma node 1:8510). */
export const CUSTOMIZE_FORMAT_TOOLBAR_CLASS =
  'relative flex shrink-0 flex-nowrap items-center gap-2 overflow-visible sm:gap-3';

/** Customize format row — input left, toolbar flush right. */
export const CUSTOMIZE_FORMAT_ROW_CLASS =
  'flex w-full min-w-0 flex-row items-end gap-3 overflow-visible sm:gap-6';

export const CUSTOMIZE_FORMAT_INPUT_WRAPPER_CLASS =
  'min-w-0 w-full max-w-[32%] shrink sm:max-w-[200px]';

export const CUSTOMIZE_FORMAT_ROW_SPACER_CLASS = 'min-w-0 flex-1';
