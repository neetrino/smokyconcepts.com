import { db } from '@white-shop/db';

import { HOME_HERO_DEFAULT_SLIDES } from '@/lib/constants/home-hero.constants';
import { isR2Configured, uploadHomeHeroImageToR2 } from '@/lib/services/r2.service';
import { parseDataImageUrl } from '@/lib/services/utils/data-url-image';
import type { HomeHeroConfig, HomeHeroSlide } from '@/lib/types/home-hero.types';
import { homeHeroConfigSchema } from '@/lib/validation/home-hero.schema';
import { logger } from './utils/logger';

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

/**
 * Inline data URLs on slides are uploaded to R2 (home-hero/…) so zod length limits and DB stay small.
 */
export async function resolveHomeHeroInlineImagesForR2(homeHero: unknown): Promise<unknown> {
  if (!homeHero || typeof homeHero !== 'object' || !('slides' in homeHero)) {
    return homeHero;
  }
  const slidesUnknown = (homeHero as { slides: unknown }).slides;
  if (!Array.isArray(slidesUnknown)) {
    return homeHero;
  }

  const resolvedSlides = await Promise.all(
    slidesUnknown.map(async (slide) => {
      if (!slide || typeof slide !== 'object') {
        return slide;
      }
      const record = slide as Record<string, unknown>;
      const imageUrl = typeof record.imageUrl === 'string' ? record.imageUrl.trim() : '';
      if (!imageUrl.startsWith('data:image/')) {
        return slide;
      }
      if (!isR2Configured()) {
        throw new Error(
          'R2 is not configured; cannot persist inline hero images. Use file upload or configure R2.',
        );
      }
      const parsed = parseDataImageUrl(imageUrl);
      if (!parsed) {
        throw new Error('Invalid hero image data URL.');
      }
      const publicUrl = await uploadHomeHeroImageToR2(parsed.buffer, parsed.contentType);
      return { ...record, imageUrl: publicUrl };
    }),
  );

  return { ...(homeHero as Record<string, unknown>), slides: resolvedSlides };
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
  try {
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
  } catch (error) {
    logger.error('Failed to load home hero slides from database', { error });
    return [...HOME_HERO_DEFAULT_SLIDES];
  }
}
