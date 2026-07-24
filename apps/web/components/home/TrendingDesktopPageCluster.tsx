import { ProductsCatalogCard } from '../../app/products/components/ProductsCatalogCard';
import {
  getCategoryLabel,
  getSectionLabel,
  getSizeLabel,
  shouldNudgeCatalogProductImage,
} from '../../app/products/components/catalogProductLabels';
import {
  CATALOG_PRODUCT_CARD_MOBILE_ARTICLE_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_IMAGE_FRAME_CLASS_NAME,
  getCatalogProductCardImageScaleBoost,
  getTrendingSectionSmallerImageScaleMultiplier,
} from '../../app/products/components/catalogProductCardMobilePresentation';
import { CLUSTER_INNER_REM } from './trendingFeatured.constants';
import type { TrendingDesktopPageClusterProps } from './trendingFeatured.types';

export function TrendingDesktopPageCluster({
  items,
  catalogStartIndex,
  eager,
  label,
  isFocal,
}: TrendingDesktopPageClusterProps) {
  const displayLabel = label && label !== 'Featured' ? label : '—';

  return (
    <div
      className={`mx-auto flex flex-col items-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isFocal ? '-translate-y-2' : '-translate-y-[6.25rem]'
      }`}
      style={{ width: `${CLUSTER_INNER_REM}rem` }}
    >
      <div className="flex w-full items-end justify-center gap-3">
        {items.map((product, index) => {
          const catalogIndex = catalogStartIndex + index;
          const isMiddle = index === 1;
          const section = getSectionLabel(product);
          return (
            <div key={`${product.id}-${index}`} className={`w-[13rem] shrink-0 ${isMiddle ? 'pt-16' : 'pt-4'}`}>
              <ProductsCatalogCard
                product={product}
                sectionLabel={section}
                sizeLabel={getSizeLabel(product)}
                categoryLabel={getCategoryLabel(product, section)}
                productsCatalogPageScaleMultiplier={getTrendingSectionSmallerImageScaleMultiplier(catalogIndex)}
                imageNudgeDown={shouldNudgeCatalogProductImage(catalogIndex)}
                imageScaleBoost={getCatalogProductCardImageScaleBoost(catalogIndex)}
                imageFrameClassName={CATALOG_PRODUCTS_PAGE_IMAGE_FRAME_CLASS_NAME}
                className={`group ${CATALOG_PRODUCT_CARD_MOBILE_ARTICLE_CLASS_NAME} w-[13rem] max-w-none`}
                compactLayout
                productsCatalogPage
                trendingSectionCard
                eagerProductImage={eager}
              />
            </div>
          );
        })}
      </div>
      <span
        className={`mt-10 max-w-full truncate leading-none text-[#122a26] ${
          isFocal ? 'text-[2rem] font-black' : 'text-[1.5rem] font-extrabold'
        }`}
      >
        {displayLabel}
      </span>
    </div>
  );
}
