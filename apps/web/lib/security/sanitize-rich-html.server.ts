/**
 * Server-side sanitizer for admin-authored rich HTML (product descriptions, tabs).
 * Allowlist-only — strips scripts, event handlers, and unsafe URLs.
 */

const MAX_RICH_HTML_LENGTH = 65_536;

const ALLOWED_TAGS = new Set([
  'a',
  'b',
  'br',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'span',
  'strong',
  'u',
  'ul',
]);

const VOID_TAGS = new Set(['br', 'hr', 'img']);

const BLOCKED_CONTENT_TAGS = ['script', 'style', 'iframe', 'object', 'embed', 'form'];

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function isSafeRichHtmlUrl(raw: string): boolean {
  const value = raw.trim();
  if (!value) {
    return false;
  }

  const lower = value.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:text/html')) {
    return false;
  }

  if (lower.startsWith('mailto:') || lower.startsWith('tel:')) {
    return true;
  }

  if (lower.startsWith('data:image/')) {
    return /^data:image\/(?:png|jpe?g|gif|webp|svg\+xml);/i.test(value);
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function stripBlockedContent(html: string): string {
  let result = html;
  for (const tag of BLOCKED_CONTENT_TAGS) {
    const pattern = new RegExp(
      `<\\s*${tag}\\b[^>]*>[\\s\\S]*?<\\s*/\\s*${tag}\\s*>`,
      'gi',
    );
    result = result.replace(pattern, '');
    result = result.replace(new RegExp(`<\\s*${tag}\\b[^>]*/?>`, 'gi'), '');
  }
  return result;
}

function readAttribute(tag: string, name: string): string | null {
  const pattern = new RegExp(
    `\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`,
    'i',
  );
  const match = pattern.exec(tag);
  if (!match) {
    return null;
  }
  return (match[2] ?? match[3] ?? match[4] ?? '').trim();
}

function sanitizeOpeningTag(tag: string, tagName: string): string {
  if (tagName === 'br' || tagName === 'hr') {
    return `<${tagName}>`;
  }

  if (tagName === 'img') {
    const src = readAttribute(tag, 'src');
    const alt = readAttribute(tag, 'alt') ?? '';
    if (!src || !isSafeRichHtmlUrl(src)) {
      return '';
    }
    return `<img src="${escapeHtmlAttribute(src)}" alt="${escapeHtmlAttribute(alt)}">`;
  }

  if (tagName === 'a') {
    const href = readAttribute(tag, 'href');
    if (!href || !isSafeRichHtmlUrl(href)) {
      return '';
    }
    return `<a href="${escapeHtmlAttribute(href)}" rel="noopener noreferrer" target="_blank">`;
  }

  return `<${tagName}>`;
}

function sanitizeRichHtmlTags(html: string): string {
  return html.replace(/<\/?[^>]+>/g, (rawTag) => {
    const tag = rawTag.trim();
    const isClosing = /^<\//.test(tag);
    const nameMatch = /^<\/?\s*([a-z0-9]+)/i.exec(tag);
    if (!nameMatch) {
      return '';
    }

    const tagName = nameMatch[1].toLowerCase();
    if (!ALLOWED_TAGS.has(tagName)) {
      return '';
    }

    if (isClosing) {
      return VOID_TAGS.has(tagName) ? '' : `</${tagName}>`;
    }

    if (/\/>$/.test(tag) && VOID_TAGS.has(tagName)) {
      return sanitizeOpeningTag(tag, tagName);
    }

    return sanitizeOpeningTag(tag, tagName);
  });
}

/**
 * Sanitizes optional rich HTML; returns `null` for empty input.
 */
export function sanitizeRichHtml(raw: string | null | undefined): string | null {
  if (raw == null || typeof raw !== 'string') {
    return null;
  }

  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return null;
  }

  let html = trimmed.slice(0, MAX_RICH_HTML_LENGTH);
  html = stripBlockedContent(html);
  html = html.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  html = sanitizeRichHtmlTags(html);
  html = html.trim();

  return html.length > 0 ? html : null;
}
