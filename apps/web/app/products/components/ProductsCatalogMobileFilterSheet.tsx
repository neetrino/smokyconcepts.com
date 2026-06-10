'use client';

import { useCallback, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useSizeModalExitAnimation } from '@/hooks/useSizeModalExitAnimation';
import {
  SIZE_MODAL_BLOCK_ENTER_DELAY_BODY_MS,
  SIZE_MODAL_BLOCK_ENTER_DELAY_HEADER_MS,
  SIZE_MODAL_EXIT_DURATION_MS,
  SIZE_MODAL_REDUCED_MOTION_EXIT_MS,
} from '@/lib/size-modal-animation.constants';
import {
  sizeModalBackdropClass,
  sizeModalBlockClass,
  sizeModalBlockEnterStyle,
  sizeModalContentClass,
  sizeModalPanelClass,
} from '@/lib/size-modal-animation';
import { useTranslation } from '@/lib/i18n-client';

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

const MOBILE_FILTER_APPLY_BUTTON_CLASS =
  'flex h-12 w-full items-center justify-center rounded-lg border border-[#dcc090] bg-white text-sm font-bold uppercase tracking-[0.2em] text-[#dcc090] transition-colors hover:bg-[#dcc090]/10';

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
  onApply: () => void;
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
  onApply,
  onClearAll,
}: ProductsCatalogMobileFilterSheetProps) {
  const { t } = useTranslation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const exitDurationMs = prefersReducedMotion
    ? SIZE_MODAL_REDUCED_MOTION_EXIT_MS
    : SIZE_MODAL_EXIT_DURATION_MS;
  const { isMounted, isExiting, isEntered } = useSizeModalExitAnimation({
    isOpen: open,
    exitDurationMs,
  });
  const sheetMotion = {
    isEntered,
    isExiting,
    skipEnterAnimation: prefersReducedMotion,
  };

  const handleDismiss = useCallback(() => {
    if (isExiting) {
      return;
    }
    onClose();
  }, [isExiting, onClose]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleDismiss();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMounted, handleDismiss]);

  if (!isMounted) {
    return null;
  }

  const isCollectionActive = selectedCollection !== 'all';
  const isColorActive = selectedColor !== 'all';
  const isSortActive = selectedSort !== 'default';
  const isSizeActive = selectedSize !== 'all';

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] lg:hidden ${isExiting ? 'pointer-events-none' : ''}`}
      role="presentation"
    >
      <button
        type="button"
        className={`absolute inset-0 z-0 bg-[rgba(0,0,0,0.6)] ${sizeModalBackdropClass(sheetMotion)}`}
        aria-label={t('products.mobileFilters.close')}
        onClick={handleDismiss}
      />
      <div
        className={`absolute inset-y-0 right-0 z-10 flex h-full max-h-dvh w-full flex-col overflow-hidden bg-[#F2F2F2] font-montserrat shadow-[-8px_0_32px_rgba(0,0,0,0.12)] ${sizeModalPanelClass(sheetMotion)}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-filter-title"
        aria-hidden={isExiting}
      >
        <div
          className={`flex shrink-0 items-start justify-between gap-3 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] ${sizeModalBlockClass(sheetMotion)}`}
          style={sizeModalBlockEnterStyle(
            SIZE_MODAL_BLOCK_ENTER_DELAY_HEADER_MS,
            sheetMotion
          )}
        >
          <h2 id="mobile-filter-title" className="text-2xl font-bold text-[#333333]">
            {t('products.mobileFilters.title')}
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClearAll}
              className="rounded-full border border-[#dcc090] px-3 py-1.5 text-xs font-semibold text-[#dcc090] transition-colors hover:bg-[#dcc090]/15"
            >
              {t('products.mobileFilters.clearAll')}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#414141] transition-colors hover:bg-black/5"
              aria-label={t('products.mobileFilters.close')}
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div
          className={`flex min-h-0 flex-1 flex-col ${sizeModalContentClass(sheetMotion)}`}
          style={sizeModalBlockEnterStyle(
            SIZE_MODAL_BLOCK_ENTER_DELAY_BODY_MS,
            sheetMotion
          )}
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
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

          <div className="shrink-0 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            <button type="button" onClick={onApply} className={MOBILE_FILTER_APPLY_BUTTON_CLASS}>
              {t('products.mobileFilters.apply')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
