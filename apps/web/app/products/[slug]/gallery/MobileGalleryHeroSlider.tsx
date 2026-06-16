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

const HERO_SLIDE_LAYER_BASE_CLASSES = 'absolute inset-0 flex items-center justify-center';
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
  const touchStartXRef = useRef<number | null>(null);
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

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    if (startX === null || images.length <= 1) {
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
      className={`block ${fitClasses}`}
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
      className={`relative mx-auto w-full max-w-full overflow-hidden ${boxSizeClasses}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
        <div className="flex size-full items-center justify-center">
          {renderHeroImage(images[currentIndex] ?? '', alt)}
        </div>
      )}
      {overlay}
    </div>
  );
}
