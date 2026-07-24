import { ProductsCatalogCard } from '../../app/products/components/ProductsCatalogCard';
import {
  getCategoryLabel,
  getSectionLabel,
  getSizeLabel,
  shouldNudgeCatalogProductImage,
} from '../../app/products/components/catalogProductLabels';
import {
  CATALOG_PRODUCT_CARD_MOBILE_ARTICLE_CLASS_NAME,
  HOME_PAGE_MOBILE_STRIP_CARD_WIDTH_CLASS_NAME,
  HOME_TRENDING_MOBILE_CARD_TOP_PADDING_CLASS_NAME,
  HOME_TRENDING_MOBILE_DETAILS_OFFSET_CLASS_NAME,
  HOME_TRENDING_MOBILE_IMAGE_BOTTOM_MARGIN_CLASS_NAME,
  HOME_TRENDING_MOBILE_HERO_PULL_UP_CLASS_NAME,
  HOME_TRENDING_MOBILE_IMAGE_FRAME_CLASS_NAME,
  getCatalogProductCardImageScaleBoost,
  getTrendingSectionSmallerImageScaleMultiplier,
} from '../../app/products/components/catalogProductCardMobilePresentation';
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
            <ProductsCatalogCard
              product={product}
              sectionLabel={section}
              sizeLabel={getSizeLabel(product)}
              categoryLabel={getCategoryLabel(product, section)}
              productsCatalogPageScaleMultiplier={getTrendingSectionSmallerImageScaleMultiplier(catalogIndex)}
              imageNudgeDown={shouldNudgeCatalogProductImage(catalogIndex)}
              imageScaleBoost={getCatalogProductCardImageScaleBoost(catalogIndex)}
              imageFrameClassName={HOME_TRENDING_MOBILE_IMAGE_FRAME_CLASS_NAME}
              catalogHeroPullUpClassName={HOME_TRENDING_MOBILE_HERO_PULL_UP_CLASS_NAME}
              catalogCardTopPaddingClassName={HOME_TRENDING_MOBILE_CARD_TOP_PADDING_CLASS_NAME}
              catalogDetailsOffsetClassName={HOME_TRENDING_MOBILE_DETAILS_OFFSET_CLASS_NAME}
              catalogImageBottomMarginClassName={HOME_TRENDING_MOBILE_IMAGE_BOTTOM_MARGIN_CLASS_NAME}
              className={`group ${CATALOG_PRODUCT_CARD_MOBILE_ARTICLE_CLASS_NAME} max-sm:!w-full max-sm:!min-w-0 max-sm:!max-w-none`}
              compactLayout
              productsCatalogPage
              trendingSectionCard
              eagerProductImage={eager}
            />
          </div>
        );
      })}
    </div>
  );
}
