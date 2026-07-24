/**
 * Product customize font options (Figma node 1:8709 — dropdown panel 1:8710).
 * `stack` is applied inline so the editor and image preview match @font-face names.
 */
export type CustomizeFontOption = {
  readonly id: string;
  readonly label: string;
  /** CSS font-family stack */
  readonly stack: string;
  /** Google Fonts CSS API v2 axis string — only for options that need a web fallback */
  readonly googleSpec?: string;
};

/** Figma 1:8710 — three font rows in the customize picker. */
export const CUSTOMIZE_FONT_OPTIONS: readonly CustomizeFontOption[] = [
  {
    id: 'times-new-roman',
    label: 'Times New Roman',
    stack: "'Times New Roman', Times, serif",
  },
  {
    id: 'segoe-ui',
    label: 'Segoe UI',
    stack: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  {
    id: 'arm-allegro-u',
    label: 'ArmAllegroU',
    stack: "'ArmAllegroU', 'Pacifico', cursive",
    googleSpec: 'Pacifico:wght@400',
  },
] as const;

/** @deprecated Use `CUSTOMIZE_FONT_OPTIONS`. */
export const CUSTOMIZE_GOOGLE_FONT_OPTIONS = CUSTOMIZE_FONT_OPTIONS;

/** @deprecated Use `CustomizeFontOption`. */
export type CustomizeGoogleFontOption = CustomizeFontOption;

/**
 * Human-readable font name for order/admin UI from persisted CSS `font-family` stack.
 */
export function getCustomizeFontLabelForCssStack(stack: string | null | undefined): string {
  if (!stack?.trim()) {
    return '';
  }
  const normalized = stack.trim().replace(/\s+/g, ' ');
  const found = CUSTOMIZE_FONT_OPTIONS.find(
    (opt) => opt.stack.replace(/\s+/g, ' ').toLowerCase() === normalized.toLowerCase()
  );
  if (found) {
    return found.label;
  }
  const quoted = normalized.match(/'([^']+)'/);
  if (quoted) {
    return quoted[1];
  }
  const first = normalized.split(',')[0]?.trim();
  return first || normalized;
}

/**
 * Stylesheet URLs for customize fonts that require a web fallback (e.g. Pacifico for ArmAllegroU).
 */
export function getCustomizeGoogleFontStylesheetHrefs(): string[] {
  const specs = CUSTOMIZE_FONT_OPTIONS.flatMap((option) =>
    option.googleSpec ? [option.googleSpec] : []
  );
  if (specs.length === 0) {
    return [];
  }
  const query = specs.map((spec) => `family=${encodeURIComponent(spec)}`).join('&');
  return [`https://fonts.googleapis.com/css2?${query}&display=swap`];
}
