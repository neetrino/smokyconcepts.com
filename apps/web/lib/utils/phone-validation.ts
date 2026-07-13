/**
 * Same rule as checkout: optional leading +, then 8–15 digits (no spaces).
 */
export const PHONE_NUMBER_PATTERN = /^\+?[0-9]{8,15}$/;

const PHONE_INPUT_DISALLOWED = /[^\d+]/g;

/**
 * Keeps digits and at most one leading `+` (paste-safe for profile / checkout-aligned fields).
 */
export function sanitizePhoneNumberInput(value: string): string {
  const stripped = value.replace(PHONE_INPUT_DISALLOWED, '');
  if (!stripped.includes('+')) {
    return stripped;
  }
  const withoutPlus = stripped.replace(/\+/g, '');
  return stripped.startsWith('+') ? `+${withoutPlus}` : withoutPlus;
}

/**
 * True when the value matches the shared checkout / profile phone format.
 * Empty string is not valid (callers decide if empty is allowed).
 */
export function isValidPhoneNumber(phone: string): boolean {
  return PHONE_NUMBER_PATTERN.test(phone.trim());
}
