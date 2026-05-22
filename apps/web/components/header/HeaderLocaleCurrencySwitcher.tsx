'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import { CURRENCIES, getStoredCurrency, setStoredCurrency, type CurrencyCode } from '../../lib/currency';
import { LANGUAGES, type LanguageCode, getStoredLanguage, setStoredLanguage } from '../../lib/language';
import {
  HEADER_ASSET_PATHS,
  HEADER_LABEL_CLASS,
  HEADER_SWITCHER_GAP_PX,
  HEADER_SWITCHER_PILL_CLASS,
} from './header.constants';

type SwitcherVariant = 'header' | 'drawer';
type OpenPanel = 'currency' | 'language' | null;

const CURRENCY_OPTIONS = Object.keys(CURRENCIES) as CurrencyCode[];

interface HeaderLocaleCurrencySwitcherProps {
  variant?: SwitcherVariant;
}

function displayLanguageCode(lang: LanguageCode): LanguageCode {
  return lang === 'ka' ? 'en' : lang;
}

function HeaderIcon({ src, alt, className }: { src: string; alt: string; className: string }) {
  return <img src={src} alt={alt} className={className} aria-hidden />;
}

/** Down chevron for language dropdown (Figma Arrow 7 — points down, not right) */
function LanguageChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width={11}
      height={6}
      viewBox="0 0 11 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path
        d="M1 1L5.5 5L10 1"
        stroke="#DCC090"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Figma separator — forward slash between currency and language */
function SwitcherDivider() {
  return (
    <span className={`${HEADER_LABEL_CLASS} shrink-0 leading-none`} aria-hidden>
      /
    </span>
  );
}

function DropdownPanel({
  children,
  align,
}: {
  children: ReactNode;
  align: 'left' | 'right';
}) {
  return (
    <div
      className={`absolute top-full z-[60] mt-2 min-w-[10rem] overflow-hidden rounded-lg border border-[#dcc090]/35 bg-[#122a26] py-1 shadow-2xl ${
        align === 'left' ? 'left-0' : 'right-0'
      }`}
      role="listbox"
    >
      {children}
    </div>
  );
}

/**
 * Combined currency + language control matching Figma header switcher pill.
 */
export function HeaderLocaleCurrencySwitcher({ variant = 'header' }: HeaderLocaleCurrencySwitcherProps) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>('AMD');
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const rootRef = useRef<HTMLDivElement>(null);
  const isDrawer = variant === 'drawer';

  useEffect(() => {
    setCurrentCurrency(getStoredCurrency());
    setCurrentLang(displayLanguageCode(getStoredLanguage()));

    const syncCurrency = () => setCurrentCurrency(getStoredCurrency());
    const syncLanguage = () => setCurrentLang(displayLanguageCode(getStoredLanguage()));

    window.addEventListener('currency-updated', syncCurrency);
    window.addEventListener('language-updated', syncLanguage);
    return () => {
      window.removeEventListener('currency-updated', syncCurrency);
      window.removeEventListener('language-updated', syncLanguage);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePanel = (panel: OpenPanel) => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  };

  const changeCurrency = (code: CurrencyCode) => {
    if (code === currentCurrency) {
      setOpenPanel(null);
      return;
    }
    setStoredCurrency(code);
    setCurrentCurrency(code);
    setOpenPanel(null);
  };

  const changeLanguage = (langCode: LanguageCode) => {
    const display = displayLanguageCode(langCode);
    if (currentLang === display) {
      setOpenPanel(null);
      return;
    }
    setCurrentLang(display);
    setStoredLanguage(langCode);
    setOpenPanel(null);
  };

  const currencyMenu = (
    <>
      {CURRENCY_OPTIONS.map((code) => {
        const isActive = currentCurrency === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => changeCurrency(code)}
            disabled={isActive}
            className={`flex w-full items-center justify-between border-l-4 px-4 py-2.5 text-left text-xs uppercase tracking-[0.12em] transition-all ${
              isActive
                ? 'cursor-default border-[#dcc090]/60 bg-[#dcc090]/15 font-extrabold text-[#dcc090]'
                : 'cursor-pointer border-transparent font-bold text-[#dcc090]/85 hover:bg-white/5 hover:text-[#dcc090]'
            }`}
          >
            <span>{code}</span>
            <span className="text-[0.75rem] normal-case">{CURRENCIES[code].symbol}</span>
          </button>
        );
      })}
    </>
  );

  const languageMenu = (
    <>
      {Object.values(LANGUAGES)
        .filter((lang) => lang.code !== 'ka')
        .map((lang) => {
          const isActive = currentLang === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => changeLanguage(lang.code)}
              disabled={isActive}
              className={`w-full border-l-4 px-4 py-2.5 text-left text-sm transition-all ${
                isActive
                  ? 'cursor-default border-[#dcc090]/60 bg-[#dcc090]/15 font-extrabold text-[#dcc090]'
                  : 'cursor-pointer border-transparent font-bold text-[#dcc090]/85 hover:bg-white/5 hover:text-[#dcc090]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span>{lang.nativeName}</span>
                <span className="text-xs uppercase tracking-[0.12em]">{lang.code.toUpperCase()}</span>
              </div>
            </button>
          );
        })}
    </>
  );

  if (isDrawer) {
    return (
      <div ref={rootRef} className="relative w-full">
        <button
          type="button"
          onClick={() => togglePanel('currency')}
          aria-expanded={openPanel === 'currency'}
          className="flex w-full items-center gap-3 border-t border-white/10 py-4 text-[#dcc090]"
        >
          <HeaderIcon src={HEADER_ASSET_PATHS.currencyBanknote} alt="" className="h-[0.9375rem] w-6 object-contain" />
          <span className={`${HEADER_LABEL_CLASS} font-extrabold`}>{currentCurrency}</span>
        </button>
        {openPanel === 'currency' ? (
          <div className="mt-1 overflow-hidden rounded-lg border border-white/10 bg-[#0d1e1b] py-1">{currencyMenu}</div>
        ) : null}
        <button
          type="button"
          onClick={() => togglePanel('language')}
          aria-expanded={openPanel === 'language'}
          className="flex w-full items-center gap-3 border-t border-white/10 py-4 text-[#dcc090]"
        >
          <HeaderIcon src={HEADER_ASSET_PATHS.globe} alt="" className="size-5 object-contain" />
          <span className={`${HEADER_LABEL_CLASS} font-extrabold`}>{LANGUAGES[currentLang].code.toUpperCase()}</span>
          <LanguageChevronDown open={openPanel === 'language'} />
        </button>
        {openPanel === 'language' ? (
          <div className="mt-1 overflow-hidden rounded-lg border border-white/10 bg-[#0d1e1b] py-1">{languageMenu}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <div className={HEADER_SWITCHER_PILL_CLASS} style={{ gap: HEADER_SWITCHER_GAP_PX }}>
        <div className="relative">
          <button
            type="button"
            onClick={() => togglePanel('currency')}
            aria-expanded={openPanel === 'currency'}
            aria-haspopup="listbox"
            className="flex items-center gap-[3px] transition-opacity hover:opacity-90"
            aria-label="Select currency"
          >
            <HeaderIcon
              src={HEADER_ASSET_PATHS.currencyBanknote}
              alt=""
              className="h-[0.9375rem] w-6 shrink-0 object-contain object-left"
            />
            <span className={HEADER_LABEL_CLASS}>{currentCurrency}</span>
          </button>
          {openPanel === 'currency' ? <DropdownPanel align="left">{currencyMenu}</DropdownPanel> : null}
        </div>
        <SwitcherDivider />
        <div className="relative">
          <button
            type="button"
            onClick={() => togglePanel('language')}
            aria-expanded={openPanel === 'language'}
            aria-haspopup="listbox"
            className="flex items-center gap-1.5 pl-0 transition-opacity hover:opacity-90"
            aria-label="Select language"
          >
            <HeaderIcon src={HEADER_ASSET_PATHS.globe} alt="" className="size-5 shrink-0 object-contain" />
            <span className={HEADER_LABEL_CLASS}>{LANGUAGES[currentLang].code.toUpperCase()}</span>
            <LanguageChevronDown open={openPanel === 'language'} />
          </button>
          {openPanel === 'language' ? <DropdownPanel align="right">{languageMenu}</DropdownPanel> : null}
        </div>
      </div>
    </div>
  );
}
