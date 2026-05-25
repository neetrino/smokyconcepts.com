import { HOME_PAGE_MOBILE_CAROUSEL_SLOT_WIDTH_CSS } from '../../app/products/components/catalogProductCardMobilePresentation';
import { TrendingDesktopPageCluster } from './TrendingDesktopPageCluster';
import { TrendingMobilePageCluster } from './TrendingMobilePageCluster';
import {
  ITEMS_PER_PAGE,
  PAGE_FRAME_REM,
  TRACK_EASING,
  TRACK_TRANSITION_MS,
  TRENDING_TRACK_BUFFER_COPIES,
} from './trendingFeatured.constants';
import type { TrendingCoverflowTrackProps } from './trendingFeatured.types';

/** Clone-strip coverflow track — focal cluster centered, neighbours fade (classic flip). */
export function TrendingCoverflowTrack({
  pages,
  currentDisplayIndex,
  suppressTransition,
  isXl,
  trackRef,
  onTrackTransitionEnd,
  dragOffsetPx = 0,
  isDragging = false,
}: TrendingCoverflowTrackProps) {
  const totalPages = pages.length;
  if (totalPages === 0) {
    return null;
  }

  const displaySlots =
    totalPages > 1
      ? Array.from({ length: TRENDING_TRACK_BUFFER_COPIES }, (_, blockIndex) =>
          pages.map((page, logicalIndex) => ({
            key: `${blockIndex}-${page.key}`,
            page,
            logicalIndex,
            slotIndex: blockIndex * totalPages + logicalIndex,
          }))
        ).flat()
      : [{ key: pages[0].key, page: pages[0], logicalIndex: 0, slotIndex: 0 }];

  const trackTransition =
    suppressTransition || isDragging
      ? 'none'
      : `transform ${TRACK_TRANSITION_MS}ms ${TRACK_EASING}`;
  const slotTransition = suppressTransition
    ? 'none'
    : `opacity ${TRACK_TRANSITION_MS}ms ${TRACK_EASING}, transform ${TRACK_TRANSITION_MS}ms ${TRACK_EASING}`;
  const currentLogicalIndex =
    totalPages > 0 ? ((currentDisplayIndex % totalPages) + totalPages) % totalPages : 0;

  const trackWidthStyle = isXl
    ? { width: `${displaySlots.length * PAGE_FRAME_REM}rem` }
    : { width: `calc(${displaySlots.length} * ${HOME_PAGE_MOBILE_CAROUSEL_SLOT_WIDTH_CSS})` };
  const mobileDragOffset =
    !isXl && dragOffsetPx !== 0 ? ` + ${dragOffsetPx}px` : '';
  const trackTransformStyle = isXl
    ? { transform: `translateX(-${(currentDisplayIndex + 0.5) * PAGE_FRAME_REM}rem)` }
    : {
        transform: `translateX(calc(-1 * (${currentDisplayIndex + 0.5}) * ${HOME_PAGE_MOBILE_CAROUSEL_SLOT_WIDTH_CSS}${mobileDragOffset}))`,
      };

  return (
    <div className="relative z-0 min-w-0 w-full overflow-x-hidden max-sm:mb-2 max-sm:pt-[5.5rem] sm:mt-1 sm:max-xl:pt-12">
      <div
        ref={trackRef}
        className="flex items-end will-change-transform"
        onTransitionEnd={onTrackTransitionEnd}
        style={{
          ...trackWidthStyle,
          marginLeft: '50%',
          ...trackTransformStyle,
          transition: trackTransition,
        }}
      >
        {displaySlots.map(({ key, page, logicalIndex, slotIndex }) => {
          const physicalDistance = Math.abs(slotIndex - currentDisplayIndex);
          const isFocal = physicalDistance === 0;
          const isAdjacent = physicalDistance === 1;
          const rawLogicalDistance = Math.abs(logicalIndex - currentLogicalIndex);
          const logicalDistance =
            totalPages > 0 ? Math.min(rawLogicalDistance, totalPages - rawLogicalDistance) : 0;
          const eagerSlot = logicalDistance <= 1;
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
                  eager={eagerSlot}
                  label={page.categoryLabel}
                  isFocal={isFocal}
                  freezeClusterMotion={suppressTransition}
                />
              ) : (
                <TrendingMobilePageCluster
                  items={page.items}
                  catalogStartIndex={logicalIndex * ITEMS_PER_PAGE}
                  eager={eagerSlot}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
