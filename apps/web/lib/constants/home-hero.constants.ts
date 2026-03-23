import type { HomeHeroSlide } from '@/lib/types/home-hero.types';

/** Fallback when DB has no `homeHero` or empty slides — matches previous static homepage. */
export const HOME_HERO_DEFAULT_SLIDES: readonly HomeHeroSlide[] = [
  {
    imageUrl: '/assets/home/concepts/hero-banner.png',
    title: 'Contrary',
    description:
      'The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from',
    ctaLabel: 'Deep Dive',
    ctaHref: '/about',
  },
] as const;
