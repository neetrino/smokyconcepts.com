'use client';

import { useTranslation } from '@/lib/i18n-client';
import {
  CATALOG_PRODUCT_CARD_MOBILE_ARTICLE_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_DESKTOP_CARD_TOP_PADDING_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_DESKTOP_DETAILS_OFFSET_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_DESKTOP_HERO_PULL_UP_CLASS_NAME,
  getCatalogProductCardImageScaleBoost,
  getCatalogStripMobileImageFrameClassName,
  getCatalogStripMobileImageScaleMultiplier,
  PRODUCTS_CATALOG_LANDING_MOBILE_IMAGE_BOTTOM_MARGIN_CLASS_NAME,
} from './catalogProductCardMobilePresentation';
import type { CatalogProduct } from './catalogProductLabels';
import { getCategoryLabel, getSizeLabel, shouldNudgeCatalogProductImage } from './catalogProductLabels';
import { ProductsCatalogCard } from './ProductsCatalogCard';

/** Shared article classes for `/products`, home upcoming, and PDP related strips. */
export const CATALOG_STRIP_PRODUCT_CARD_ARTICLE_CLASS_NAME = `group ${CATALOG_PRODUCT_CARD_MOBILE_ARTICLE_CLASS_NAME} max-sm:!w-full max-sm:!min-w-0 max-sm:!max-w-none`;

export type CatalogStripProductCardCtaPreset =
  | 'products-catalog'
  | 'home-upcoming'
  | 'related-products';

export interface CatalogStripProductCardProps {
  product: CatalogProduct;
  sectionLabel: string;
  index: number;
  isSmUp: boolean;
  ctaPreset: CatalogStripProductCardCtaPreset;
  catalogStripMobilePeek?: boolean;
}

function resolveStripBuyButtonLabel(
  preset: CatalogStripProductCardCtaPreset,
  t: (key: string) => string
): string {
  switch (preset) {
    case 'home-upcoming':
      return t('home.homepage.upcoming.orderCta');
    case 'related-products':
      return t('common.buttons.shop');
    case 'products-catalog':
    default:
      return t('product.buy_now');
  }
}

/**
 * Canonical horizontal-strip product card — same layout on desktop `/products`, home upcoming, and PDP related.
 * Only the CTA label differs per {@link CatalogStripProductCardCtaPreset}.
 */
export function CatalogStripProductCard({
  product,
  sectionLabel,
  index,
  isSmUp,
  ctaPreset,
  catalogStripMobilePeek = isSmUp,
}: CatalogStripProductCardProps) {
  const { t } = useTranslation();

  return (
    <ProductsCatalogCard
      product={product}
      sectionLabel={sectionLabel}
      sizeLabel={getSizeLabel(product)}
      categoryLabel={getCategoryLabel(product, sectionLabel)}
      buyButtonLabel={resolveStripBuyButtonLabel(ctaPreset, t)}
      catalogBuyOnlyCta
      productsCatalogPageScaleMultiplier={getCatalogStripMobileImageScaleMultiplier(index, isSmUp)}
      imageNudgeDown={shouldNudgeCatalogProductImage(index)}
      imageScaleBoost={getCatalogProductCardImageScaleBoost(index)}
      imageFrameClassName={getCatalogStripMobileImageFrameClassName(index)}
      catalogHeroPullUpClassName={CATALOG_PRODUCTS_PAGE_DESKTOP_HERO_PULL_UP_CLASS_NAME}
      catalogCardTopPaddingClassName={CATALOG_PRODUCTS_PAGE_DESKTOP_CARD_TOP_PADDING_CLASS_NAME}
      catalogDetailsOffsetClassName={CATALOG_PRODUCTS_PAGE_DESKTOP_DETAILS_OFFSET_CLASS_NAME}
      catalogImageBottomMarginClassName={PRODUCTS_CATALOG_LANDING_MOBILE_IMAGE_BOTTOM_MARGIN_CLASS_NAME}
      className={CATALOG_STRIP_PRODUCT_CARD_ARTICLE_CLASS_NAME}
      catalogStripMobilePeek={catalogStripMobilePeek}
      compactLayout
      productsCatalogPage
      eagerProductImage
    />
  );
}
