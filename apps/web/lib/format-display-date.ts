/** UI dates: day first, then month, then year. */
const DISPLAY_DATE_LOCALE = 'en-GB';

function toDisplayDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}

/** e.g. 09/07/2026 */
export function formatDisplayDate(value: Date | string | number): string {
  return new Intl.DateTimeFormat(DISPLAY_DATE_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(toDisplayDate(value));
}

/** e.g. 09/07/2026, 14:30 */
export function formatDisplayDateTime(value: Date | string | number): string {
  return new Intl.DateTimeFormat(DISPLAY_DATE_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(toDisplayDate(value));
}

/** e.g. 9 Jul (charts, compact labels) */
export function formatDisplayDateShort(value: Date | string | number): string {
  return new Intl.DateTimeFormat(DISPLAY_DATE_LOCALE, {
    day: 'numeric',
    month: 'short',
  }).format(toDisplayDate(value));
}
