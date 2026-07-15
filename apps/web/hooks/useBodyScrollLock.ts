'use client';

import { useEffect } from 'react';

const SCROLL_LOCK_CLASS = 'scroll-locked';

const SCROLL_KEY_VALUES = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  ' ',
]);

let lockCount = 0;

type ScrollLockMode = 'events' | 'overflow';

interface SavedScrollLockState {
  mode: ScrollLockMode;
  bodyPaddingRight: string;
  scrollY: number;
  preventScroll: ((event: Event) => void) | null;
  preventKeyScroll: ((event: KeyboardEvent) => void) | null;
  resetScrollPosition: (() => void) | null;
}

let savedScrollLockState: SavedScrollLockState | null = null;

function usesStableScrollbarGutter(): boolean {
  const gutter = getComputedStyle(document.documentElement).scrollbarGutter;
  return gutter === 'stable' || gutter === 'stable both-edges';
}

function getScrollbarWidth(): number {
  if (usesStableScrollbarGutter()) {
    return 0;
  }

  return window.innerWidth - document.documentElement.clientWidth;
}

function restoreScrollPosition(scrollY: number): void {
  if (window.scrollY !== scrollY) {
    window.scrollTo(0, scrollY);
  }
}

function hasScrollableOverflow(element: HTMLElement): boolean {
  const overflowY = getComputedStyle(element).overflowY;
  const canOverflow =
    overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';
  return canOverflow && element.scrollHeight > element.clientHeight;
}

function canElementScrollByDelta(element: HTMLElement, deltaY: number): boolean {
  if (!hasScrollableOverflow(element)) {
    return false;
  }

  if (deltaY < 0) {
    return element.scrollTop > 0;
  }

  if (deltaY > 0) {
    return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
  }

  return false;
}

function findScrollableAncestorForWheel(
  node: Node | null,
  deltaY: number
): HTMLElement | null {
  let current: Node | null = node;

  while (current && current !== document.documentElement) {
    if (current instanceof HTMLElement && canElementScrollByDelta(current, deltaY)) {
      return current;
    }
    current = current.parentNode;
  }

  return null;
}

function findScrollableAncestor(node: Node | null): HTMLElement | null {
  let current: Node | null = node;

  while (current && current !== document.documentElement) {
    if (current instanceof HTMLElement && hasScrollableOverflow(current)) {
      return current;
    }
    current = current.parentNode;
  }

  return null;
}

function shouldAllowScrollEvent(event: Event): boolean {
  const target = event.target;
  if (!(target instanceof Node)) {
    return false;
  }

  if (event.type === 'wheel' && event instanceof WheelEvent) {
    return findScrollableAncestorForWheel(target, event.deltaY) !== null;
  }

  if (event.type === 'touchmove') {
    return findScrollableAncestor(target) !== null;
  }

  return false;
}

function shouldAllowKeyScroll(event: KeyboardEvent): boolean {
  const focusedNode = document.activeElement;
  if (focusedNode instanceof Node && findScrollableAncestor(focusedNode)) {
    return true;
  }

  const target = event.target;
  return target instanceof Node && findScrollableAncestor(target) !== null;
}

function createPreventScroll(scrollY: number): (event: Event) => void {
  return (event: Event) => {
    if (shouldAllowScrollEvent(event)) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }
    restoreScrollPosition(scrollY);
  };
}

function createPreventKeyScroll(scrollY: number): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    if (!SCROLL_KEY_VALUES.has(event.key)) {
      return;
    }

    if (shouldAllowKeyScroll(event)) {
      return;
    }

    event.preventDefault();
    restoreScrollPosition(scrollY);
  };
}

function createResetScrollPosition(scrollY: number): () => void {
  return () => {
    restoreScrollPosition(scrollY);
  };
}

function attachEventScrollLock(scrollY: number): {
  preventScroll: (event: Event) => void;
  preventKeyScroll: (event: KeyboardEvent) => void;
  resetScrollPosition: () => void;
} {
  const preventScroll = createPreventScroll(scrollY);
  const preventKeyScroll = createPreventKeyScroll(scrollY);
  const resetScrollPosition = createResetScrollPosition(scrollY);

  document.addEventListener('wheel', preventScroll, { passive: false });
  document.addEventListener('touchmove', preventScroll, { passive: false });
  document.addEventListener('keydown', preventKeyScroll);
  window.addEventListener('scroll', resetScrollPosition, { passive: true });

  return { preventScroll, preventKeyScroll, resetScrollPosition };
}

function detachEventScrollLock(
  preventScroll: (event: Event) => void,
  preventKeyScroll: (event: KeyboardEvent) => void,
  resetScrollPosition: () => void
): void {
  document.removeEventListener('wheel', preventScroll);
  document.removeEventListener('touchmove', preventScroll);
  document.removeEventListener('keydown', preventKeyScroll);
  window.removeEventListener('scroll', resetScrollPosition);
}

function lockBodyScroll(): void {
  if (lockCount === 0) {
    const scrollY = window.scrollY;
    const useEventLock = usesStableScrollbarGutter();

    if (useEventLock) {
      const { preventScroll, preventKeyScroll, resetScrollPosition } =
        attachEventScrollLock(scrollY);
      savedScrollLockState = {
        mode: 'events',
        bodyPaddingRight: document.body.style.paddingRight,
        scrollY,
        preventScroll,
        preventKeyScroll,
        resetScrollPosition,
      };
    } else {
      savedScrollLockState = {
        mode: 'overflow',
        bodyPaddingRight: document.body.style.paddingRight,
        scrollY,
        preventScroll: null,
        preventKeyScroll: null,
        resetScrollPosition: null,
      };

      const scrollbarWidth = getScrollbarWidth();
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      document.documentElement.classList.add(SCROLL_LOCK_CLASS);
    }
  }

  lockCount += 1;
}

function unlockBodyScroll(): void {
  lockCount = Math.max(0, lockCount - 1);

  if (lockCount > 0 || !savedScrollLockState) {
    return;
  }

  const { mode, bodyPaddingRight, scrollY, preventScroll, preventKeyScroll, resetScrollPosition } =
    savedScrollLockState;
  savedScrollLockState = null;

  if (mode === 'events' && preventScroll && preventKeyScroll && resetScrollPosition) {
    detachEventScrollLock(preventScroll, preventKeyScroll, resetScrollPosition);
  } else {
    document.documentElement.classList.remove(SCROLL_LOCK_CLASS);
  }

  document.body.style.paddingRight = bodyPaddingRight;
  restoreScrollPosition(scrollY);
}

/**
 * Locks page scroll while `isLocked` is true. With `scrollbar-gutter: stable`, uses
 * non-visual event blocking so the gutter/scrollbar does not flash during modal open.
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
