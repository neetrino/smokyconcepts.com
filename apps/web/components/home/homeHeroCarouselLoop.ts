import type { HomeHeroSlide } from '@/lib/types/home-hero.types';

/** Extended track: [last clone, …slides, first clone] for seamless wrap. */
export function buildHomeHeroTrackSlides(slides: HomeHeroSlide[]): HomeHeroSlide[] {
  if (slides.length <= 1) {
    return slides;
  }

  const lastSlide = slides[slides.length - 1];
  const firstSlide = slides[0];
  if (!lastSlide || !firstSlide) {
    return slides;
  }

  return [lastSlide, ...slides, firstSlide];
}

export function getHomeHeroInitialDisplayIndex(slideCount: number): number {
  return slideCount > 1 ? 1 : 0;
}

/** Active slide index for dots and overlay copy (0-based). */
export function getHomeHeroLogicalIndex(displayIndex: number, slideCount: number): number {
  if (slideCount <= 1) {
    return 0;
  }

  if (displayIndex === 0) {
    return slideCount - 1;
  }

  if (displayIndex === slideCount + 1) {
    return 0;
  }

  return displayIndex - 1;
}

/** After animating onto a clone slot, snap to the matching real slot (no transition). */
export function normalizeHomeHeroCloneDisplayIndex(
  displayIndex: number,
  slideCount: number
): number | null {
  if (slideCount <= 1) {
    return null;
  }

  const lastRealIndex = slideCount;
  if (displayIndex === 0) {
    return lastRealIndex;
  }

  if (displayIndex === slideCount + 1) {
    return 1;
  }

  return null;
}

export function isHomeHeroTrackTransformEnd(event: TransitionEvent, track: HTMLElement): boolean {
  if (event.target !== track) {
    return false;
  }

  const property = event.propertyName;
  return property === 'transform' || property === '-webkit-transform';
}
