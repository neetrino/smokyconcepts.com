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

/**
 * Homepage hero: same layout/size as static Figma block; supports multiple slides and dot navigation.
 * Image area: 28rem / 32rem (was 36.125rem / 42.5rem) for a shorter above-the-fold block.
 */
export function HomeHeroSection({ slides }: HomeHeroSectionProps) {
  const { t, lang } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchCurrentXRef = useRef<number | null>(null);
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

  const current = safeSlides[activeIndex] ?? safeSlides[0];

  if (!current) {
    return null;
  }

  const lines = getHomeHeroSlideLines(current, lang);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    touchCurrentXRef.current = touchStartXRef.current;
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    touchCurrentXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchCurrentXRef.current === null) {
      touchStartXRef.current = null;
      touchCurrentXRef.current = null;
      return;
    }

    const deltaX = touchCurrentXRef.current - touchStartXRef.current;
    if (Math.abs(deltaX) >= HERO_SWIPE_THRESHOLD_PX) {
      if (deltaX > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }

    touchStartXRef.current = null;
    touchCurrentXRef.current = null;
  };

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2.25rem]">
      <div className="relative h-[28rem] sm:h-[32rem]">
        <div
          className="h-full overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
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
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
        <div className="absolute bottom-10 left-7 z-[3] max-w-[22.625rem] text-white sm:bottom-12 sm:left-12 sm:max-w-[33rem]">
          <h1 className="text-4xl font-extrabold leading-none sm:text-5xl">{lines.title}</h1>
          <p className="mt-3 text-sm font-medium leading-[1.57] sm:mt-4 sm:text-lg sm:leading-relaxed">{lines.description}</p>
          <HomeActionButton href={current.ctaHref} label={lines.ctaLabel} className="mt-6 sm:mt-7" />
        </div>
        {safeSlides.length > 1 ? (
          <div className="absolute bottom-7 left-7 z-[3] flex gap-2 sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2">
            {safeSlides.map((_, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
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
