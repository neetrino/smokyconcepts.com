'use client';

import { useEffect } from 'react';

let lockCount = 0;

interface SavedBodyStyles {
  overflow: string;
  paddingRight: string;
}

let savedBodyStyles: SavedBodyStyles | null = null;

function getScrollbarWidth(): number {
  return window.innerWidth - document.documentElement.clientWidth;
}

function lockBodyScroll(): void {
  if (lockCount === 0) {
    savedBodyStyles = {
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
    };

    const scrollbarWidth = getScrollbarWidth();
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.style.overflow = 'hidden';
  }

  lockCount += 1;
}

function unlockBodyScroll(): void {
  lockCount = Math.max(0, lockCount - 1);

  if (lockCount > 0 || !savedBodyStyles) {
    return;
  }

  document.body.style.overflow = savedBodyStyles.overflow;
  document.body.style.paddingRight = savedBodyStyles.paddingRight;
  savedBodyStyles = null;
}

/**
 * Locks page scroll while `isLocked` is true. Supports nested overlays via ref counting
 * and compensates for classic scrollbar width to avoid horizontal layout shift.
 */
export function useBodyScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) {
      return;
    }

    lockBodyScroll();

    return () => {
      unlockBodyScroll();
    };
  }, [isLocked]);
}
