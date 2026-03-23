'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { HomeActionButton } from './HomeActionButton';
import type { HomeHeroSlide } from '@/lib/types/home-hero.types';

interface HomeHeroSectionProps {
  slides: HomeHeroSlide[];
}

/**
 * Homepage hero: same layout/size as static Figma block; supports multiple slides and dot navigation.
 */
export function HomeHeroSection({ slides }: HomeHeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeSlides = slides.length > 0 ? slides : [];

  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, Math.max(0, safeSlides.length - 1)));
  }, [safeSlides.length]);

  const current = safeSlides[activeIndex] ?? safeSlides[0];

  if (!current) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-[2.25rem]">
      <div className="relative h-[42.5rem]">
        {safeSlides.map((slide, index) => (
          <div
            key={`${slide.imageUrl}-${index}`}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === activeIndex ? 'z-[1] opacity-100' : 'z-0 opacity-0'
            }`}
            aria-hidden={index !== activeIndex}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.title || 'Hero'}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="1680px"
              unoptimized={
                slide.imageUrl.startsWith('http://') || slide.imageUrl.startsWith('https://')
              }
            />
          </div>
        ))}
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-8 z-[3] max-w-[33rem] text-white sm:left-12">
          <h1 className="text-4xl font-extrabold leading-none sm:text-5xl">{current.title}</h1>
          <p className="mt-4 text-base font-medium leading-relaxed sm:text-lg">{current.description}</p>
          <HomeActionButton href={current.ctaHref} label={current.ctaLabel} className="mt-7" />
        </div>
        {safeSlides.length > 1 ? (
          <div className="absolute bottom-6 left-1/2 z-[3] flex -translate-x-1/2 gap-2">
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
                  aria-label={`Slide ${index + 1}`}
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
