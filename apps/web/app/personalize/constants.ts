/** Figma Personalize (web) gallery — 272×531 display slots. */
export const PERSONALIZE_GALLERY_IMAGES = [
  {
    src: '/assets/personalize/gallery-sketches.webp',
    altKey: 'personalize.gallery.sketchesAlt',
  },
  {
    src: '/assets/personalize/gallery-handshake.webp',
    altKey: 'personalize.gallery.handshakeAlt',
  },
  {
    src: '/assets/personalize/gallery-leather.webp',
    altKey: 'personalize.gallery.leatherAlt',
  },
] as const;

/** Page shell spacing keeps the gallery and form aligned across desktop widths. */
export const PERSONALIZE_PAGE_SHELL_CLASS =
  'mx-auto flex w-full max-w-[120rem] flex-col gap-10 px-6 pb-16 pt-10 sm:px-8 sm:pb-20 lg:flex-row lg:items-start lg:gap-[clamp(7.75rem,8.34vw,10rem)] lg:px-[clamp(3.75rem,6.25vw,7.5rem)] lg:pb-24 lg:pt-[clamp(1.5rem,3.125vw,3.75rem)]' as const;

/** Gallery wrapper — no w-full on desktop so the form stays in view. */
export const PERSONALIZE_GALLERY_WRAPPER_CLASS =
  'mx-auto shrink-0 overflow-x-auto [scrollbar-width:none] lg:mx-0 lg:overflow-visible [&::-webkit-scrollbar]:hidden' as const;

/** Gallery width scales from the annotated screenshot to the full Figma frame. */
export const PERSONALIZE_GALLERY_IMAGE_CLASS =
  'relative aspect-[272/560] w-[140px] overflow-hidden first:rounded-l-[28px] last:rounded-r-[28px] lg:w-[clamp(8.75rem,14.17vw,17rem)] lg:first:rounded-l-[clamp(1.75rem,2.92vw,3.5rem)] lg:last:rounded-r-[clamp(1.75rem,2.92vw,3.5rem)]' as const;

/** Right column height matches the responsive gallery height on desktop. */
export const PERSONALIZE_CONTENT_COLUMN_CLASS =
  'mx-auto flex w-full max-w-[432px] shrink-0 flex-col lg:mx-0 lg:min-h-[clamp(18rem,29.17vw,35rem)] lg:max-w-[clamp(24rem,32.5vw,39rem)] lg:justify-between' as const;

/** Title + description block width from Figma. */
export const PERSONALIZE_DESCRIPTION_CLASS = 'max-w-[624px]' as const;

/** Form layout uses tighter desktop spacing at the annotated 1024px width. */
export const PERSONALIZE_FORM_CLASS =
  'flex w-full max-w-[432px] flex-col gap-5 pt-7 lg:max-w-[454px] lg:gap-[clamp(0.625rem,1vw,3.1875rem)] lg:pt-0' as const;

/** Gap between title and description follows the annotated desktop composition. */
export const PERSONALIZE_TITLE_DESCRIPTION_GAP_CLASS =
  'mt-4 lg:mt-[clamp(0.35rem,2.08vw,2.5rem)]' as const;

/** Gap between gallery images — Figma desktop: 9px, mobile: 6px. */
export const PERSONALIZE_GALLERY_GAP_CLASS = 'gap-1.5 lg:gap-[9px]' as const;

/** Submit button scales with the gallery at desktop widths. */
export const PERSONALIZE_SUBMIT_BUTTON_CLASS =
  'inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-lg bg-[#dcc090] px-5 text-sm font-semibold uppercase tracking-[1.4px] text-[#122a26] transition-colors enabled:hover:bg-[#c9a574] disabled:cursor-not-allowed disabled:opacity-60 lg:h-[clamp(1.5rem,2.5vw,3rem)] lg:w-auto lg:min-w-[clamp(6.75rem,10vw,12rem)] lg:self-start lg:px-[clamp(1rem,1.8vw,2rem)] lg:text-[clamp(0.75rem,1.25vw,1.5rem)] lg:tracking-[0.1em]' as const;

/** Form label scales from the annotated screenshot to the full Figma frame. */
export const PERSONALIZE_FIELD_LABEL_CLASS =
  'block text-sm font-bold leading-[1.67] text-[#414141] lg:text-[clamp(0.625rem,0.78vw,0.9375rem)] lg:font-semibold lg:leading-[23px]' as const;

/** Underline input — one line, matching the marked horizontal alignment. */
export const PERSONALIZE_UNDERLINE_INPUT_CLASS =
  'w-full border-0 border-b border-[#c4b998] bg-transparent px-0 pb-1 pt-1 text-sm font-bold text-[#414141] placeholder:text-[#414141]/45 focus:border-[#dcc090] focus:outline-none focus:ring-0 lg:text-[clamp(0.5rem,0.78vw,0.9375rem)] lg:font-semibold lg:leading-[23px]' as const;

/** Comment field keeps the underline style but uses the requested 18px text. */
export const PERSONALIZE_COMMENT_INPUT_CLASS =
  `${PERSONALIZE_UNDERLINE_INPUT_CLASS} resize-none !text-[18px] lg:!text-[18px]` as const;

/** Page title — mobile 24px, desktop 40px extrabold. */
export const PERSONALIZE_TITLE_CLASS =
  'text-2xl font-extrabold leading-none tracking-[-0.02em] text-[#414141] lg:text-[clamp(1.5rem,1.56vw,1.875rem)]' as const;

/** Description scales with the title and form text at desktop widths. */
export const PERSONALIZE_DESCRIPTION_TEXT_CLASS =
  'text-sm font-bold leading-[22px] tracking-[-0.01em] text-[#414141] lg:text-[clamp(0.75rem,0.78vw,0.9375rem)] lg:font-semibold lg:leading-[23px]' as const;
