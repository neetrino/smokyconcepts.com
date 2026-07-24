import { HOME_PAGE_MOBILE_CAROUSEL_SLOT_WIDTH_CSS } from '../../app/products/components/catalogProductCardMobilePresentation';
import { TrendingDesktopPageCluster } from './TrendingDesktopPageCluster';
import { TrendingMobilePageCluster } from './TrendingMobilePageCluster';
import { ITEMS_PER_PAGE, PAGE_FRAME_REM, TRACK_EASING, TRACK_TRANSITION_MS } from './trendingFeatured.constants';
import type { TrendingCoverflowTrackProps } from './trendingFeatured.types';

/** Horizontal track: focal cluster centered; neighbours fade (same motion on mobile + desktop). */
export function TrendingCoverflowTrack({
  pages,
  currentDisplayIndex,
  currentLogicalIndex,
  suppressTransition,
  isXl,
}: TrendingCoverflowTrackProps) {
  const totalPages = pages.length;
  if (totalPages === 0) {
    return null;
  }

  const displaySlots =
    totalPages > 1
      ? [
          { key: `clone-left-${pages[totalPages - 1].key}`, page: pages[totalPages - 1], logicalIndex: totalPages - 1 },
          ...pages.map((page, logicalIndex) => ({ key: page.key, page, logicalIndex })),
          { key: `clone-right-${pages[0].key}`, page: pages[0], logicalIndex: 0 },
        ]
      : [{ key: pages[0].key, page: pages[0], logicalIndex: 0 }];

  const trackTransition = suppressTransition
    ? 'none'
    : `transform ${TRACK_TRANSITION_MS}ms ${TRACK_EASING}`;
  const slotTransition = suppressTransition
    ? 'none'
    : `opacity ${TRACK_TRANSITION_MS}ms ${TRACK_EASING}, transform ${TRACK_TRANSITION_MS}ms ${TRACK_EASING}`;

  const trackWidthStyle = isXl
    ? { width: `${displaySlots.length * PAGE_FRAME_REM}rem` }
    : { width: `calc(${displaySlots.length} * ${HOME_PAGE_MOBILE_CAROUSEL_SLOT_WIDTH_CSS})` };
  const trackTransformStyle = isXl
    ? { transform: `translateX(-${(currentDisplayIndex + 0.5) * PAGE_FRAME_REM}rem)` }
    : {
        transform: `translateX(calc(-1 * (${currentDisplayIndex + 0.5}) * ${HOME_PAGE_MOBILE_CAROUSEL_SLOT_WIDTH_CSS}))`,
      };

  return (
    <div className="relative z-0 min-w-0 w-full overflow-x-hidden max-sm:mb-2 max-sm:pt-[5.5rem] sm:mt-1 sm:max-xl:pt-12">
      <div
        className="flex items-end will-change-transform"
        style={{
          ...trackWidthStyle,
          // marginLeft: 50% pins track's left edge to parent's horizontal center;
          // translateX then shifts so the focal cluster's center sits at parent center.
          marginLeft: '50%',
          ...trackTransformStyle,
          transition: trackTransition,
        }}
      >
        {displaySlots.map(({ key, page, logicalIndex }) => {
          const rawDistance = Math.abs(logicalIndex - currentLogicalIndex);
          const distance =
            totalPages > 0 ? Math.min(rawDistance, totalPages - rawDistance) : 0;
          const isFocal = distance === 0;
          const isAdjacent = distance === 1;
          const opacity = isFocal ? 1 : isAdjacent ? 0.5 : 0;
          const scale = isFocal ? 1 : 0.78;

          return (
            <div
              key={key}
              aria-hidden={!isFocal}
              className="shrink-0 max-sm:w-[calc(100vw-2.5rem)]"
              style={{
                width: isXl ? `${PAGE_FRAME_REM}rem` : HOME_PAGE_MOBILE_CAROUSEL_SLOT_WIDTH_CSS,
                opacity,
                transform: `scale(${scale})`,
                transformOrigin: 'center bottom',
                transition: slotTransition,
                pointerEvents: isFocal ? 'auto' : 'none',
              }}
            >
              {isXl ? (
                <TrendingDesktopPageCluster
                  items={page.items}
                  catalogStartIndex={logicalIndex * ITEMS_PER_PAGE}
                  eager={isFocal || isAdjacent}
                  label={page.categoryLabel}
                  isFocal={isFocal}
                />
              ) : (
                <TrendingMobilePageCluster
                  items={page.items}
                  catalogStartIndex={logicalIndex * ITEMS_PER_PAGE}
                  eager={isFocal || isAdjacent}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
