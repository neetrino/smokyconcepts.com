'use client';

import { useEffect } from 'react';
import { GlassPageSpinner } from './GlassPageSpinner';

const BODY_SCROLL_LOCK_CLASS = 'overflow-hidden';

interface PageLoadingOverlayProps {
  visible: boolean;
  /** Accessible status label for screen readers. */
  label: string;
}

/**
 * Full-screen glass spinner overlay — visible until the caller clears it
 * (no fixed minimum duration).
 */
export function PageLoadingOverlay({ visible, label }: PageLoadingOverlayProps) {
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

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className="fixed inset-0 z-[10001] flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-[#faf9f7]/30 backdrop-blur-[2px]" aria-hidden />
      <div className="relative animate-size-modal-block-in">
        <span className="sr-only">{label}</span>
        <GlassPageSpinner />
      </div>
    </div>
  );
}
