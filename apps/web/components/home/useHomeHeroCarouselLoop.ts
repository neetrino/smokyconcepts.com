'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type TransitionEvent } from 'react';
import { flushSync } from 'react-dom';

import type { HomeHeroSlide } from '@/lib/types/home-hero.types';

import {
  buildHomeHeroTrackSlides,
  getHomeHeroInitialDisplayIndex,
  getHomeHeroLogicalIndex,
  isHomeHeroTrackTransformEnd,
  normalizeHomeHeroCloneDisplayIndex,
} from './homeHeroCarouselLoop';

const HERO_TRACK_TRANSITION_MS = 500;
const HERO_SNAP_FALLBACK_MS = HERO_TRACK_TRANSITION_MS + 48;

export function useHomeHeroCarouselLoop(slides: HomeHeroSlide[]) {
  const slideCount = slides.length;
  const hasMultipleSlides = slideCount > 1;
  const trackSlides = useMemo(
    () => (hasMultipleSlides ? buildHomeHeroTrackSlides(slides) : slides),
    [hasMultipleSlides, slides]
  );

  const [displayIndex, setDisplayIndex] = useState(() => getHomeHeroInitialDisplayIndex(slideCount));
  const [suppressTransition, setSuppressTransition] = useState(false);
  const displayIndexRef = useRef(displayIndex);
  const slideCountRef = useRef(slideCount);
  const snapFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSnappingRef = useRef(false);

  const logicalIndex = getHomeHeroLogicalIndex(displayIndex, slideCount);

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

    const total = slideCountRef.current;
    const normalized = normalizeHomeHeroCloneDisplayIndex(displayIndexRef.current, total);
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
    const total = slideCountRef.current;
    if (total <= 1) {
      return;
    }

    if (normalizeHomeHeroCloneDisplayIndex(displayIndexRef.current, total) === null) {
      return;
    }

    snapFallbackTimerRef.current = setTimeout(() => {
      snapFallbackTimerRef.current = null;
      applyCloneSnap();
    }, HERO_SNAP_FALLBACK_MS);
  }, [applyCloneSnap, clearSnapFallback]);

  const handleTrackTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (!isHomeHeroTrackTransformEnd(event.nativeEvent, event.currentTarget)) {
        return;
      }

      applyCloneSnap();
    },
    [applyCloneSnap]
  );

  const advanceSlide = useCallback(
    (delta: -1 | 1) => {
      if (!hasMultipleSlides) {
        return;
      }

      const total = slideCountRef.current;
      const cloneSnap = normalizeHomeHeroCloneDisplayIndex(displayIndexRef.current, total);
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
    [hasMultipleSlides, setDisplayIndexSynced, clearSnapFallback]
  );

  const goToPrevious = useCallback(() => {
    advanceSlide(-1);
  }, [advanceSlide]);

  const goToNext = useCallback(() => {
    advanceSlide(1);
  }, [advanceSlide]);

  const goToLogicalIndex = useCallback(
    (index: number) => {
      if (!hasMultipleSlides) {
        return;
      }

      setDisplayIndexSynced(index + 1);
    },
    [hasMultipleSlides, setDisplayIndexSynced]
  );

  useEffect(() => {
    slideCountRef.current = slideCount;
  }, [slideCount]);

  useEffect(() => {
    displayIndexRef.current = displayIndex;
  }, [displayIndex]);

  useEffect(() => {
    setSuppressTransition(false);
    isSnappingRef.current = false;
    clearSnapFallback();
    const startIndex = getHomeHeroInitialDisplayIndex(slideCount);
    displayIndexRef.current = startIndex;
    setDisplayIndex(startIndex);
  }, [slideCount, clearSnapFallback]);

  useEffect(() => {
    if (slideCount <= 1) {
      clearSnapFallback();
      return;
    }

    if (normalizeHomeHeroCloneDisplayIndex(displayIndex, slideCount) === null) {
      clearSnapFallback();
      return;
    }

    scheduleSnapFallback();
    return clearSnapFallback;
  }, [displayIndex, slideCount, scheduleSnapFallback, clearSnapFallback]);

  useEffect(() => () => clearSnapFallback(), [clearSnapFallback]);

  return {
    trackSlides,
    displayIndex,
    logicalIndex,
    hasMultipleSlides,
    suppressTransition,
    goToPrevious,
    goToNext,
    goToLogicalIndex,
    handleTrackTransitionEnd,
  };
}
