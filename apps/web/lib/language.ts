// Language utilities
export const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  hy: { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն' },
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  ka: { code: 'ka', name: 'Georgian', nativeName: 'ქართული' },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

const LANGUAGE_STORAGE_KEY = 'shop_language';
const LANGUAGE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function isLanguageCode(value: string | undefined | null): value is LanguageCode {
  return Boolean(value && value in LANGUAGES);
}

export function parseLanguageCode(value: string | undefined | null): LanguageCode | null {
  return isLanguageCode(value) ? value : null;
}

function writeLanguageCookie(language: LanguageCode): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${LANGUAGE_STORAGE_KEY}=${language}; path=/; max-age=${LANGUAGE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function getStoredLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const parsed = parseLanguageCode(stored);
    if (parsed) {
      writeLanguageCookie(parsed);
      return parsed;
    }
  } catch {
    // Ignore errors
  }
  return 'en';
}

export function setStoredLanguage(language: LanguageCode, options?: { skipReload?: boolean }): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    writeLanguageCookie(language);
    window.dispatchEvent(new Event('language-updated'));
    // Only reload if skipReload is not true
    if (!options?.skipReload) {
      // Use a small delay to ensure state updates are visible before reload
      setTimeout(() => {
        window.location.reload();
      }, 50);
    }
  } catch (error) {
    console.error('Failed to save language:', error);
  }
}

export { LANGUAGE_STORAGE_KEY };

