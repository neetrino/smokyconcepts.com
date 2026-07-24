'use client';

import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';

import {
  TRENDING_SWIPE_HORIZONTAL_LOCK_PX,
  TRENDING_SWIPE_THRESHOLD_PX,
} from './trendingFeatured.constants';

interface TrendingSwipeTouchState {
  startX: number | null;
  currentX: number | null;
  isDragging: boolean;
}

const INITIAL_TRENDING_SWIPE_TOUCH_STATE: TrendingSwipeTouchState = {
  startX: null,
  currentX: null,
  isDragging: false,
};

export interface UseTrendingCarouselSwipeOptions {
  enabled: boolean;
  hasMultiplePages: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/** Touch swipe for trending coverflow on viewports below `xl`. */
export function useTrendingCarouselSwipe({
  enabled,
  hasMultiplePages,
  onPrev,
  onNext,
}: UseTrendingCarouselSwipeOptions) {
  const touchStateRef = useRef<TrendingSwipeTouchState>(INITIAL_TRENDING_SWIPE_TOUCH_STATE);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const resetTouchState = useCallback(() => {
    touchStateRef.current = INITIAL_TRENDING_SWIPE_TOUCH_STATE;
    setIsDragging(false);
    setDragOffsetPx(0);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || !enabled || !hasMultiplePages) {
      return;
    }

    const lockVerticalScrollDuringHorizontalSwipe = (event: globalThis.TouchEvent) => {
      const { startX, isDragging: dragging } = touchStateRef.current;
      if (!dragging || startX === null) {
        return;
      }

      const currentX = event.touches[0]?.clientX ?? null;
      if (currentX === null) {
        return;
      }

      if (Math.abs(currentX - startX) >= TRENDING_SWIPE_HORIZONTAL_LOCK_PX) {
        event.preventDefault();
      }
    };

    node.addEventListener('touchmove', lockVerticalScrollDuringHorizontalSwipe, {
      passive: false,
    });

    return () => {
      node.removeEventListener('touchmove', lockVerticalScrollDuringHorizontalSwipe);
    };
  }, [enabled, hasMultiplePages]);

  const handleTouchStart = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      if (!enabled || !hasMultiplePages) {
        return;
      }

      const startX = event.touches[0]?.clientX ?? null;
      if (startX === null) {
        return;
      }

      touchStateRef.current = {
        startX,
        currentX: startX,
        isDragging: true,
      };
      setIsDragging(true);
      setDragOffsetPx(0);
    },
    [enabled, hasMultiplePages]
  );

  const handleTouchMove = useCallback((event: TouchEvent<HTMLDivElement>) => {
    const { startX, isDragging: dragging } = touchStateRef.current;
    if (!dragging || startX === null) {
      return;
    }

    const currentX = event.touches[0]?.clientX ?? null;
    if (currentX === null) {
      return;
    }

    touchStateRef.current.currentX = currentX;
    setDragOffsetPx(currentX - startX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    const { startX, currentX } = touchStateRef.current;
    if (startX === null || currentX === null) {
      resetTouchState();
      return;
    }

    const deltaX = currentX - startX;
    if (Math.abs(deltaX) >= TRENDING_SWIPE_THRESHOLD_PX) {
      if (deltaX > 0) {
        onPrev();
      } else {
        onNext();
      }
    }

    resetTouchState();
  }, [onNext, onPrev, resetTouchState]);

  return {
    containerRef,
    dragOffsetPx,
    isDragging,
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: resetTouchState,
    },
  };
}
