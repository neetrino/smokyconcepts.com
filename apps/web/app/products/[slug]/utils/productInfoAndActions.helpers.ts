import type { LanguageCode } from '../../../../lib/language';
import { normalizeHexPalette, parseHexFromText } from './swatch-color-utils';
import type { ProductOptionValue } from '../productInfoAndActions.types';

export const PRODUCT_TAB_HTML_PROSE_CLASS =
  'prose max-w-none text-[15px] leading-[24px] text-[#414141] prose-p:my-0 prose-p:text-[15px] prose-p:leading-[24px] sm:text-[16px] sm:leading-[26px] sm:prose-p:text-[16px] sm:prose-p:leading-[26px]';

const COLOR_SWATCH_FALLBACKS: Record<string, string[]> = {
  black: ['#1d1d1f'],
  green: ['#516349'],
  'forest green': ['#516349'],
  red: ['#7a2c34'],
  'deep red': ['#7a2c34'],
  gold: ['#b3ae78'],
  brown: ['#703d02'],
  white: ['#ffffff'],
  beige: ['#dcc090'],
};

export function hasRenderableTabHtml(html: string | null | undefined): boolean {
  if (!html?.trim()) {
    return false;
  }
  return html.replace(/<[^>]*>/g, '').trim().length > 0;
}

export function getSwatchColors(option: ProductOptionValue): string[] {
  const fromApi = normalizeHexPalette(option.colors);
  if (fromApi.length > 0) {
    return fromApi;
  }

  const fromValue = parseHexFromText(option.value);
  if (fromValue) {
    return [fromValue];
  }

  const fromLabel = parseHexFromText(option.label);
  if (fromLabel) {
    return [fromLabel];
  }

  return (
    COLOR_SWATCH_FALLBACKS[option.label.toLowerCase()] ??
    COLOR_SWATCH_FALLBACKS[option.value.toLowerCase()] ??
    ['#dcc090']
  );
}

export function getShippingCopy(language: LanguageCode): string {
  switch (language) {
    case 'hy':
      return 'Առաքման արժեքն ու վերջնական ժամկետները հաշվարկվում են պատվերի ձևակերպման ժամանակ` ըստ հասցեի և ընտրված եղանակի։';
    case 'ru':
      return 'Стоимость и сроки доставки рассчитываются на этапе оформления заказа в зависимости от адреса и выбранного способа.';
    default:
      return 'Shipping cost and delivery timing are calculated at checkout based on destination and the selected method.';
  }
}

export function matchVariantSizeFromCatalogTitle(title: string, options: ProductOptionValue[]): string | null {
  const normalized = title.trim().toLowerCase();
  const byLabel = options.find((o) => o.label.toLowerCase() === normalized);
  if (byLabel) {
    return byLabel.value;
  }
  const byValue = options.find((o) => o.value.toLowerCase() === normalized);
  return byValue?.value ?? null;
}

export function getCustomizeCopy(language: LanguageCode): string {
  switch (language) {
    case 'hy':
      return 'Ընտրեք գույնը և չափը այս էջում՝ պատվերը անհատականացնելու համար։ Հատուկ ցանկությունների դեպքում կարող եք կապվել մեզ հետ պատվերը ձևակերպելուց հետո։';
    case 'ru':
      return 'Выберите цвет и размер на этой странице, чтобы персонализировать заказ. Для особых пожеланий свяжитесь с нами после оформления.';
    default:
      return 'Pick color and size on this page to personalize your order. For special requests, contact us after checkout.';
  }
}

/** Matches auto-generated or manual "out of stock" product labels across locales. */
export function isOutOfStockProductLabel(labelText: string): boolean {
  const normalized = labelText.toLowerCase().trim();
  return (
    normalized.includes('out of stock') ||
    normalized.includes('արտադրված') ||
    normalized.includes('нет в наличии') ||
    normalized.includes('არ არის მარაგში')
  );
}
