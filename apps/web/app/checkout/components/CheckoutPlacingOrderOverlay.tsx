'use client';

import { useEffect } from 'react';
import { useTranslation } from '../../../lib/i18n-client';

const BODY_SCROLL_LOCK_CLASS = 'overflow-hidden';
const SPINNER_SIZE_REM = 5.5;
const GLASS_INSET_REM = 0.7;

interface CheckoutPlacingOrderOverlayProps {
  visible: boolean;
}

function ShoppingBagIcon() {
  return (
    <svg
      className="h-7 w-7 text-[#122a26]/85"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path
        d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 6h18" strokeLinecap="round" />
      <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round" />
    </svg>
  );
}

/** Circular loader with frosted-glass center disc and gold progress ring. */
export function CheckoutPlacingOrderGlassSpinner() {
  return (
    <div
      className="relative shrink-0"
      style={{ width: `${SPINNER_SIZE_REM}rem`, height: `${SPINNER_SIZE_REM}rem` }}
      aria-hidden
    >
      <div className="absolute inset-0 rounded-full border-2 border-[#dcc090]/22" />
      <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#c9a96e] border-r-[#dcc090]/55" />
      <div
        className="absolute flex items-center justify-center rounded-full border border-white/55 bg-white/25 shadow-[0_8px_32px_rgba(18,42,38,0.1),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-2xl backdrop-saturate-150"
        style={{
          inset: `${GLASS_INSET_REM}rem`,
        }}
      >
        <ShoppingBagIcon />
      </div>
    </div>
  );
}

/**
 * Full-screen overlay while checkout completes — only the glass spinner, no card copy.
 */
export function CheckoutPlacingOrderOverlay({ visible }: CheckoutPlacingOrderOverlayProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!visible) {
      return undefined;
    }
    document.body.classList.add(BODY_SCROLL_LOCK_CLASS);
    return () => {
      document.body.classList.remove(BODY_SCROLL_LOCK_CLASS);
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  const statusLabel = `${t('checkout.placingOrder.title')} ${t('checkout.placingOrder.subtitle')}`;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={statusLabel}
      className="fixed inset-0 z-[10001] flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-[#faf9f7]/30 backdrop-blur-[2px]" aria-hidden />

      <div className="relative animate-size-modal-block-in">
        <span className="sr-only">{statusLabel}</span>
        <CheckoutPlacingOrderGlassSpinner />
      </div>
    </div>
  );
}
