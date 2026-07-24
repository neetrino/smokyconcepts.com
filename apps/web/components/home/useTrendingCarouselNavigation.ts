import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { TRACK_TRANSITION_MS } from './trendingFeatured.constants';
import type { TrendingPage } from './trendingFeatured.types';

export function useTrendingCarouselNavigation(pages: TrendingPage[], itemsLength: number) {
  const [activeDisplayIndex, setActiveDisplayIndex] = useState(0);
  const [suppressTransition, setSuppressTransition] = useState(false);
  const wrapResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = pages.length;
  const hasMultiplePages = totalPages > 1;
  const safeDisplayIndex =
    totalPages > 1 ? Math.min(Math.max(activeDisplayIndex, 0), totalPages + 1) : 0;
  const safeCurrent =
    totalPages <= 1
      ? 0
      : safeDisplayIndex === 0
        ? totalPages - 1
        : safeDisplayIndex === totalPages + 1
          ? 0
          : safeDisplayIndex - 1;

  const prevIdx = totalPages > 0 ? (safeCurrent - 1 + totalPages) % totalPages : 0;
  const nextIdx = totalPages > 0 ? (safeCurrent + 1) % totalPages : 0;
  const currentLabel = pages[safeCurrent]?.categoryLabel ?? '—';
  const prevLabel = totalPages > 1 ? pages[prevIdx]?.categoryLabel ?? '' : '';
  const nextLabel = totalPages > 1 ? pages[nextIdx]?.categoryLabel ?? '' : '';

  useEffect(() => {
    setSuppressTransition(false);
    setActiveDisplayIndex(itemsLength > 0 && totalPages > 1 ? 1 : 0);
  }, [itemsLength, totalPages]);

  useEffect(() => {
    if (totalPages <= 1) {
      return;
    }
    if (wrapResetTimeoutRef.current) {
      clearTimeout(wrapResetTimeoutRef.current);
      wrapResetTimeoutRef.current = null;
    }

    if (safeDisplayIndex !== 0 && safeDisplayIndex !== totalPages + 1) {
      return;
    }

    const normalizedDisplayIndex = safeDisplayIndex === 0 ? totalPages : 1;
    wrapResetTimeoutRef.current = setTimeout(() => {
      setSuppressTransition(true);
      setActiveDisplayIndex(normalizedDisplayIndex);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setSuppressTransition(false));
      });
    }, TRACK_TRANSITION_MS);

    return () => {
      if (wrapResetTimeoutRef.current) {
        clearTimeout(wrapResetTimeoutRef.current);
        wrapResetTimeoutRef.current = null;
      }
    };
  }, [safeDisplayIndex, totalPages]);

  const goPrev = useCallback(() => {
    if (!hasMultiplePages || suppressTransition) {
      return;
    }
    setActiveDisplayIndex((prev) => prev - 1);
  }, [hasMultiplePages, suppressTransition]);

  const goNext = useCallback(() => {
    if (!hasMultiplePages || suppressTransition) {
      return;
    }
    setActiveDisplayIndex((prev) => prev + 1);
  }, [hasMultiplePages, suppressTransition]);

  return useMemo(
    () => ({
      safeDisplayIndex,
      safeCurrent,
      currentLabel,
      prevLabel,
      nextLabel,
      hasMultiplePages,
      suppressTransition,
      goPrev,
      goNext,
    }),
    [
      safeDisplayIndex,
      safeCurrent,
      currentLabel,
      prevLabel,
      nextLabel,
      hasMultiplePages,
      suppressTransition,
      goPrev,
      goNext,
    ],
  );
}
