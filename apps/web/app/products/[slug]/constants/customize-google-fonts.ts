/**
 * Google Fonts for product customize (loaded via batched CSS requests; values are URL-encoded).
 * `stack` is applied inline so the editor and image preview match @font-face names.
 */
export type CustomizeGoogleFontOption = {
  readonly id: string;
  readonly label: string;
  /** CSS font-family stack */
  readonly stack: string;
  /** Google Fonts CSS API v2 axis string (after family name) */
  readonly googleSpec: string;
};

/** Keep each request under typical proxy limits; 5 families per batch is safe. */
const FAMILIES_PER_STYLESHEET = 5;

export const CUSTOMIZE_GOOGLE_FONT_OPTIONS: readonly CustomizeGoogleFontOption[] = [
  {
    id: 'montserrat',
    label: 'Montserrat',
    stack: "'Montserrat', sans-serif",
    googleSpec: 'Montserrat:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600;1,700;1,800',
  },
  {
    id: 'roboto',
    label: 'Roboto',
    stack: "'Roboto', sans-serif",
    googleSpec: 'Roboto:ital,wght@0,400;0,700;1,400;1,700',
  },
  {
    id: 'open-sans',
    label: 'Open Sans',
    stack: "'Open Sans', sans-serif",
    googleSpec: 'Open+Sans:ital,wght@0,400;0,700;1,400;1,700',
  },
  {
    id: 'lato',
    label: 'Lato',
    stack: "'Lato', sans-serif",
    googleSpec: 'Lato:ital,wght@0,400;0,700;1,400;1,700',
  },
  {
    id: 'inter',
    label: 'Inter',
    stack: "'Inter', sans-serif",
    googleSpec: 'Inter:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700',
  },
  {
    id: 'poppins',
    label: 'Poppins',
    stack: "'Poppins', sans-serif",
    googleSpec: 'Poppins:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700',
  },
  {
    id: 'nunito',
    label: 'Nunito',
    stack: "'Nunito', sans-serif",
    googleSpec: 'Nunito:ital,wght@0,400;0,700;1,400;1,700',
  },
  {
    id: 'raleway',
    label: 'Raleway',
    stack: "'Raleway', sans-serif",
    googleSpec: 'Raleway:ital,wght@0,400;0,700;1,400;1,700',
  },
  {
    id: 'ubuntu',
    label: 'Ubuntu',
    stack: "'Ubuntu', sans-serif",
    googleSpec: 'Ubuntu:ital,wght@0,400;0,700;1,400;1,700',
  },
  {
    id: 'source-sans-3',
    label: 'Source Sans 3',
    stack: "'Source Sans 3', sans-serif",
    googleSpec: 'Source+Sans+3:ital,wght@0,400;0,700;1,400;1,700',
  },
  {
    id: 'dm-sans',
    label: 'DM Sans',
    stack: "'DM Sans', sans-serif",
    googleSpec: 'DM+Sans:ital,wght@0,400;0,700;1,400;1,700',
  },
  {
    id: 'rubik',
    label: 'Rubik',
    stack: "'Rubik', sans-serif",
    googleSpec: 'Rubik:ital,wght@0,400;0,700;1,400;1,700',
  },
  {
    id: 'work-sans',
    label: 'Work Sans',
    stack: "'Work Sans', sans-serif",
    googleSpec: 'Work+Sans:ital,wght@0,400;0,700;1,400;1,700',
  },
  {
    id: 'merriweather',
    label: 'Merriweather',
    stack: "'Merriweather', serif",
    googleSpec: 'Merriweather:ital,wght@0,400;0,700;1,400;1,700',
  },
  {
    id: 'playfair',
    label: 'Playfair Display',
    stack: "'Playfair Display', serif",
    googleSpec: 'Playfair+Display:ital,wght@0,400;0,700;1,400;1,700',
  },
  {
    id: 'oswald',
    label: 'Oswald',
    stack: "'Oswald', sans-serif",
    googleSpec: 'Oswald:wght@400;600;700',
  },
  {
    id: 'fira-sans',
    label: 'Fira Sans',
    stack: "'Fira Sans', sans-serif",
    googleSpec: 'Fira+Sans:ital,wght@0,400;0,700;1,400;1,700',
  },
  {
    id: 'noto-sans',
    label: 'Noto Sans',
    stack: "'Noto Sans', sans-serif",
    googleSpec: 'Noto+Sans:ital,wght@0,400;0,700;1,400;1,700',
  },
  {
    id: 'bebas-neue',
    label: 'Bebas Neue',
    stack: "'Bebas Neue', sans-serif",
    googleSpec: 'Bebas+Neue:wght@400',
  },
  {
    id: 'pacifico',
    label: 'Pacifico',
    stack: "'Pacifico', cursive",
    googleSpec: 'Pacifico:wght@400',
  },
] as const;

/**
 * Human-readable font name for order/admin UI from persisted CSS `font-family` stack.
 */
export function getCustomizeFontLabelForCssStack(stack: string | null | undefined): string {
  if (!stack?.trim()) {
    return '';
  }
  const normalized = stack.trim().replace(/\s+/g, ' ');
  const found = CUSTOMIZE_GOOGLE_FONT_OPTIONS.find(
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
 * One or more stylesheet URLs (batched) so the full catalog loads reliably.
 */
export function getCustomizeGoogleFontStylesheetHrefs(): string[] {
  const hrefs: string[] = [];
  for (let i = 0; i < CUSTOMIZE_GOOGLE_FONT_OPTIONS.length; i += FAMILIES_PER_STYLESHEET) {
    const slice = CUSTOMIZE_GOOGLE_FONT_OPTIONS.slice(i, i + FAMILIES_PER_STYLESHEET);
    const query = slice.map((f) => `family=${encodeURIComponent(f.googleSpec)}`).join('&');
    hrefs.push(`https://fonts.googleapis.com/css2?${query}&display=swap`);
  }
  return hrefs;
}
