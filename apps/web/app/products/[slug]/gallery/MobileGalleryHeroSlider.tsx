'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  GALLERY_SLIDE_DURATION_MS,
  GALLERY_SWIPE_THRESHOLD_PX,
} from './galleryCarousel.constants';
import { resolveGallerySlideDirection } from './gallerySlideDirection';

interface MobileGalleryHeroSliderProps {
  images: string[];
  currentIndex: number;
  alt: string;
  boxSizeClasses: string;
  fitClasses: string;
  onNavigate: (direction: 'previous' | 'next') => void;
  overlay?: ReactNode;
}

interface ActiveSlide {
  fromIndex: number;
  toIndex: number;
  direction: 'next' | 'previous';
}

interface GalleryTouchState {
  startX: number | null;
  startY: number | null;
  isHorizontalSwipe: boolean;
}

const INITIAL_GALLERY_TOUCH_STATE: GalleryTouchState = {
  startX: null,
  startY: null,
  isHorizontalSwipe: false,
};

/** Movement before deciding horizontal gallery swipe vs vertical page scroll. */
const HORIZONTAL_SWIPE_AXIS_LOCK_THRESHOLD_PX = 8;

const HERO_SLIDE_LAYER_BASE_CLASSES = 'absolute inset-0';
/** Vertical pans reach the page; horizontal swipes are handled in JS. */
const HERO_SWIPE_CONTAINER_CLASSES = 'touch-pan-y overscroll-none';
const HERO_SLIDE_TRANSITION_CLASSES = 'transition-transform duration-300 ease-out';

/** Mobile hero — slides horizontally in sync with thumbnail strip navigation. */
export function MobileGalleryHeroSlider({
  images,
  currentIndex,
  alt,
  boxSizeClasses,
  fitClasses,
  onNavigate,
  overlay,
}: MobileGalleryHeroSliderProps) {
  const previousIndexRef = useRef(currentIndex);
  const touchStateRef = useRef<GalleryTouchState>(INITIAL_GALLERY_TOUCH_STATE);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState<ActiveSlide | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const previousIndex = previousIndexRef.current;
    if (previousIndex === currentIndex || images.length <= 1) {
      previousIndexRef.current = currentIndex;
      return;
    }

    setActiveSlide({
      fromIndex: previousIndex,
      toIndex: currentIndex,
      direction: resolveGallerySlideDirection(previousIndex, currentIndex, images.length),
    });
    previousIndexRef.current = currentIndex;
  }, [currentIndex, images.length]);

  useLayoutEffect(() => {
    if (!activeSlide) {
      setIsAnimating(false);
      return;
    }

    setIsAnimating(false);
    const frame = requestAnimationFrame(() => setIsAnimating(true));
    const timer = window.setTimeout(() => {
      setActiveSlide(null);
      setIsAnimating(false);
    }, GALLERY_SLIDE_DURATION_MS);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [activeSlide]);

  useEffect(() => {
    const sliderNode = sliderRef.current;
    if (!sliderNode || images.length <= 1) {
      return;
    }

    const lockPageScrollDuringGalleryTouch = (event: globalThis.TouchEvent) => {
      const touch = event.touches[0];
      const state = touchStateRef.current;
      if (!touch || state.startX === null || state.startY === null) {
        return;
      }

      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;

      if (!state.isHorizontalSwipe) {
        if (
          Math.abs(deltaX) < HORIZONTAL_SWIPE_AXIS_LOCK_THRESHOLD_PX &&
          Math.abs(deltaY) < HORIZONTAL_SWIPE_AXIS_LOCK_THRESHOLD_PX
        ) {
          return;
        }

        if (Math.abs(deltaY) >= Math.abs(deltaX)) {
          resetTouchState();
          return;
        }

        state.isHorizontalSwipe = true;
      }

      event.preventDefault();
    };

    sliderNode.addEventListener('touchmove', lockPageScrollDuringGalleryTouch, {
      passive: false,
    });

    return () => {
      sliderNode.removeEventListener('touchmove', lockPageScrollDuringGalleryTouch);
    };
  }, [images.length]);

  const resetTouchState = () => {
    touchStateRef.current = INITIAL_GALLERY_TOUCH_STATE;
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (images.length <= 1) {
      return;
    }

    const startX = event.touches[0]?.clientX ?? null;
    const startY = event.touches[0]?.clientY ?? null;
    if (startX === null || startY === null) {
      return;
    }

    touchStateRef.current = { startX, startY, isHorizontalSwipe: false };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const { startX, isHorizontalSwipe } = touchStateRef.current;
    resetTouchState();

    if (startX === null || !isHorizontalSwipe || images.length <= 1) {
      return;
    }

    const endX = event.changedTouches[0]?.clientX;
    if (endX === undefined) {
      return;
    }

    const deltaX = endX - startX;
    if (Math.abs(deltaX) < GALLERY_SWIPE_THRESHOLD_PX) {
      return;
    }

    onNavigate(deltaX < 0 ? 'next' : 'previous');
  };

  const renderHeroImage = (imageSrc: string, imageAlt: string) => (
    <img
      src={imageSrc}
      alt={imageAlt}
      decoding="async"
      draggable={false}
      className={fitClasses}
    />
  );

  const resolveFromTranslateClass = (direction: 'next' | 'previous') => {
    if (!isAnimating) {
      return 'translate-x-0';
    }
    return direction === 'next' ? '-translate-x-full' : 'translate-x-full';
  };

  const resolveToTranslateClass = (direction: 'next' | 'previous') => {
    if (!isAnimating) {
      return direction === 'next' ? 'translate-x-full' : '-translate-x-full';
    }
    return 'translate-x-0';
  };

  return (
    <div
      ref={sliderRef}
      className={`relative mx-auto w-full max-w-full overflow-hidden ${HERO_SWIPE_CONTAINER_CLASSES} ${boxSizeClasses}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={resetTouchState}
    >
      {activeSlide ? (
        <>
          <div
            className={`${HERO_SLIDE_LAYER_BASE_CLASSES} ${HERO_SLIDE_TRANSITION_CLASSES} ${resolveFromTranslateClass(activeSlide.direction)}`}
          >
            {renderHeroImage(images[activeSlide.fromIndex] ?? '', alt)}
          </div>
          <div
            className={`${HERO_SLIDE_LAYER_BASE_CLASSES} ${HERO_SLIDE_TRANSITION_CLASSES} ${resolveToTranslateClass(activeSlide.direction)}`}
          >
            {renderHeroImage(images[activeSlide.toIndex] ?? '', alt)}
          </div>
        </>
      ) : (
        <div className="relative size-full">
          {renderHeroImage(images[currentIndex] ?? '', alt)}
        </div>
      )}
      {overlay}
    </div>
  );
}
