import type { CSSProperties } from 'react';

import { CUSTOMIZE_FONT_OPTIONS } from '../constants/customize-google-fonts';
import { escapePlainTextForHtml } from './sanitize-customize-html';

export type CustomizeFormatState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  /** CSS `font-family` stack from `CUSTOMIZE_FONT_OPTIONS`; `null` = default UI font in the input. */
  fontStack: string | null;
};

/** Montserrat stack for the customize line input when no font is picked. */
export const CUSTOMIZE_INPUT_FONT_STACK =
  'var(--font-montserrat), Montserrat, system-ui, sans-serif';

export function getCustomizePreviewFontStack(fontStack: string | null): string {
  if (fontStack) {
    return fontStack;
  }
  const scriptFont =
    CUSTOMIZE_FONT_OPTIONS.find((option) => option.id === 'arm-allegro-u') ??
    CUSTOMIZE_FONT_OPTIONS[0];
  return scriptFont?.stack ?? 'sans-serif';
}

export function getDefaultCustomizeFormat(): CustomizeFormatState {
  return {
    bold: false,
    italic: false,
    underline: false,
    fontStack: null,
  };
}

/** Live styles for the customize text input (font + B/I toggles). */
export function getCustomizeInputStyle(format: CustomizeFormatState): CSSProperties {
  return {
    fontFamily: format.fontStack ?? CUSTOMIZE_INPUT_FONT_STACK,
    fontWeight: format.bold ? 800 : 500,
    fontStyle: format.italic ? 'italic' : 'normal',
    textDecorationLine: format.underline ? 'underline' : 'none',
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
  return `<span style="font-family: ${getCustomizePreviewFontStack(format.fontStack)}">${inner}</span>`;
}
