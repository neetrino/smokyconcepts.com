'use client';

import type { MutableRefObject } from 'react';

import { ProductsCatalogCard } from '../../app/products/components/ProductsCatalogCard';
import {
  getCategoryLabel,
  getSectionLabel,
  getSizeLabel,
  shouldNudgeCatalogProductImage,
  toCatalogProduct,
} from '../../app/products/components/catalogProductLabels';
import {
  CATALOG_PRODUCT_CARD_MOBILE_ARTICLE_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_DESKTOP_CARD_TOP_PADDING_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_DESKTOP_DETAILS_OFFSET_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_DESKTOP_HERO_PULL_UP_CLASS_NAME,
  HOME_UPCOMING_MOBILE_ITEM_WRAPPER_CLASS_NAME,
  getCatalogStripMobileImageFrameClassName,
  getCatalogStripMobileImageScaleMultiplier,
  PRODUCTS_CATALOG_LANDING_MOBILE_IMAGE_BOTTOM_MARGIN_CLASS_NAME,
  getCatalogProductCardImageScaleBoost,
} from '../../app/products/components/catalogProductCardMobilePresentation';
import {
  UPCOMING_DESKTOP_STRIP_LEADING_INSET_CLASS_NAME,
  UPCOMING_PRODUCT_STRIP_FLEX_CLASS_NAME,
} from './upcomingProducts.constants';
import type { UpcomingApiProduct } from './upcomingProducts.types';
import { useTranslation } from '@/lib/i18n-client';

interface UpcomingProductStripProps {
  items: UpcomingApiProduct[];
  cardsPerPage: number;
  isSmUp: boolean;
  pageStartRefs: MutableRefObject<(HTMLDivElement | null)[]>;
}

export function UpcomingProductStrip({
  items,
  cardsPerPage,
  isSmUp,
  pageStartRefs,
}: UpcomingProductStripProps) {
  const { t } = useTranslation();

  return (
    <div className={UPCOMING_PRODUCT_STRIP_FLEX_CLASS_NAME}>
      <div className={UPCOMING_DESKTOP_STRIP_LEADING_INSET_CLASS_NAME} aria-hidden="true" />
      {items.map((item, index) => {
        const pageIndex = Math.floor(index / cardsPerPage);
        const isPageStart = index % cardsPerPage === 0;
        const catalogProduct = toCatalogProduct({
          id: item.id,
          slug: item.slug,
          title: item.title,
          price: item.price,
          image: item.image,
          images: item.images,
          inStock: item.inStock,
          originalPrice: item.originalPrice ?? null,
          defaultVariantId: item.defaultVariantId ?? null,
          defaultVariantStock: item.defaultVariantStock ?? 0,
          defaultSku: item.defaultSku ?? '',
          categories: item.categories,
          skus: item.skus,
        });
        const section = getSectionLabel(catalogProduct);

        return (
          <div
            key={`upcoming-${index}-${item.id}`}
            ref={(el) => {
              if (isPageStart) {
                pageStartRefs.current[pageIndex] = el;
              }
            }}
            className={`flex min-h-0 shrink-0 flex-col self-stretch ${HOME_UPCOMING_MOBILE_ITEM_WRAPPER_CLASS_NAME}`}
          >
            <ProductsCatalogCard
              product={catalogProduct}
              sectionLabel={section}
              sizeLabel={getSizeLabel(catalogProduct)}
              categoryLabel={getCategoryLabel(catalogProduct, section)}
              buyButtonLabel={t('home.homepage.upcoming.orderCta')}
              unifiedNavCta
              productsCatalogPageScaleMultiplier={getCatalogStripMobileImageScaleMultiplier(index, isSmUp)}
              imageNudgeDown={shouldNudgeCatalogProductImage(index)}
              imageScaleBoost={getCatalogProductCardImageScaleBoost(index)}
              imageFrameClassName={getCatalogStripMobileImageFrameClassName(index)}
              catalogHeroPullUpClassName={CATALOG_PRODUCTS_PAGE_DESKTOP_HERO_PULL_UP_CLASS_NAME}
              catalogCardTopPaddingClassName={CATALOG_PRODUCTS_PAGE_DESKTOP_CARD_TOP_PADDING_CLASS_NAME}
              catalogDetailsOffsetClassName={CATALOG_PRODUCTS_PAGE_DESKTOP_DETAILS_OFFSET_CLASS_NAME}
              catalogImageBottomMarginClassName={PRODUCTS_CATALOG_LANDING_MOBILE_IMAGE_BOTTOM_MARGIN_CLASS_NAME}
              className={`group ${CATALOG_PRODUCT_CARD_MOBILE_ARTICLE_CLASS_NAME} max-sm:!w-full max-sm:!min-w-0 max-sm:!max-w-none lg:!w-[11.75rem] lg:!min-w-[11.75rem] xl:!w-[12rem] xl:!min-w-[12rem]`}
              catalogStripMobilePeek={isSmUp}
              compactLayout
              productsCatalogPage
              eagerProductImage
            />
          </div>
        );
      })}
    </div>
  );
}
