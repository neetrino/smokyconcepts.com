import { isContactPhoneAllowedCharacterSet } from '@/lib/utils/contact-phone-input';

const CUSTOM_ORDER_PHONE_MIN_LENGTH = 3;
const CUSTOM_ORDER_PHONE_MAX_LENGTH = 40;
const CUSTOM_ORDER_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isCustomOrderPhoneValid(phone: string): boolean {
  const trimmed = phone.trim();
  return (
    trimmed.length >= CUSTOM_ORDER_PHONE_MIN_LENGTH &&
    trimmed.length <= CUSTOM_ORDER_PHONE_MAX_LENGTH &&
    isContactPhoneAllowedCharacterSet(trimmed)
  );
}

export function isCustomOrderEmailValid(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.length > 0 && CUSTOM_ORDER_EMAIL_REGEX.test(trimmed);
}

export function isCustomOrderDraftValid(draft: {
  name: string;
  phone: string;
  email: string;
  description: string;
  imageDataUrl: string;
}): boolean {
  return (
    draft.name.trim().length > 0 &&
    isCustomOrderPhoneValid(draft.phone) &&
    isCustomOrderEmailValid(draft.email) &&
    draft.description.trim().length > 0 &&
    draft.imageDataUrl.trim().length > 0
  );
}
