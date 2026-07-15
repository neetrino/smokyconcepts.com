/** Identifies which public form submitted a contact message. */
export const CONTACT_MESSAGE_SOURCES = {
  CONTACT: 'CONTACT',
  PERSONALIZE: 'PERSONALIZE',
} as const;

export type ContactMessageSource =
  (typeof CONTACT_MESSAGE_SOURCES)[keyof typeof CONTACT_MESSAGE_SOURCES];

const CONTACT_MESSAGE_SOURCE_VALUES = new Set<string>(
  Object.values(CONTACT_MESSAGE_SOURCES),
);

/** Returns a valid source or defaults to contact. */
export function normalizeContactMessageSource(
  value: unknown,
): ContactMessageSource {
  if (typeof value === 'string' && CONTACT_MESSAGE_SOURCE_VALUES.has(value)) {
    return value as ContactMessageSource;
  }
  return CONTACT_MESSAGE_SOURCES.CONTACT;
}
