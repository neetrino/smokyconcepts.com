'use client';

import type { MutableRefObject } from 'react';

import {
  CatalogStripProductCard,
} from '../../app/products/components/CatalogStripProductCard';
import {
  getSectionLabel,
  toCatalogProduct,
} from '../../app/products/components/catalogProductLabels';
import { HOME_UPCOMING_MOBILE_ITEM_WRAPPER_CLASS_NAME } from '../../app/products/components/catalogProductCardMobilePresentation';
import {
  UPCOMING_DESKTOP_STRIP_LEADING_INSET_CLASS_NAME,
  UPCOMING_PRODUCT_STRIP_FLEX_CLASS_NAME,
} from './upcomingProducts.constants';
import type { UpcomingApiProduct } from './upcomingProducts.types';

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
            <CatalogStripProductCard
              product={catalogProduct}
              sectionLabel={section}
              index={index}
              isSmUp={isSmUp}
              ctaPreset="home-upcoming"
            />
          </div>
        );
      })}
    </div>
  );
}
