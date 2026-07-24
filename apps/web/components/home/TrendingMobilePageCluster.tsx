import { CatalogStripProductCard } from '../../app/products/components/CatalogStripProductCard';
import { getSectionLabel } from '../../app/products/components/catalogProductLabels';
import { HOME_PAGE_MOBILE_STRIP_CARD_WIDTH_CLASS_NAME } from '../../app/products/components/catalogProductCardMobilePresentation';
import type { TrendingMobilePageClusterProps } from './trendingFeatured.types';

/** Staggered 2-column cluster (mobile home trending layout). */
export function TrendingMobilePageCluster({ items, catalogStartIndex, eager }: TrendingMobilePageClusterProps) {
  return (
    <div className="mx-auto grid w-full min-w-0 max-w-[calc(100vw-2.5rem)] grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start justify-items-center gap-x-4 gap-y-3 sm:max-w-none sm:gap-x-5 sm:gap-y-4">
      {items.map((product, index) => {
        const catalogIndex = catalogStartIndex + index;
        const section = getSectionLabel(product);
        const mobileCellZ =
          index === 1 ? 'relative z-[3]' : index === 0 ? 'relative z-[2]' : 'relative z-[1]';
        return (
          <div
            key={`trending-mobile-${product.id}-${index}`}
            className={`${mobileCellZ} ${HOME_PAGE_MOBILE_STRIP_CARD_WIDTH_CLASS_NAME} flex min-w-0 max-w-full flex-col justify-center justify-self-center ${
              index === 1 ? 'pt-[9.75rem]' : index === 2 ? '-mt-[6.75rem] pt-3' : 'pt-3'
            }`}
          >
            <CatalogStripProductCard
              product={product}
              sectionLabel={section}
              index={catalogIndex}
              isSmUp={false}
              ctaPreset="home-trending"
              catalogStripMobilePeek={false}
              eagerProductImage={eager}
            />
          </div>
        );
      })}
    </div>
  );
}
