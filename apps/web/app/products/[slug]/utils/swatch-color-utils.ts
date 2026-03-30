const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * Returns a single valid hex token if `text` is exactly a CSS hex color.
 */
export function parseHexFromText(text: string): string | null {
  const t = text.trim();
  return HEX_COLOR_RE.test(t) ? t : null;
}

/**
 * Filters API palette entries to valid hex strings (handles stray spaces).
 * Accepts `string[]` or a JSON string array / single hex from the API.
 */
export function normalizeHexPalette(colors: unknown): string[] {
  let list: unknown = colors;

  if (typeof colors === 'string') {
    const trimmed = colors.trim();
    if (trimmed.startsWith('[')) {
      try {
        list = JSON.parse(trimmed) as unknown;
      } catch {
        const one = parseHexFromText(trimmed);
        return one ? [one] : [];
      }
    } else {
      const one = parseHexFromText(trimmed);
      return one ? [one] : [];
    }
  }

  if (!Array.isArray(list)) {
    return [];
  }

  const out: string[] = [];
  for (const c of list) {
    if (typeof c !== 'string') continue;
    const trimmed = c.trim();
    if (HEX_COLOR_RE.test(trimmed)) out.push(trimmed);
  }
  return out;
}
