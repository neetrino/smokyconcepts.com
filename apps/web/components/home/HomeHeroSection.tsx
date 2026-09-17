'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';

import { HomeActionButton } from './HomeActionButton';
import { useHomeHeroCarouselLoop } from './useHomeHeroCarouselLoop';
import { getHomeHeroSlideImageSrc, getHomeHeroSlideLines } from '@/lib/home-hero-display';
import type { HomeHeroSlide } from '@/lib/types/home-hero.types';
import { useTranslation } from '@/lib/i18n-client';

interface HomeHeroSectionProps {
  slides: HomeHeroSlide[];
}

const HERO_AUTO_SLIDE_INTERVAL_MS = 3000;
const HERO_AUTO_SLIDE_RESUME_DELAY_MS = 10_000;
const HERO_SWIPE_THRESHOLD_PX = 40;
const HERO_HORIZONTAL_SWIPE_LOCK_PX = 12;

/** Opaque stage + compositor clip so swipe transforms cannot flash the page background. */
const HERO_FRAME_CLASS_NAME =
  'relative isolate overflow-hidden rounded-[1.5rem] bg-black [clip-path:inset(0_round_1.5rem)] [transform:translateZ(0)] sm:rounded-[2.25rem] sm:[clip-path:inset(0_round_2.25rem)]';
const HERO_VIEWPORT_CLASS_NAME =
  'relative h-[28rem] touch-pan-y overscroll-none sm:h-[32rem]';
const HERO_TRACK_CLASS_NAME =
  'relative z-0 flex h-full bg-black [backface-visibility:hidden]';
const HERO_TRACK_SLIDE_CLASS_NAME =
  'relative h-full w-full min-w-full shrink-0 overflow-hidden bg-black shadow-[0_0_0_1px_#000] [backface-visibility:hidden] [transform:translateZ(0)]';

interface HeroTouchState {
  startX: number | null;
  currentX: number | null;
  isDragging: boolean;
}

const INITIAL_HERO_TOUCH_STATE: HeroTouchState = {
  startX: null,
  currentX: null,
  isDragging: false,
};

/**
 * Homepage hero: same layout/size as static Figma block; supports multiple slides and dot navigation.
 * Image area: 28rem / 32rem (was 36.125rem / 42.5rem) for a shorter above-the-fold block.
 */
export function HomeHeroSection({ slides }: HomeHeroSectionProps) {
  const { t, lang } = useTranslation();
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStateRef = useRef<HeroTouchState>(INITIAL_HERO_TOUCH_STATE);
  const heroRef = useRef<HTMLDivElement>(null);
  const isAutoSlidePausedRef = useRef(false);
  const autoSlideResumeTimeoutRef = useRef<number | null>(null);
  const safeSlides = slides.length > 0 ? slides : [];
  const {
    trackSlides,
    displayIndex,
    logicalIndex,
    hasMultipleSlides,
    suppressTransition,
    goToPrevious,
    goToNext,
    goToLogicalIndex,
    handleTrackTransitionEnd,
  } = useHomeHeroCarouselLoop(safeSlides);

  const pauseAutoSlide = useCallback(() => {
    isAutoSlidePausedRef.current = true;
    if (autoSlideResumeTimeoutRef.current !== null) {
      window.clearTimeout(autoSlideResumeTimeoutRef.current);
      autoSlideResumeTimeoutRef.current = null;
    }
  }, []);

  const scheduleAutoSlideResume = useCallback(() => {
    if (autoSlideResumeTimeoutRef.current !== null) {
      window.clearTimeout(autoSlideResumeTimeoutRef.current);
    }

    autoSlideResumeTimeoutRef.current = window.setTimeout(() => {
      isAutoSlidePausedRef.current = false;
      autoSlideResumeTimeoutRef.current = null;
    }, HERO_AUTO_SLIDE_RESUME_DELAY_MS);
  }, []);

  useEffect(() => {
    if (!hasMultipleSlides) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (!isAutoSlidePausedRef.current) {
        goToNext();
      }
    }, HERO_AUTO_SLIDE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      if (autoSlideResumeTimeoutRef.current !== null) {
        window.clearTimeout(autoSlideResumeTimeoutRef.current);
        autoSlideResumeTimeoutRef.current = null;
      }
    };
  }, [goToNext, hasMultipleSlides]);

  useEffect(() => {
    const heroNode = heroRef.current;
    if (!heroNode || !hasMultipleSlides) {
      return;
    }

    const lockVerticalScrollDuringHorizontalSwipe = (event: globalThis.TouchEvent) => {
      const { startX, isDragging } = touchStateRef.current;
      if (!isDragging || startX === null) {
        return;
      }

      const currentX = event.touches[0]?.clientX ?? null;
      if (currentX === null) {
        return;
      }

      if (Math.abs(currentX - startX) >= HERO_HORIZONTAL_SWIPE_LOCK_PX) {
        event.preventDefault();
      }
    };

    heroNode.addEventListener('touchmove', lockVerticalScrollDuringHorizontalSwipe, {
      passive: false,
    });

    return () => {
      heroNode.removeEventListener('touchmove', lockVerticalScrollDuringHorizontalSwipe);
    };
  }, [hasMultipleSlides]);

  const resetTouchState = useCallback(() => {
    touchStateRef.current = INITIAL_HERO_TOUCH_STATE;
    setIsDragging(false);
    setDragOffsetPx(0);
  }, []);

  const current = safeSlides[logicalIndex] ?? safeSlides[0];

  if (!current) {
    return null;
  }

  const lines = getHomeHeroSlideLines(current, lang);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (!hasMultipleSlides) {
      return;
    }

    const startX = event.touches[0]?.clientX ?? null;
    if (startX === null) {
      return;
    }

    pauseAutoSlide();

    touchStateRef.current = {
      startX,
      currentX: startX,
      isDragging: true,
    };
    setIsDragging(true);
    setDragOffsetPx(0);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const { startX, isDragging: dragging } = touchStateRef.current;
    if (!dragging || startX === null) {
      return;
    }

    const currentX = event.touches[0]?.clientX ?? null;
    if (currentX === null) {
      return;
    }

    touchStateRef.current.currentX = currentX;
    const deltaX = currentX - startX;
    setDragOffsetPx(deltaX);
  };

  const handleTouchEnd = () => {
    const { startX, currentX } = touchStateRef.current;
    if (startX === null || currentX === null) {
      resetTouchState();
      scheduleAutoSlideResume();
      return;
    }

    const deltaX = currentX - startX;
    if (Math.abs(deltaX) >= HERO_SWIPE_THRESHOLD_PX) {
      if (deltaX > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }

    resetTouchState();
    scheduleAutoSlideResume();
  };

  const handleDotClick = (index: number) => {
    pauseAutoSlide();
    goToLogicalIndex(index);
    scheduleAutoSlideResume();
  };

  return (
    <div className={HERO_FRAME_CLASS_NAME}>
      <div
        ref={heroRef}
        className={HERO_VIEWPORT_CLASS_NAME}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          resetTouchState();
          scheduleAutoSlideResume();
        }}
      >
        <div className="relative h-full overflow-hidden bg-black">
          <div
            className={`${HERO_TRACK_CLASS_NAME} ${
              isDragging || suppressTransition ? '' : 'transition-transform duration-500 ease-in-out'
            }`}
            style={{
              transform: `translate3d(calc(-${displayIndex * 100}% + ${dragOffsetPx}px), 0, 0)`,
            }}
            onTransitionEnd={handleTrackTransitionEnd}
          >
            {trackSlides.map((slide, index) => {
              const alt =
                getHomeHeroSlideLines(slide, lang).title || t('home.homepage.hero.imageAlt');
              const desktopSrc = getHomeHeroSlideImageSrc(slide, 'desktop');
              const mobileSrc = getHomeHeroSlideImageSrc(slide, 'mobile');
              const slideKey = `${desktopSrc}-${mobileSrc}-${index}`;
              const isPriority = isHeroSlidePriority(index, trackSlides.length, hasMultipleSlides);

              return (
                <div key={slideKey} className={HERO_TRACK_SLIDE_CLASS_NAME}>
                  <Image
                    src={desktopSrc}
                    alt={alt}
                    fill
                    draggable={false}
                    className="hidden object-cover md:block"
                    priority={isPriority}
                    sizes="1680px"
                    unoptimized={isRemoteHeroSrc(desktopSrc)}
                  />
                  <Image
                    src={mobileSrc}
                    alt={alt}
                    fill
                    draggable={false}
                    className="object-cover md:hidden"
                    priority={isPriority}
                    sizes="100vw"
                    unoptimized={isRemoteHeroSrc(mobileSrc)}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
        <div className="pointer-events-none absolute bottom-10 left-7 z-[3] max-w-[22.625rem] text-white sm:bottom-12 sm:left-12 sm:max-w-[33rem]">
          <h1 className="text-4xl font-extrabold leading-none sm:text-5xl">{lines.title}</h1>
          <p className="mt-3 text-sm font-medium leading-[1.57] sm:mt-4 sm:text-lg sm:leading-relaxed">{lines.description}</p>
          <HomeActionButton
            href={current.ctaHref}
            label={lines.ctaLabel}
            className="pointer-events-auto mt-6 sm:mt-7"
          />
        </div>
        {hasMultipleSlides ? (
          <div className="absolute bottom-5 left-1/2 z-[3] flex -translate-x-1/2 gap-2 sm:bottom-4">
            {safeSlides.map((_, index) => {
              const isActive = index === logicalIndex;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDotClick(index)}
                  className={`rounded-full transition-all ${
                    isActive
                      ? 'h-1.5 w-4 bg-white'
                      : 'h-1.5 w-3 bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={`${t('home.homepage.hero.slideAriaPrefix')} ${index + 1}`}
                  aria-current={isActive ? 'true' : undefined}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function isRemoteHeroSrc(src: string): boolean {
  return src.startsWith('http://') || src.startsWith('https://');
}

function isHeroSlidePriority(
  index: number,
  trackSlideCount: number,
  hasMultipleSlides: boolean,
): boolean {
  if (!hasMultipleSlides) {
    return index === 0;
  }

  return index <= 1 || index === trackSlideCount - 1;
}
