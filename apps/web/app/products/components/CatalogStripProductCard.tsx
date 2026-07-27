'use client';

import { useTranslation } from '@/lib/i18n-client';
import {
  CATALOG_PRODUCT_CARD_MOBILE_ARTICLE_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_DESKTOP_CARD_TOP_PADDING_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_DESKTOP_DETAILS_OFFSET_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_DESKTOP_HERO_PULL_UP_CLASS_NAME,
  getCatalogProductCardImageScaleBoost,
  getCatalogStripMobileImageFrameClassName,
  PRODUCTS_CATALOG_LANDING_MOBILE_IMAGE_BOTTOM_MARGIN_CLASS_NAME,
} from './catalogProductCardMobilePresentation';
import type { CatalogProduct } from './catalogProductLabels';
import { getCategoryLabel, getSizeLabel, shouldNudgeCatalogProductImage } from './catalogProductLabels';
import { ProductsCatalogCard } from './ProductsCatalogCard';

/** Shared article classes for catalog strips and home trending clusters. */
export const CATALOG_STRIP_PRODUCT_CARD_ARTICLE_CLASS_NAME = `group ${CATALOG_PRODUCT_CARD_MOBILE_ARTICLE_CLASS_NAME} max-sm:!w-full max-sm:!min-w-0 max-sm:!max-w-none`;

export type CatalogStripProductCardCtaPreset =
  | 'products-catalog'
  | 'home-upcoming'
  | 'home-trending'
  | 'related-products';

export interface CatalogStripProductCardProps {
  product: CatalogProduct;
  sectionLabel: string;
  selectedSize?: string;
  selectedSizeCatalogCategoryId?: string | null;
  selectedSizeCatalogCategoryTitle?: string | null;
  index: number;
  isSmUp: boolean;
  ctaPreset: CatalogStripProductCardCtaPreset;
  catalogStripMobilePeek?: boolean;
  eagerProductImage?: boolean;
  /** Overrides default strip article classes (e.g. trending carousel cell). */
  articleClassName?: string;
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
    case 'home-trending':
      return t('home.homepage.trending.shopCta');
    case 'products-catalog':
    default:
      return t('product.buy_now');
  }
}

/**
 * Canonical storefront product card — `/products`, home upcoming/trending, PDP related.
 * Only the CTA label differs per {@link CatalogStripProductCardCtaPreset}.
 */
export function CatalogStripProductCard({
  product,
  sectionLabel,
  selectedSize,
  selectedSizeCatalogCategoryId,
  selectedSizeCatalogCategoryTitle,
  index,
  isSmUp,
  ctaPreset,
  catalogStripMobilePeek = isSmUp,
  eagerProductImage = false,
  articleClassName = CATALOG_STRIP_PRODUCT_CARD_ARTICLE_CLASS_NAME,
}: CatalogStripProductCardProps) {
  const { t } = useTranslation();

  return (
    <ProductsCatalogCard
      product={product}
      sectionLabel={sectionLabel}
      sizeLabel={getSizeLabel(product)}
      selectedSize={selectedSize}
      selectedSizeCatalogCategoryId={selectedSizeCatalogCategoryId}
      selectedSizeCatalogCategoryTitle={selectedSizeCatalogCategoryTitle}
      categoryLabel={getCategoryLabel(product, sectionLabel)}
      buyButtonLabel={resolveStripBuyButtonLabel(ctaPreset, t)}
      catalogBuyOnlyCta
      productsCatalogPageScaleMultiplier={1}
      imageNudgeDown={shouldNudgeCatalogProductImage(index)}
      imageScaleBoost={getCatalogProductCardImageScaleBoost(index)}
      imageFrameClassName={getCatalogStripMobileImageFrameClassName(index)}
      catalogHeroPullUpClassName={CATALOG_PRODUCTS_PAGE_DESKTOP_HERO_PULL_UP_CLASS_NAME}
      catalogCardTopPaddingClassName={CATALOG_PRODUCTS_PAGE_DESKTOP_CARD_TOP_PADDING_CLASS_NAME}
      catalogDetailsOffsetClassName={CATALOG_PRODUCTS_PAGE_DESKTOP_DETAILS_OFFSET_CLASS_NAME}
      catalogImageBottomMarginClassName={PRODUCTS_CATALOG_LANDING_MOBILE_IMAGE_BOTTOM_MARGIN_CLASS_NAME}
      className={articleClassName}
      catalogStripMobilePeek={catalogStripMobilePeek}
      compactLayout
      productsCatalogPage
      eagerProductImage={eagerProductImage}
    />
  );
}
