import type { LanguageCode } from '@/lib/language';
import type { HomeHeroSlide } from '@/lib/types/home-hero.types';
import { HOME_HERO_UI_LOCALES, type HomeHeroUiLocale } from '@/lib/types/home-hero.types';

function languageToHeroUiLocale(lang: LanguageCode): HomeHeroUiLocale {
  if (lang === 'hy' || lang === 'en' || lang === 'ru') {
    return lang;
  }
  return 'en';
}

function pickFieldWithFallback(
  slide: HomeHeroSlide,
  field: keyof HomeHeroSlide['copy']['en'],
  preferred: HomeHeroUiLocale,
): string {
  const order: readonly HomeHeroUiLocale[] = [preferred, 'en', 'hy', 'ru'];
  for (const code of order) {
    const value = slide.copy[code][field].trim();
    if (value.length > 0) {
      return value;
    }
  }
  return '';
}

/**
 * Resolves hero slide copy for the storefront language (hy / en / ru).
 * Falls back across locales when a field is empty; Georgian (ka) uses English-style copy.
 */
export function getHomeHeroSlideLines(
  slide: HomeHeroSlide,
  lang: LanguageCode,
): { title: string; description: string; ctaLabel: string } {
  const preferred = languageToHeroUiLocale(lang);
  return {
    title: pickFieldWithFallback(slide, 'title', preferred),
    description: pickFieldWithFallback(slide, 'description', preferred),
    ctaLabel: pickFieldWithFallback(slide, 'ctaLabel', preferred),
  };
}

/** Hero image URL for storefront — mobile uses `mobileImageUrl` when set. */
export function getHomeHeroSlideImageSrc(
  slide: HomeHeroSlide,
  variant: 'desktop' | 'mobile',
): string {
  if (variant === 'mobile') {
    const mobile = slide.mobileImageUrl?.trim();
    if (mobile) {
      return mobile;
    }
  }
  return slide.imageUrl;
}

/** First non-empty title among UI locales — for admin collapsed row preview. */
export function getHomeHeroSlidePreviewTitle(slide: HomeHeroSlide): string {
  for (const code of HOME_HERO_UI_LOCALES) {
    const title = slide.copy[code].title.trim();
    if (title.length > 0) {
      return title;
    }
  }
  return '';
}
