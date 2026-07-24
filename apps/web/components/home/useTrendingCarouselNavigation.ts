import { useCallback, useEffect, useMemo, useRef, useState, type TransitionEvent } from 'react';
import { flushSync } from 'react-dom';

import { TRACK_TRANSITION_MS } from './trendingFeatured.constants';
import {
  getTrendingDisplayIndexLogical,
  getTrendingInitialDisplayIndex,
  getTrendingMaxCloneDisplayIndex,
  isTrendingTrackTransformEnd,
  normalizeTrendingCloneDisplayIndex,
} from './trendingCarouselLoop';
import type { TrendingPage } from './trendingFeatured.types';

const SNAP_FALLBACK_MS = TRACK_TRANSITION_MS + 48;

export function useTrendingCarouselNavigation(pages: TrendingPage[], itemsLength: number) {
  const [displayIndex, setDisplayIndex] = useState(0);
  const [suppressTransition, setSuppressTransition] = useState(false);
  const displayIndexRef = useRef(displayIndex);
  const pagesCountRef = useRef(pages.length);
  const snapFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSnappingRef = useRef(false);

  const totalPages = pages.length;
  const hasMultiplePages = totalPages > 1;
  const maxDisplayIndex = getTrendingMaxCloneDisplayIndex(totalPages);
  const safeDisplayIndex =
    totalPages > 1 ? Math.min(Math.max(displayIndex, 0), maxDisplayIndex) : 0;
  const safeCurrent = getTrendingDisplayIndexLogical(safeDisplayIndex, totalPages);

  const prevIdx = totalPages > 0 ? (safeCurrent - 1 + totalPages) % totalPages : 0;
  const nextIdx = totalPages > 0 ? (safeCurrent + 1) % totalPages : 0;
  const currentLabel = pages[safeCurrent]?.categoryLabel ?? '—';
  const prevLabel = totalPages > 1 ? pages[prevIdx]?.categoryLabel ?? '' : '';
  const nextLabel = totalPages > 1 ? pages[nextIdx]?.categoryLabel ?? '' : '';

  const setDisplayIndexSynced = useCallback((value: number | ((prev: number) => number)) => {
    setDisplayIndex((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      displayIndexRef.current = next;
      return next;
    });
  }, []);

  const clearSnapFallback = useCallback(() => {
    if (snapFallbackTimerRef.current) {
      clearTimeout(snapFallbackTimerRef.current);
      snapFallbackTimerRef.current = null;
    }
  }, []);

  const applyCloneSnap = useCallback(() => {
    if (isSnappingRef.current) {
      return;
    }
    const total = pagesCountRef.current;
    const normalized = normalizeTrendingCloneDisplayIndex(displayIndexRef.current, total);
    if (normalized === null) {
      clearSnapFallback();
      return;
    }
    clearSnapFallback();
    isSnappingRef.current = true;
    flushSync(() => {
      setSuppressTransition(true);
      setDisplayIndexSynced(normalized);
    });
    requestAnimationFrame(() => {
      setSuppressTransition(false);
      isSnappingRef.current = false;
    });
  }, [setDisplayIndexSynced, clearSnapFallback]);

  const scheduleSnapFallback = useCallback(() => {
    clearSnapFallback();
    const total = pagesCountRef.current;
    if (total <= 1) {
      return;
    }
    if (normalizeTrendingCloneDisplayIndex(displayIndexRef.current, total) === null) {
      return;
    }
    snapFallbackTimerRef.current = setTimeout(() => {
      snapFallbackTimerRef.current = null;
      applyCloneSnap();
    }, SNAP_FALLBACK_MS);
  }, [applyCloneSnap, clearSnapFallback]);

  const handleTrackTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (!isTrendingTrackTransformEnd(event.nativeEvent, event.currentTarget)) {
        return;
      }
      applyCloneSnap();
    },
    [applyCloneSnap]
  );

  useEffect(() => {
    pagesCountRef.current = pages.length;
  }, [pages.length]);

  useEffect(() => {
    displayIndexRef.current = displayIndex;
  }, [displayIndex]);

  useEffect(() => {
    setSuppressTransition(false);
    isSnappingRef.current = false;
    clearSnapFallback();
    const startIndex =
      itemsLength > 0 && totalPages > 1 ? getTrendingInitialDisplayIndex(totalPages) : 0;
    displayIndexRef.current = startIndex;
    setDisplayIndex(startIndex);
  }, [itemsLength, totalPages, clearSnapFallback]);

  useEffect(() => {
    if (totalPages <= 1) {
      clearSnapFallback();
      return;
    }
    if (normalizeTrendingCloneDisplayIndex(displayIndex, totalPages) === null) {
      clearSnapFallback();
      return;
    }
    scheduleSnapFallback();
    return clearSnapFallback;
  }, [displayIndex, totalPages, scheduleSnapFallback, clearSnapFallback]);

  useEffect(() => () => clearSnapFallback(), [clearSnapFallback]);

  const advanceSlide = useCallback(
    (delta: -1 | 1) => {
      if (!hasMultiplePages) {
        return;
      }
      const total = pagesCountRef.current;
      const cloneSnap = normalizeTrendingCloneDisplayIndex(displayIndexRef.current, total);
      if (cloneSnap !== null) {
        clearSnapFallback();
        isSnappingRef.current = true;
        flushSync(() => {
          setSuppressTransition(true);
          setDisplayIndexSynced(cloneSnap);
        });
        requestAnimationFrame(() => {
          setSuppressTransition(false);
          isSnappingRef.current = false;
          setDisplayIndexSynced((prev) => prev + delta);
        });
        return;
      }
      setDisplayIndexSynced((prev) => prev + delta);
    },
    [hasMultiplePages, setDisplayIndexSynced, clearSnapFallback]
  );

  const goPrev = useCallback(() => {
    advanceSlide(-1);
  }, [advanceSlide]);

  const goNext = useCallback(() => {
    advanceSlide(1);
  }, [advanceSlide]);

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
      handleTrackTransitionEnd,
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
      handleTrackTransitionEnd,
    ]
  );
}
