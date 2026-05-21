/**
 * Homepage hero carousel — stored in Settings key `homeHero`.
 */

export const HOME_HERO_UI_LOCALES = ['hy', 'en', 'ru'] as const;
export type HomeHeroUiLocale = (typeof HOME_HERO_UI_LOCALES)[number];

export interface HomeHeroSlideLocaleCopy {
  title: string;
  description: string;
  ctaLabel: string;
}

export interface HomeHeroSlide {
  imageUrl: string;
  /** Optional hero art for viewports below `md`; falls back to `imageUrl` when unset. */
  mobileImageUrl?: string;
  ctaHref: string;
  /** Per-locale headline, body, and button label on the hero image. */
  copy: Record<HomeHeroUiLocale, HomeHeroSlideLocaleCopy>;
}

export interface HomeHeroConfig {
  slides: HomeHeroSlide[];
}
