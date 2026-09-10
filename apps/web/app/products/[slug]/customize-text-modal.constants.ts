/** Mobile Customization popup — layout tokens matching the PDP modal screenshot. */

export const CUSTOMIZE_TEXT_MODAL_Z_INDEX_CLASS = 'z-[120]';

export const CUSTOMIZE_TEXT_MODAL_BACKDROP_CLASS = [
  'absolute inset-0',
  'bg-black/40 backdrop-blur-[6px]',
].join(' ');

export const CUSTOMIZE_TEXT_MODAL_PANEL_CLASS = [
  'relative z-10 flex w-full max-w-[340px] flex-col',
  'rounded-[16px] bg-white px-5 pb-6 pt-5',
  'shadow-[0_12px_40px_rgba(0,0,0,0.18)]',
].join(' ');

export const CUSTOMIZE_TEXT_MODAL_TITLE_CLASS =
  'font-montserrat text-[22px] font-black leading-none text-black';

export const CUSTOMIZE_TEXT_MODAL_CLOSE_CLASS =
  'absolute right-4 top-4 flex size-8 items-center justify-center text-[#414141]';

/** Isometric pack badge (same as hero top-right) — Figma 95×142. */
export const CUSTOMIZE_TEXT_MODAL_PRODUCT_IMAGE_CLASS =
  'mx-auto mt-4 h-[88px] w-[59px]';

export const CUSTOMIZE_TEXT_MODAL_PREVIEW_WRAP_CLASS =
  'relative mx-auto mt-3 w-full max-w-[260px]';

export const CUSTOMIZE_TEXT_MODAL_PREVIEW_ASPECT_STYLE = {
  containerType: 'inline-size',
  aspectRatio: '450 / 181',
} as const;

/** Slightly larger than hero preview so typed text reads clearly in the compact popup. */
export const CUSTOMIZE_TEXT_MODAL_PREVIEW_TEXT_STYLE = {
  fontSize: '11cqw',
  lineHeight: 0.8,
} as const;

export const CUSTOMIZE_TEXT_MODAL_SAVE_CLASS = [
  'mx-auto mt-6 inline-flex h-10 min-w-[120px] items-center justify-center',
  'rounded-[6px] border border-[#dcc090] bg-white px-8',
  'font-montserrat text-[15px] font-semibold leading-none text-[#dcc090]',
  'transition-colors hover:bg-[#faf8f4]',
].join(' ');

export const CUSTOMIZE_TEXT_MODAL_INPUT_CLASS = [
  'w-full min-w-0 border-0 border-b border-[#dcc090] bg-transparent',
  'pb-0.5 text-[16px] leading-[26px] text-[#414141]',
  'outline-none placeholder:text-[#898989]',
].join(' ');
