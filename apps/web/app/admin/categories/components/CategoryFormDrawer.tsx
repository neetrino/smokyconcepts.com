'use client';

import type { ReactNode } from 'react';
import { useCategoryFormDrawer } from '../hooks/useCategoryFormDrawer';

/** Side form occupies this share of the viewport on sm+ screens. */
const CATEGORY_FORM_DRAWER_WIDTH_CLASS = 'w-full sm:w-[40%] sm:min-w-[18rem]';

interface CategoryFormDrawerProps {
  isOpen: boolean;
  title: string;
  titleId: string;
  closeLabel: string;
  canClose: boolean;
  footer: ReactNode;
  children: ReactNode;
  onClose: () => void;
}

export function CategoryFormDrawer({
  isOpen,
  title,
  titleId,
  closeLabel,
  canClose,
  footer,
  children,
  onClose,
}: CategoryFormDrawerProps) {
  const { isEntered } = useCategoryFormDrawer(isOpen, onClose, canClose);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <button
        type="button"
        aria-label={closeLabel}
        className={`absolute inset-0 z-0 bg-black/50 transition-opacity duration-200 ${
          isEntered ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={canClose ? onClose : undefined}
      />

      <aside
        className={`absolute inset-y-0 right-0 z-10 flex h-full max-h-dvh min-w-0 transform flex-col overflow-hidden bg-white shadow-[-8px_0_32px_rgba(18,42,38,0.16)] transition-transform duration-200 ease-out ${CATEGORY_FORM_DRAWER_WIDTH_CLASS} ${
          isEntered ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#dcc090]/20 bg-[#122a26] px-6 py-4">
          <h3
            id={titleId}
            className="text-base font-black uppercase tracking-[0.1em] text-[#dcc090]"
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={!canClose}
            aria-label={closeLabel}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#dcc090]/60 transition-colors hover:bg-white/10 hover:text-[#dcc090] disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
          {children}
        </div>

        <div className="flex shrink-0 gap-3 border-t border-[#dcc090]/20 px-6 py-4">
          {footer}
        </div>
      </aside>
    </div>
  );
}
