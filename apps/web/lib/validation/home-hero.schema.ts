import { z } from 'zod';

import type { HomeHeroSlide } from '@/lib/types/home-hero.types';

const MAX_SLIDES = 12;

const heroLocaleCopySchema = z.object({
  title: z.string().max(400),
  description: z.string().max(4000),
  ctaLabel: z.string().max(120),
});

const heroCopySchema = z.object({
  hy: heroLocaleCopySchema,
  en: heroLocaleCopySchema,
  ru: heroLocaleCopySchema,
});

/**
 * Accepts either legacy flat `title` / `description` / `ctaLabel` (same for all locales)
 * or `copy.hy` / `copy.en` / `copy.ru`.
 */
export const homeHeroSlideSchema = z
  .object({
    imageUrl: z.string().trim().min(1).max(2048),
    mobileImageUrl: z.string().trim().max(2048).optional(),
    ctaHref: z.string().max(512).default(''),
    copy: heroCopySchema.optional(),
    title: z.string().max(400).optional(),
    description: z.string().max(4000).optional(),
    ctaLabel: z.string().max(120).optional(),
  })
  .transform((data): HomeHeroSlide => {
    const imageUrl = data.imageUrl.trim();
    const mobileTrimmed = data.mobileImageUrl?.trim() ?? '';
    const mobileImageUrl = mobileTrimmed.length > 0 ? mobileTrimmed : undefined;
    const ctaHref = data.ctaHref.trim();
    const trimBlock = (b: { title: string; description: string; ctaLabel: string }) => ({
      title: b.title.trim(),
      description: b.description.trim(),
      ctaLabel: b.ctaLabel.trim(),
    });
    if (data.copy) {
      return {
        imageUrl,
        ...(mobileImageUrl ? { mobileImageUrl } : {}),
        ctaHref,
        copy: {
          hy: trimBlock(data.copy.hy),
          en: trimBlock(data.copy.en),
          ru: trimBlock(data.copy.ru),
        },
      };
    }
    const legacy = trimBlock({
      title: data.title ?? '',
      description: data.description ?? '',
      ctaLabel: data.ctaLabel ?? '',
    });
    return {
      imageUrl,
      ...(mobileImageUrl ? { mobileImageUrl } : {}),
      ctaHref,
      copy: {
        hy: { ...legacy },
        en: { ...legacy },
        ru: { ...legacy },
      },
    };
  });

export const homeHeroConfigSchema = z.object({
  slides: z.array(homeHeroSlideSchema).max(MAX_SLIDES),
});

export type HomeHeroConfigInput = z.infer<typeof homeHeroConfigSchema>;
