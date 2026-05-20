/** Default when delivery location has no country (matches delivery price API). */
export const DEFAULT_SHIPPING_COUNTRY = 'Armenia';

export type ShippingAddressLike = {
  country?: string;
  countryCode?: string;
} | null | undefined;

/** Human-readable country from stored order shipping address. */
export function resolveShippingCountryLabel(address: ShippingAddressLike): string | null {
  if (!address || typeof address !== 'object') {
    return null;
  }
  const country = typeof address.country === 'string' ? address.country.trim() : '';
  if (country) {
    return country;
  }
  const code = typeof address.countryCode === 'string' ? address.countryCode.trim() : '';
  if (code) {
    return code;
  }
  return null;
}
