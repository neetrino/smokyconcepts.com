// Catalog variant prices are stored in AMD (admin input is dram, saved as-is).
// Checkout and orders still use USD; convert at boundaries with catalogPriceToUsd.

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  AMD: { code: 'AMD', symbol: '֏', name: 'Armenian Dram', rate: 400 },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', rate: 1 },
} as const;

/** Admin reports/orders totals base display currency (stored data is mostly USD). */
export const ADMIN_PRICE_CURRENCY = 'AMD' as const;
/** Admin add/edit product form input currency. */
export const ADMIN_PRODUCT_INPUT_CURRENCY = 'AMD' as const;
/** Persisted product variant / catalog list price currency. */
export const CATALOG_STORE_CURRENCY = 'AMD' as const;
/**
 * Legacy rows stored variant.price as USD before AMD storage.
 * Values at or below this (USD) are converted to AMD on read until re-saved or migrated.
 */
export const LEGACY_USD_CATALOG_PRICE_MAX = 200;

export type CurrencyCode = keyof typeof CURRENCIES;

const LEGACY_ORDER_DRAM_CODE = 'AMD';
/** Armenian dram units per 1 USD — only for persisted orders with totals in AMD. */
const LEGACY_AMD_PER_USD = 400;

const CURRENCY_STORAGE_KEY = 'shop_currency';
const CURRENCY_RATES_STORAGE_KEY = 'shop_currency_rates';
const DEFAULT_CURRENCY_CODE: CurrencyCode = 'AMD';
const DEFAULT_CURRENCY_RATES: Record<CurrencyCode, number> = {
  AMD: 1,
  USD: 1 / LEGACY_AMD_PER_USD,
  RUB: 0.2,
};
let canReadClientCurrencyStorage = false;

function isCurrencyCode(value: string): value is CurrencyCode {
  return value in CURRENCIES;
}

function normalizeCurrencyRates(rawRates: Partial<Record<CurrencyCode, number>> | undefined): Record<CurrencyCode, number> {
  const normalized: Record<CurrencyCode, number> = { ...DEFAULT_CURRENCY_RATES };
  normalized.AMD = 1;

  if (!rawRates) {
    return normalized;
  }

  (Object.keys(CURRENCIES) as CurrencyCode[]).forEach((code) => {
    if (code === 'AMD') {
      return;
    }
    const raw = rawRates[code];
    if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
      normalized[code] = raw;
    }
  });

  return normalized;
}

function getStoredCurrencyRates(): Record<CurrencyCode, number> {
  if (typeof window === 'undefined' || !canReadClientCurrencyStorage) {
    return DEFAULT_CURRENCY_RATES;
  }
  try {
    const raw = localStorage.getItem(CURRENCY_RATES_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_CURRENCY_RATES;
    }
    const parsed = JSON.parse(raw) as Partial<Record<CurrencyCode, number>>;
    return normalizeCurrencyRates(parsed);
  } catch {
    return DEFAULT_CURRENCY_RATES;
  }
}

/**
 * Enable localStorage-backed currency reads after hydration.
 * Keeps SSR and first client render deterministic to avoid hydration mismatches.
 */
export function enableClientCurrencyStorageReads(): void {
  canReadClientCurrencyStorage = true;
}

function setStoredCurrencyRates(rates: Partial<Record<CurrencyCode, number>>): void {
  if (typeof window === 'undefined') return;
  const normalized = normalizeCurrencyRates(rates);
  localStorage.setItem(CURRENCY_RATES_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event('currency-rates-updated'));
  window.dispatchEvent(new Event('currency-updated'));
}

export function getStoredCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY_CODE;
  try {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY)?.toUpperCase();
    if (stored && isCurrencyCode(stored)) {
      return stored;
    }
    localStorage.setItem(CURRENCY_STORAGE_KEY, DEFAULT_CURRENCY_CODE);
  } catch {
    // ignore
  }
  return DEFAULT_CURRENCY_CODE;
}

export function setStoredCurrency(currency: CurrencyCode): void {
  if (typeof window === 'undefined') return;
  try {
    const normalizedRaw = currency.toUpperCase();
    const next = isCurrencyCode(normalizedRaw) ? normalizedRaw : DEFAULT_CURRENCY_CODE;
    localStorage.setItem(CURRENCY_STORAGE_KEY, next);
    window.dispatchEvent(new Event('currency-updated'));
  } catch (error) {
    console.error('Failed to save currency:', error);
  }
}

/**
 * Format a price in USD (base unit for the storefront is USD).
 */
export function formatPrice(price: number, _currency: CurrencyCode = 'USD'): string {
  return formatPriceInCurrency(price, 'USD');
}

export function clearCurrencyRatesCache(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CURRENCY_RATES_STORAGE_KEY);
    window.dispatchEvent(new Event('currency-rates-updated'));
    window.dispatchEvent(new Event('currency-updated'));
  }
}

/**
 * Load exchange rates from admin settings.
 */
export async function initializeCurrencyRates(_forceReload: boolean = false): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const response = await fetch('/api/v1/currency-rates', {
      method: 'GET',
      cache: 'no-store',
    });
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as Partial<Record<CurrencyCode, number>>;
    setStoredCurrencyRates(data);
  } catch {
    // Keep defaults on network failure.
  }
}

export function convertPrice(price: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode): number {
  if (fromCurrency === toCurrency) {
    return price;
  }

  const rates = getStoredCurrencyRates();
  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  if (!fromRate || !toRate || fromRate <= 0 || toRate <= 0) {
    return price;
  }

  const amdAmount = fromCurrency === 'AMD' ? price : price / fromRate;
  if (toCurrency === 'AMD') {
    return amdAmount;
  }
  return amdAmount * toRate;
}

/**
 * AMD amounts from admin forms (products, delivery zones). Uses the same live rates as storefront display.
 * Do not use {@link amountToUsd} with AMD for this — that path uses legacy fixed 400 ֏/USD for old DB rows.
 */
export function adminInputAmdToUsd(amountAmd: number): number {
  return convertPrice(amountAmd, ADMIN_PRODUCT_INPUT_CURRENCY, 'USD');
}

/** Round dram amounts for catalog storage and AMD display. */
export function roundCatalogAmd(amount: number): number {
  if (!Number.isFinite(amount)) {
    return 0;
  }
  return Math.max(0, Math.round(amount));
}

/** Fixed thousands separator — avoids Node vs browser `Intl` hydration mismatches. */
const AMD_THOUSANDS_SEPARATOR = ' ';

/**
 * Deterministic AMD integer formatting for SSR and client (e.g. `34 909`).
 */
export function formatAmdIntegerDisplay(amount: number): string {
  const value = roundCatalogAmd(amount);
  const digits = String(value);
  if (digits.length <= 3) {
    return digits;
  }
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, AMD_THOUSANDS_SEPARATOR);
}

/** Admin product form → DB variant.price (AMD integer). */
export function normalizeAdminProductPriceInput(amountAmd: number): number {
  return roundCatalogAmd(amountAmd);
}

function isLegacyUsdCatalogStoredPrice(stored: number): boolean {
  if (!(stored > 0) || !Number.isFinite(stored)) {
    return false;
  }
  // Admin product prices are saved as rounded AMD integers.
  // Keep integer values as AMD to prevent false legacy-USD inflation
  // (e.g. 10 AMD being rendered as 4,000 AMD).
  if (Number.isInteger(stored)) {
    return false;
  }
  return stored <= LEGACY_USD_CATALOG_PRICE_MAX;
}

/**
 * DB variant.price → storefront/catalog AMD (handles legacy USD rows).
 */
export function catalogPriceForStorefront(stored: number): number {
  const amount = Number(stored);
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }
  if (isLegacyUsdCatalogStoredPrice(amount)) {
    return roundCatalogAmd(convertPrice(amount, 'USD', CATALOG_STORE_CURRENCY));
  }
  return roundCatalogAmd(amount);
}

function legacyDramToUsd(amount: number): number {
  return amount / LEGACY_AMD_PER_USD;
}

/**
 * Catalog / cart snapshot unit price (AMD) → USD for checkout totals.
 */
export function catalogPriceToUsd(amountAmd: number): number {
  return convertPrice(amountAmd, CATALOG_STORE_CURRENCY, 'USD');
}

/**
 * Storefront catalog / PDP: USD without redundant “.00” (e.g. $45 not $45.00).
 * Keeps up to 2 decimals when needed (e.g. $45.99).
 */
export function formatCatalogPrice(amountAmd: number, displayCurrency?: CurrencyCode): string {
  const currency = displayCurrency ?? (typeof window === 'undefined' ? DEFAULT_CURRENCY_CODE : getStoredCurrency());
  const convertedAmount =
    currency === 'AMD'
      ? roundCatalogAmd(amountAmd)
      : convertPrice(amountAmd, CATALOG_STORE_CURRENCY, currency);
  if (currency === 'AMD') {
    return `${formatAmdIntegerDisplay(convertedAmount)} ֏`;
  }
  if (currency === 'RUB') {
    const formatted = new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(convertedAmount);
    return `₽ ${formatted}`;
  }
  const locale = 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(convertedAmount);
}

/**
 * Convert a persisted order/cart total field to USD (legacy AMD rows only).
 */
export function amountToUsd(amount: number, storedCurrency: string | undefined): number {
  const c = (storedCurrency ?? 'USD').trim().toUpperCase();
  if (c === LEGACY_ORDER_DRAM_CODE) {
    return legacyDramToUsd(amount);
  }
  if (isCurrencyCode(c)) {
    return convertPrice(amount, c, 'USD');
  }
  return amount;
}

/**
 * Order/checkout parity: AMD stays AMD (live rate → USD), USD stays USD.
 * Mislabeled legacy rows: `currency: USD` with catalog-scale AMD integers (> {@link LEGACY_USD_CATALOG_PRICE_MAX}).
 * Do not use {@link amountToUsd} for those — it treats AMD code with a fixed 400 rate or leaves large "USD" as-is.
 */
export function persistedOrderMoneyToUsd(
  amount: number,
  storedCurrency: string | undefined
): number {
  const normalized = Number(amount);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return 0;
  }
  const code = (storedCurrency ?? 'USD').trim().toUpperCase();
  if (code === LEGACY_ORDER_DRAM_CODE) {
    return adminInputAmdToUsd(normalized);
  }
  if (code === 'USD' && normalized > LEGACY_USD_CATALOG_PRICE_MAX) {
    return catalogPriceToUsd(normalized);
  }
  if (code === 'USD') {
    return normalized;
  }
  if (isCurrencyCode(code)) {
    return convertPrice(normalized, code, 'USD');
  }
  return normalized;
}

/** Checkout order summary: USD base → user display currency (AMD / USD / RUB). */
export function formatStorefrontUsdAmount(
  amountUsd: number,
  displayCurrency: CurrencyCode
): string {
  return formatPriceInCurrency(convertPrice(amountUsd, 'USD', displayCurrency), displayCurrency);
}

function usdToDisplayCurrency(amountUsd: number, displayCurrency: string): number {
  const code = displayCurrency.trim().toUpperCase();
  if (isCurrencyCode(code)) {
    return convertPrice(amountUsd, 'USD', code);
  }
  return amountUsd;
}

/** Format a raw order line amount for admin (normalizes legacy AMD, displays in {@link ADMIN_PRICE_CURRENCY}). */
export function formatAdminOrderAmount(amount: number, storedCurrency?: string): string {
  const amountUsd = persistedOrderMoneyToUsd(amount, storedCurrency);
  return formatPriceInCurrency(usdToDisplayCurrency(amountUsd, ADMIN_PRICE_CURRENCY), ADMIN_PRICE_CURRENCY);
}

export function formatStoredMoney(
  amount: number,
  storedCurrency: string | undefined,
  displayCurrency: string = 'USD',
): string {
  const amountUsd = amountToUsd(amount, storedCurrency);
  return formatPriceInCurrency(usdToDisplayCurrency(amountUsd, displayCurrency), displayCurrency);
}

/** Format admin amounts that are stored in USD using admin display currency and live rates. */
export function formatAdminUsdAmount(amountUsd: number): string {
  return formatStoredMoney(amountUsd, 'USD', ADMIN_PRICE_CURRENCY);
}

/** Format catalog variant price for admin UI (DB AMD, legacy USD rows normalized). */
export function formatAdminCatalogPrice(stored: number): string {
  return formatPriceInCurrency(catalogPriceForStorefront(stored), ADMIN_PRICE_CURRENCY);
}

export const STORE_PRICE_CURRENCY: CurrencyCode = DEFAULT_CURRENCY_CODE;

export function formatStorePriceForDisplay(amountUsd: number, _displayCurrency: CurrencyCode = 'USD'): string {
  const currency = typeof window === 'undefined' ? DEFAULT_CURRENCY_CODE : getStoredCurrency();
  const converted = convertPrice(amountUsd, 'USD', currency);
  return formatPriceInCurrency(converted, currency);
}

export function formatPriceInCurrency(price: number, currency: string = 'USD'): string {
  const code = currency.trim().toUpperCase();
  if (code === 'AMD') {
    return `${formatAmdIntegerDisplay(price)} ֏`;
  }
  if (code === 'RUB') {
    const formatted = new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
    return `₽ ${formatted}`;
  }
  const locale = 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }
}
