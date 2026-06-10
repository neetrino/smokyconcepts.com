import { CatalogStripProductCard } from '../../app/products/components/CatalogStripProductCard';
import { getSectionLabel } from '../../app/products/components/catalogProductLabels';
import { CLUSTER_INNER_REM } from './trendingFeatured.constants';
import type { TrendingDesktopPageClusterProps } from './trendingFeatured.types';

export function TrendingDesktopPageCluster({
  items,
  catalogStartIndex,
  eager,
  label,
  isFocal,
  freezeClusterMotion = false,
}: TrendingDesktopPageClusterProps) {
  const displayLabel = label && label !== 'Featured' ? label : '—';
  const clusterMotionClassName = freezeClusterMotion
    ? ''
    : 'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';

  return (
    <div
      className={`mx-auto flex flex-col items-center ${clusterMotionClassName} ${
        isFocal ? '-translate-y-2' : '-translate-y-[6.25rem]'
      }`}
      style={{ width: `${CLUSTER_INNER_REM}rem` }}
    >
      <div className="flex w-full items-end justify-center gap-5">
        {items.map((product, index) => {
          const catalogIndex = catalogStartIndex + index;
          const isMiddle = index === 1;
          const section = getSectionLabel(product);
          return (
            <div key={`${product.id}-${index}`} className={`shrink-0 ${isMiddle ? 'pt-16' : 'pt-4'}`}>
              <CatalogStripProductCard
                product={product}
                sectionLabel={section}
                index={catalogIndex}
                isSmUp
                ctaPreset="home-trending"
                catalogStripMobilePeek={false}
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
