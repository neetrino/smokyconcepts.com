import { z } from 'zod';

const MAX_SLIDES = 12;

export const homeHeroSlideSchema = z.object({
  imageUrl: z.string().trim().min(1).max(2048),
  title: z.string().max(400),
  description: z.string().max(4000),
  ctaLabel: z.string().max(120),
  ctaHref: z.string().max(512),
});

export const homeHeroConfigSchema = z.object({
  slides: z.array(homeHeroSlideSchema).max(MAX_SLIDES),
});

export type HomeHeroConfigInput = z.infer<typeof homeHeroConfigSchema>;
