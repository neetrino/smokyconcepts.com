'use client';

import { useState, useEffect, useRef } from 'react';
import { LANGUAGES, type LanguageCode, getStoredLanguage, setStoredLanguage } from '../lib/language';

const ChevronDownIcon = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type SwitcherVariant = 'header' | 'drawer';

const getDrawerLanguageColor = (isActive: boolean): string => {
  if (isActive) {
    return 'bg-[#dcc090]/15 border-[#dcc090]/50';
  }
  return 'border-transparent bg-transparent';
};

interface LanguageSwitcherHeaderProps {
  /** `drawer`: full-width row + dark submenu for mobile menu panel */
  variant?: SwitcherVariant;
}

/**
 * Language Switcher Component for Header
 * Uses only locales-based translations, no Google Translate
 */
export function LanguageSwitcherHeader({ variant = 'header' }: LanguageSwitcherHeaderProps) {
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

  const isDrawer = variant === 'drawer';

  return (
    <div className={isDrawer ? 'relative w-full' : 'relative'} ref={menuRef}>
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        aria-expanded={showMenu}
        aria-haspopup="listbox"
        className={
          isDrawer
            ? 'flex w-full items-center justify-between border-t border-white/10 py-4 text-left text-[#dcc090] transition-opacity hover:opacity-90'
            : 'flex items-center gap-1.5 rounded-md bg-transparent px-1 py-1.5 text-[#dcc090] transition-opacity hover:opacity-90 sm:gap-2 sm:px-2'
        }
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
          className={
            isDrawer
              ? 'mt-1 overflow-hidden rounded-lg border border-white/10 bg-[#0d1e1b] py-1'
              : 'absolute right-0 top-full z-[60] mt-2 w-52 overflow-hidden rounded-lg border border-[#dcc090]/35 bg-[#122a26] py-1 shadow-2xl'
          }
          role="listbox"
        >
          {Object.values(LANGUAGES)
            .filter((lang) => lang.code !== 'ka')
            .map((lang) => {
              const isActive = currentLang === lang.code;
              const drawerColorClass = getDrawerLanguageColor(isActive);

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => changeLanguage(lang.code)}
                  disabled={isActive}
                  className={`w-full border-l-4 px-4 text-left transition-all ${
                    isDrawer
                      ? `py-3 text-sm duration-150 ${
                          isActive
                            ? `${drawerColorClass} cursor-default font-semibold text-[#dcc090]`
                            : 'cursor-pointer border-transparent text-[#dcc090]/85 hover:bg-white/5'
                        }`
                      : `py-2.5 text-sm ${
                          isActive
                            ? 'cursor-default border-[#dcc090]/60 bg-[#dcc090]/15 font-extrabold text-[#dcc090]'
                            : 'cursor-pointer border-transparent font-bold text-[#dcc090]/85 hover:bg-white/5 hover:text-[#dcc090]'
                        }`
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={isActive ? 'font-semibold' : 'font-medium'}>{lang.nativeName}</span>
                    <span
                      className={`shrink-0 text-xs uppercase tracking-[0.12em] ${
                        isActive ? 'font-extrabold text-[#dcc090]' : 'text-[#dcc090]/60'
                      }`}
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
