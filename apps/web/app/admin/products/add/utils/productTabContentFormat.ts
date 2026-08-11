/**
 * Product storefront-tab content: line-per-item editing ↔ stacked HTML paragraphs.
 */

const STRUCTURED_HTML_TAG_RE = /<\/?(?:ul|ol|li|h[1-6]|div|table|section)\b/i;
const PARAGRAPH_OR_BREAK_RE = /<\/?(?:p|br)\b/i;

function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"');
}

/**
 * Converts stored HTML into textarea-friendly lines (one item per line).
 * Structured lists/headings stay as raw HTML for advanced editing.
 */
export function productTabHtmlToEditableText(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) {
    return '';
  }

  if (STRUCTURED_HTML_TAG_RE.test(trimmed)) {
    return trimmed;
  }

  if (!PARAGRAPH_OR_BREAK_RE.test(trimmed)) {
    return decodeBasicEntities(trimmed);
  }

  const withBreaks = trimmed
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
    .replace(/<\/?p[^>]*>/gi, '');

  return decodeBasicEntities(withBreaks)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
}

/**
 * Converts textarea lines into stacked `<p>` blocks for the storefront Product tab.
 * Structured HTML is passed through unchanged.
 */
export function editableProductTabTextToHtml(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return '';
  }

  if (STRUCTURED_HTML_TAG_RE.test(trimmed) || /<p\b/i.test(trimmed)) {
    return trimmed;
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return '';
  }

  return lines.map((line) => `<p>${escapeHtmlText(line)}</p>`).join('');
}
