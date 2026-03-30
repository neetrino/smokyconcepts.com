/**
 * Homepage hero carousel — stored in Settings key `homeHero`.
 */
export interface HomeHeroSlide {
  imageUrl: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface HomeHeroConfig {
  slides: HomeHeroSlide[];
}
