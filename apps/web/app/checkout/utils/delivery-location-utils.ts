import { DEFAULT_SHIPPING_COUNTRY } from '../../../lib/shipping-address-display';
import type { DeliveryLocationOption } from '../hooks/useDeliveryLocations';

const ARMENIA_LABEL_HINTS = ['armenia', 'հայաստան', 'армения', 'am'] as const;

export function isArmeniaCountryLabel(country: string): boolean {
  const norm = country.trim().toLowerCase();
  if (!norm) {
    return false;
  }
  return ARMENIA_LABEL_HINTS.some((hint) => {
    if (hint === 'am') {
      return norm === 'am';
    }
    return norm === hint || norm.includes(hint);
  });
}

export function countriesMatch(selected: string, candidate: string): boolean {
  const a = selected.trim();
  const b = candidate.trim();
  if (!a || !b) {
    return false;
  }
  if (a === b) {
    return true;
  }
  if (isArmeniaCountryLabel(a) && isArmeniaCountryLabel(b)) {
    return true;
  }
  return a.localeCompare(b, undefined, { sensitivity: 'base' }) === 0;
}

export function resolveDefaultDeliveryCountry(countries: string[]): string {
  if (countries.length === 0) {
    return DEFAULT_SHIPPING_COUNTRY;
  }
  const exact = countries.find((c) => c === DEFAULT_SHIPPING_COUNTRY);
  if (exact) {
    return exact;
  }
  const insensitive = countries.find(
    (c) => c.localeCompare(DEFAULT_SHIPPING_COUNTRY, undefined, { sensitivity: 'base' }) === 0,
  );
  if (insensitive) {
    return insensitive;
  }
  const armeniaLike = countries.find((c) => isArmeniaCountryLabel(c));
  return armeniaLike ?? countries[0];
}

export function getCheckoutCountries(locations: DeliveryLocationOption[]): string[] {
  const countries = getUniqueCountries(locations);
  if (countries.length === 0) {
    return [DEFAULT_SHIPPING_COUNTRY];
  }
  return countries;
}

export function getUniqueCountries(locations: DeliveryLocationOption[]): string[] {
  const seen = new Set<string>();
  const countries: string[] = [];
  for (const loc of locations) {
    const country = loc.country?.trim();
    if (!country || seen.has(country)) {
      continue;
    }
    seen.add(country);
    countries.push(country);
  }
  return countries.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

export function filterLocationsByCountry(
  locations: DeliveryLocationOption[],
  country: string | undefined,
): DeliveryLocationOption[] {
  const selected = country?.trim();
  if (!selected) {
    return [];
  }
  return locations
    .filter((loc) => {
      const locCountry = loc.country?.trim() ?? '';
      return locCountry.length > 0 && countriesMatch(selected, locCountry);
    })
    .sort((a, b) => a.city.localeCompare(b.city, undefined, { sensitivity: 'base' }));
}
