'use client';

import { useState, useEffect, useRef } from 'react';
import { LANGUAGES, type LanguageCode, getStoredLanguage, setStoredLanguage } from '../lib/language';

const ChevronDownIcon = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const getLanguageColor = (code: LanguageCode, isActive: boolean): string => {
  if (isActive) {
    const colors: Record<LanguageCode, string> = {
      en: 'bg-blue-50 border-blue-200',
      hy: 'bg-orange-50 border-orange-200',
      ru: 'bg-red-50 border-red-200',
      ka: 'bg-gray-100 border-gray-200',
    };
    return colors[code] || 'bg-gray-100 border-gray-200';
  }
  return 'bg-white border-transparent';
};

/**
 * Language Switcher Component for Header
 * Uses only locales-based translations, no Google Translate
 */
export function LanguageSwitcherHeader() {
  const [showMenu, setShowMenu] = useState(false);
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedLang = getStoredLanguage();
    const displayLang = storedLang === 'ka' ? 'en' : storedLang;
    if (displayLang !== currentLang) {
      setCurrentLang(displayLang);
    }

    const handleLanguageUpdate = () => {
      const newLang = getStoredLanguage();
      const displayLang = newLang === 'ka' ? 'en' : newLang;
      setCurrentLang(displayLang);
    };

    window.addEventListener('language-updated', handleLanguageUpdate);
    return () => {
      window.removeEventListener('language-updated', handleLanguageUpdate);
    };
  }, [currentLang]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const changeLanguage = (langCode: LanguageCode) => {
    if (typeof window !== 'undefined' && currentLang !== langCode) {
      setShowMenu(false);
      const displayLang = langCode === 'ka' ? 'en' : langCode;
      setCurrentLang(displayLang);
      setStoredLanguage(langCode);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        aria-expanded={showMenu}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 sm:gap-2 rounded-md bg-transparent px-1 py-1.5 text-[#dcc090] transition-opacity hover:opacity-90 sm:px-2"
      >
        <span className="text-sm font-extrabold uppercase tracking-[0.16em]">
          {LANGUAGES[currentLang].code.toUpperCase()}
        </span>
        <span className={showMenu ? 'rotate-180 transition-transform' : 'transition-transform'}>
          <ChevronDownIcon />
        </span>
      </button>
      {showMenu && (
        <div
          className="absolute top-full right-0 z-[60] mt-2 w-52 overflow-hidden rounded-lg border border-[#122a26]/10 bg-white shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
          role="listbox"
        >
          {Object.values(LANGUAGES)
            .filter((lang) => lang.code !== 'ka')
            .map((lang) => {
              const isActive = currentLang === lang.code;
              const colorClass = getLanguageColor(lang.code, isActive);

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => changeLanguage(lang.code)}
                  disabled={isActive}
                  className={`w-full border-l-4 px-4 py-3 text-left text-sm transition-all duration-150 ${
                    isActive
                      ? `${colorClass} cursor-default font-semibold text-gray-900`
                      : `cursor-pointer border-transparent text-gray-700 hover:border-gray-200 hover:bg-gray-50`
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={isActive ? 'font-semibold' : 'font-medium'}>{lang.nativeName}</span>
                    <span
                      className={`shrink-0 text-xs ${isActive ? 'font-semibold text-gray-700' : 'text-gray-500'}`}
                    >
                      {lang.code.toUpperCase()}
                    </span>
                  </div>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}
