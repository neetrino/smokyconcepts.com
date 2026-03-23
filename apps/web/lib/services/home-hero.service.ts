import { db } from '@white-shop/db';

import { HOME_HERO_DEFAULT_SLIDES } from '@/lib/constants/home-hero.constants';
import type { HomeHeroConfig, HomeHeroSlide } from '@/lib/types/home-hero.types';
import { homeHeroConfigSchema } from '@/lib/validation/home-hero.schema';

const SETTINGS_KEY = 'homeHero';

/**
 * Safe parse for admin UI — invalid stored JSON yields empty slides.
 */
export function parseHomeHeroConfigForAdmin(value: unknown): HomeHeroConfig {
  const r = homeHeroConfigSchema.safeParse(value);
  if (!r.success) {
    return { slides: [] };
  }
  return { slides: r.data.slides.map((s) => ({ ...s })) };
}

function normalizeSlides(value: unknown): HomeHeroSlide[] | null {
  const parsed = homeHeroConfigSchema.safeParse(value);
  if (!parsed.success || parsed.data.slides.length === 0) {
    return null;
  }
  return parsed.data.slides.map((s) => ({
    imageUrl: s.imageUrl.trim(),
    title: s.title.trim(),
    description: s.description.trim(),
    ctaLabel: s.ctaLabel.trim(),
    ctaHref: s.ctaHref.trim(),
  }));
}

/**
 * Slides for the public homepage hero. Falls back to built-in defaults if unset or invalid.
 */
export async function getHomeHeroSlidesForStorefront(): Promise<HomeHeroSlide[]> {
  const row = await db.settings.findUnique({
    where: { key: SETTINGS_KEY },
  });
  if (!row?.value) {
    return [...HOME_HERO_DEFAULT_SLIDES];
  }
  const slides = normalizeSlides(row.value);
  if (!slides) {
    return [...HOME_HERO_DEFAULT_SLIDES];
  }
  return slides;
}
