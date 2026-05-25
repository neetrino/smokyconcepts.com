'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';

import { HomeActionButton } from './HomeActionButton';
import { getHomeHeroSlideImageSrc, getHomeHeroSlideLines } from '@/lib/home-hero-display';
import type { HomeHeroSlide } from '@/lib/types/home-hero.types';
import { useTranslation } from '@/lib/i18n-client';

interface HomeHeroSectionProps {
  slides: HomeHeroSlide[];
}

const HERO_AUTO_SLIDE_INTERVAL_MS = 3000;
const HERO_SWIPE_THRESHOLD_PX = 40;
const HERO_HORIZONTAL_SWIPE_LOCK_PX = 12;

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStateRef = useRef<HeroTouchState>(INITIAL_HERO_TOUCH_STATE);
  const heroRef = useRef<HTMLDivElement>(null);
  const safeSlides = slides.length > 0 ? slides : [];

  const goToPrevious = useCallback(() => {
    if (safeSlides.length <= 1) return;
    setActiveIndex((prev) => (prev === 0 ? safeSlides.length - 1 : prev - 1));
  }, [safeSlides.length]);

  const goToNext = useCallback(() => {
    if (safeSlides.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % safeSlides.length);
  }, [safeSlides.length]);

  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, Math.max(0, safeSlides.length - 1)));
  }, [safeSlides.length]);

  useEffect(() => {
    if (safeSlides.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      goToNext();
    }, HERO_AUTO_SLIDE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [goToNext, safeSlides.length]);

  useEffect(() => {
    const heroNode = heroRef.current;
    if (!heroNode || safeSlides.length <= 1) {
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
  }, [safeSlides.length]);

  const resetTouchState = useCallback(() => {
    touchStateRef.current = INITIAL_HERO_TOUCH_STATE;
    setIsDragging(false);
    setDragOffsetPx(0);
  }, []);

  const current = safeSlides[activeIndex] ?? safeSlides[0];

  if (!current) {
    return null;
  }

  const lines = getHomeHeroSlideLines(current, lang);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (safeSlides.length <= 1) {
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
  };

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2.25rem]">
      <div
        ref={heroRef}
        className="relative h-[28rem] touch-pan-y sm:h-[32rem]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={resetTouchState}
      >
        <div className="h-full overflow-hidden">
          <div
            className={`flex h-full ${isDragging ? '' : 'transition-transform duration-500 ease-in-out'}`}
            style={{
              transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffsetPx}px))`,
            }}
          >
            {safeSlides.map((slide, index) => {
              const alt =
                getHomeHeroSlideLines(slide, lang).title || t('home.homepage.hero.imageAlt');
              const desktopSrc = getHomeHeroSlideImageSrc(slide, 'desktop');
              const mobileSrc = getHomeHeroSlideImageSrc(slide, 'mobile');
              const slideKey = `${desktopSrc}-${mobileSrc}-${index}`;

              return (
                <div key={slideKey} className="relative h-full w-full shrink-0">
                  <Image
                    src={desktopSrc}
                    alt={alt}
                    fill
                    className="hidden object-cover md:block"
                    priority={index === 0}
                    sizes="1680px"
                    unoptimized={
                      desktopSrc.startsWith('http://') || desktopSrc.startsWith('https://')
                    }
                  />
                  <Image
                    src={mobileSrc}
                    alt={alt}
                    fill
                    className="object-cover md:hidden"
                    priority={index === 0}
                    sizes="100vw"
                    unoptimized={
                      mobileSrc.startsWith('http://') || mobileSrc.startsWith('https://')
                    }
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
        {safeSlides.length > 1 ? (
          <div className="absolute bottom-5 left-1/2 z-[3] flex -translate-x-1/2 gap-2 sm:bottom-4">
            {safeSlides.map((_, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
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
