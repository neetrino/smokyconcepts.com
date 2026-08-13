'use client';

import { useLayoutEffect } from 'react';
import { scrollWindowToTop } from '../utils/scrollWindowToTop';

/** Next.js can restore the previous PDP scroll after the first paint. */
const SCROLL_RESTORE_RETRY_MS = 50;

/**
 * Scrolls the PDP to the top when the slug changes or loading finishes.
 * Next.js keeps window scroll when only the `[slug]` param changes.
 */
export function useScrollWindowToTop(slug: string, loading: boolean): void {
  useLayoutEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    return () => {
      history.scrollRestoration = previousRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    scrollWindowToTop();
    const frameId = window.requestAnimationFrame(scrollWindowToTop);
    const timeoutId = window.setTimeout(scrollWindowToTop, SCROLL_RESTORE_RETRY_MS);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [slug, loading]);
}
