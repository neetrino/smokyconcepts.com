'use client';

import { useEffect, type ReactNode } from 'react';

import { CatalogForProductLineRow } from './CatalogForProductLineRow';

const MOBILE_FILTER_TOUCH_ROW =
  'relative w-full overflow-hidden rounded-xl bg-white shadow-[0_4px_6px_rgba(0,0,0,0.05)]';

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M7 8.5L10 11.5L13 8.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const FILTER_SECTION_ACTIVE =
  'ring-2 ring-[#122a26] ring-offset-2 ring-offset-[#F2F2F2]';

const MOBILE_FILTER_ROW_MIN_H = 'min-h-[3.25rem]';

/** Single tap target: invisible native select over the labeled row (no duplicate “All” / default in list). */
function MobileFilterNativeRow({
  ariaLabel,
  value,
  onChange,
  isActive,
  displayText,
  children,
}: {
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  isActive: boolean;
  displayText: string;
  children: ReactNode;
}) {
  const wrapClass = isActive ? `${MOBILE_FILTER_TOUCH_ROW} ${FILTER_SECTION_ACTIVE}` : MOBILE_FILTER_TOUCH_ROW;
  const titleClass = isActive ? 'text-[#122a26]' : 'text-[#333333]';
  return (
    <div className={wrapClass}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`absolute inset-0 z-10 w-full ${MOBILE_FILTER_ROW_MIN_H} cursor-pointer opacity-0`}
      >
        {children}
      </select>
      <div
        className={`pointer-events-none flex w-full items-center justify-between px-4 py-3.5 text-left ${MOBILE_FILTER_ROW_MIN_H}`}
      >
        <span className={`text-[0.9375rem] font-semibold ${titleClass}`}>{displayText}</span>
        <ChevronIcon className={`shrink-0 ${isActive ? 'text-[#122a26]' : 'text-[#414141]'}`} />
      </div>
    </div>
  );
}

export interface ProductsCatalogMobileFilterSheetProps {
  open: boolean;
  onClose: () => void;
  selectedCollection: string;
  selectedColor: string;
  selectedSort: string;
  selectedSize: string;
  collectionOptions: string[];
  colorOptions: string[];
  sortOptions: Array<{ value: string; label: string }>;
  onCollectionChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onOpenSizeCatalog: () => void;
  onClearAll: () => void;
}

export function ProductsCatalogMobileFilterSheet({
  open,
  onClose,
  selectedCollection,
  selectedColor,
  selectedSort,
  selectedSize,
  collectionOptions,
  colorOptions,
  sortOptions,
  onCollectionChange,
  onColorChange,
  onSortChange,
  onOpenSizeCatalog,
  onClearAll,
}: ProductsCatalogMobileFilterSheetProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const isCollectionActive = selectedCollection !== 'all';
  const isColorActive = selectedColor !== 'all';
  const isSortActive = selectedSort !== 'default';
  const isSizeActive = selectedSize !== 'all';

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[#F2F2F2] font-montserrat lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-filter-title"
    >
      <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <h2 id="mobile-filter-title" className="text-2xl font-bold text-[#333333]">
          Filter
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onClearAll}
            className="rounded-full border border-[#dcc090] px-3 py-1.5 text-xs font-semibold text-[#dcc090] transition-colors hover:bg-[#dcc090]/15"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#414141] transition-colors hover:bg-black/5"
            aria-label="Close filters"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
        <div className="mb-6 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
          <CatalogForProductLineRow />
        </div>

        <div className="flex flex-col gap-3">
          <MobileFilterNativeRow
            ariaLabel="Collections"
            value={selectedCollection}
            onChange={onCollectionChange}
            isActive={isCollectionActive}
            displayText={selectedCollection === 'all' ? 'Collections' : selectedCollection}
          >
            <option value="all" hidden />
            {collectionOptions
              .filter((option) => option !== 'all')
              .map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </MobileFilterNativeRow>

          <MobileFilterNativeRow
            ariaLabel="Color"
            value={selectedColor}
            onChange={onColorChange}
            isActive={isColorActive}
            displayText={selectedColor === 'all' ? 'Color' : selectedColor}
          >
            <option value="all" hidden />
            {colorOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </MobileFilterNativeRow>

          <MobileFilterNativeRow
            ariaLabel="Sort By"
            value={selectedSort}
            onChange={onSortChange}
            isActive={isSortActive}
            displayText={
              selectedSort === 'default'
                ? 'Sort By'
                : (sortOptions.find((o) => o.value === selectedSort)?.label ?? 'Sort By')
            }
          >
            <option value="default" hidden />
            {sortOptions
              .filter((option) => option.value !== 'default')
              .map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </MobileFilterNativeRow>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onOpenSizeCatalog}
            className={`flex h-12 w-full items-center rounded-xl border-2 px-4 text-left text-[0.9375rem] font-semibold transition-[box-shadow,ring,border-color] ${
              isSizeActive
                ? `${FILTER_SECTION_ACTIVE} border-[#122a26] bg-[#c9b07a] text-[#122a26]`
                : 'border-transparent bg-[#dcc090] text-[#122a26]'
            }`}
          >
            {selectedSize === 'all' ? 'Select size' : selectedSize}
          </button>
        </div>
      </div>
    </div>
  );
}
