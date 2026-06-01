import { CUSTOMIZE_FONT_OPTIONS } from '../constants/customize-google-fonts';
import { escapePlainTextForHtml } from './sanitize-customize-html';

export type CustomizeFormatState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  /** CSS `font-family` stack (from `CUSTOMIZE_FONT_OPTIONS`). */
  fontStack: string;
};

export function getDefaultCustomizeFormat(): CustomizeFormatState {
  const scriptFont =
    CUSTOMIZE_FONT_OPTIONS.find((option) => option.id === 'arm-allegro-u') ??
    CUSTOMIZE_FONT_OPTIONS[0];

  return {
    bold: false,
    italic: false,
    underline: false,
    fontStack: scriptFont?.stack ?? 'sans-serif',
  };
}

/**
 * Builds inline HTML for the product hero overlay from the line-input text + toolbar toggles.
 * Plain text is escaped; structure matches `sanitizeCustomizeHtml` allowances.
 */
export function buildCustomizePreviewHtml(text: string, format: CustomizeFormatState): string {
  const escaped = escapePlainTextForHtml(text.trim());
  if (!escaped) {
    return '';
  }
  let inner = escaped;
  if (format.underline) {
    inner = `<u>${inner}</u>`;
  }
  if (format.italic) {
    inner = `<em>${inner}</em>`;
  }
  if (format.bold) {
    inner = `<strong style="font-weight: 800;">${inner}</strong>`;
  }
  return `<span style="font-family: ${format.fontStack}">${inner}</span>`;
}
