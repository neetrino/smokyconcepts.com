import Link from 'next/link';

import { getProductsPathWithScrollCategory } from '@/lib/constants/products-catalog.constants';
import { HOME_ASSET_PATHS } from './homePage.data';
import type { HomeCoverCollectionItem } from './homePage.types';

/** Mobile: overlap above panel; image slot nudged up for visual balance. */
const COVER_COLLECTION_MOBILE_PANEL_OVERLAP_CLASS = 'max-sm:pt-[clamp(1.25rem,6vw,2rem)]';
const COVER_COLLECTION_MOBILE_LINK_MARGIN_TOP_CLASS = 'max-sm:mt-1';
/** Mobile: raise only the white panel; image compensates downward to stay put. */
const COVER_COLLECTION_MOBILE_BG_NUDGE_UP_CLASS = 'max-sm:-mt-4';
/** Image overlap includes BG nudge compensation so the hero stays fixed.
 * Below 384px: lower the hero a bit so it does not sit too high on narrow tiles.
 */
const COVER_COLLECTION_MOBILE_IMAGE_OVERLAP_CLASS =
  'max-sm:-top-7 max-sm:-translate-y-[3.25rem] max-[383px]:-top-4 max-[383px]:-translate-y-9';
/** Mobile: nudge category title down inside the white panel. */
const COVER_COLLECTION_MOBILE_TITLE_OFFSET_CLASS = 'max-sm:translate-y-4';
/** Desktop: card height follows content so the grid row does not add empty space below the title. */
const COVER_COLLECTION_DESKTOP_CARD_HEIGHT_CLASS = 'sm:h-auto';
/** Desktop: white card padding below category title. */
const COVER_COLLECTION_DESKTOP_CARD_PADDING_BOTTOM_CLASS = 'sm:pb-4';
/** Desktop: top padding grows the white panel upward behind the hero. */
const COVER_COLLECTION_DESKTOP_CARD_PADDING_TOP_CLASS = 'sm:pt-8';
/** Desktop: how far the hero hangs above the white panel top edge. */
const COVER_COLLECTION_DESKTOP_IMAGE_PULL_UP_CLASS = 'sm:-mt-16';
/** Desktop: slight title nudge; keep minimal to avoid empty band under label. */
const COVER_COLLECTION_DESKTOP_TITLE_OFFSET_CLASS = 'sm:translate-y-1';
/** Mobile: category titles centered under the hero image. */
const COVER_COLLECTION_MOBILE_TITLE_ALIGN_CLASS = 'max-sm:text-center';
/** Mobile: symmetric inset for centered labels. */
const COVER_COLLECTION_MOBILE_TITLE_IMAGE_ALIGN_CLASS =
  'max-sm:px-[clamp(0.375rem,2vw,0.5rem)]';
/** White card panel height on mobile. */
const COVER_COLLECTION_MOBILE_CARD_MIN_HEIGHT_CLASS =
  'max-sm:min-h-[clamp(10rem,50vw,12.25rem)] max-[360px]:min-h-[9.5rem]';
/** Compact tile overrides at ≤360px; ~390px+ keeps standard mobile sizing. */
/**
 * Desktop: product hero transform (uniform scale avoids raster stretch).
 * Mobile: image slot slightly above Figma Mob `4345:2059` baseline (`max-sm:`).
 * Image-only nudge — white panel position stays fixed.
 */
const COVER_COLLECTION_PRODUCT_IMAGE_TRANSFORM_CLASS =
  'origin-bottom max-sm:translate-y-0 max-sm:scale-[1.14] translate-y-4 scale-[1.14] sm:translate-y-[0.5rem] sm:scale-[1.18] sm:group-hover:translate-y-0 sm:group-hover:scale-[1.25] max-[360px]:scale-[1.04] min-[390px]:max-sm:scale-[1.18]';

const TITLE_MIN_HEIGHT_MOBILE = 'min-h-[2.75rem]';
const COVER_COLLECTION_COMPACT_MOBILE_TITLE_MIN_HEIGHT_CLASS = 'max-[360px]:min-h-[2.375rem]';
/** Mobile: unified tile label size (matches Special Edition). */
const COVER_COLLECTION_MOBILE_TITLE_SIZE_CLASS =
  'max-sm:text-[clamp(0.8125rem,4vw,1rem)] max-[360px]:text-[0.75rem] max-[360px]:tracking-tight';

/** Mobile image band width in 2-col grid; desktop capped so wider cards do not stretch hero height. */
const COVER_COLLECTION_IMAGE_SLOT_MAX_WIDTH_CLASS =
  'max-sm:max-w-[clamp(5.125rem,67.5%,8.125rem)] sm:max-w-[12rem]';

const MOBILE_LINK_TOP_PADDING_CLASS = `${COVER_COLLECTION_MOBILE_PANEL_OVERLAP_CLASS} max-sm:shadow-none`;

/** Figma Mob — white card shell fills grid cell; `sm:contents` hoists children for desktop layout. */
const COVER_COLLECTION_MOBILE_CARD_WIDTH_CLASS = 'max-sm:w-full max-sm:min-w-0';
const MOBILE_CARD_SHELL_CLASS = [
  `max-sm:relative max-sm:flex ${COVER_COLLECTION_MOBILE_CARD_MIN_HEIGHT_CLASS} max-sm:w-full max-sm:min-w-0 max-sm:flex-col max-sm:justify-end max-sm:overflow-visible max-sm:rounded-[clamp(1.125rem,6vw,1.5rem)] max-sm:bg-white max-sm:pb-[clamp(0.375rem,1.8vw,0.5rem)] max-sm:pl-0 max-sm:pr-[clamp(0.375rem,2vw,0.5rem)] max-sm:shadow-[0_8px_28px_rgba(18,42,38,0.12)]`,
  COVER_COLLECTION_MOBILE_BG_NUDGE_UP_CLASS,
  COVER_COLLECTION_MOBILE_CARD_WIDTH_CLASS,
  'sm:contents sm:mx-0 sm:w-full sm:translate-x-0',
].join(' ');

/** Mobile: absolute image slot; desktop: existing flow layout. */
const COVER_COLLECTION_IMAGE_OUTER_CLASS = [
  'max-sm:absolute max-sm:left-1/2 max-sm:z-10 max-sm:flex max-sm:h-[clamp(10.75rem,57.5vw,14.75rem)] max-sm:w-full max-sm:-translate-x-1/2 max-sm:items-end max-sm:justify-center max-sm:overflow-visible max-[360px]:h-[10.5rem]',
  COVER_COLLECTION_MOBILE_IMAGE_OVERLAP_CLASS,
  'relative z-10 mx-auto flex h-[12.25rem] w-full shrink-0 items-end justify-center sm:z-auto sm:mb-0 sm:h-[18rem] sm:max-w-none sm:translate-y-0',
  COVER_COLLECTION_DESKTOP_IMAGE_PULL_UP_CLASS,
  COVER_COLLECTION_IMAGE_SLOT_MAX_WIDTH_CLASS,
].join(' ');

interface CoverCollectionProductCardProps {
  item: HomeCoverCollectionItem;
}

/**
 * Home “Cover collections” tile.
 *
 * **Mobile:** white panel, `24px` radius, enlarged hero slot overlapping the panel,
 * fluid Montserrat ExtraBold title centered under the hero image
 * (`#414141`). **Desktop:** single white card with hero image overlap.
 */
export function CoverCollectionProductCard({ item }: CoverCollectionProductCardProps) {
  const href = getProductsPathWithScrollCategory(item.slug);
  const isSpecialEdition = item.slug === 'special-edition';
  const titleClampClass = isSpecialEdition
    ? 'line-clamp-1 truncate whitespace-nowrap max-[389px]:leading-snug'
    : 'line-clamp-2 break-words';
  const titleSizeClass = COVER_COLLECTION_MOBILE_TITLE_SIZE_CLASS;

  return (
    <Link
      href={href}
      className={`group relative z-0 mt-4 flex h-full min-h-0 w-full min-w-0 flex-col overflow-visible pt-0 transition-shadow duration-200 hover:z-10 focus-visible:z-10 focus-within:z-10 max-sm:max-w-none ${COVER_COLLECTION_MOBILE_LINK_MARGIN_TOP_CLASS} ${MOBILE_LINK_TOP_PADDING_CLASS} ${COVER_COLLECTION_DESKTOP_CARD_HEIGHT_CLASS} sm:mt-8 sm:rounded-[2rem] sm:bg-white sm:px-6 ${COVER_COLLECTION_DESKTOP_CARD_PADDING_TOP_CLASS} ${COVER_COLLECTION_DESKTOP_CARD_PADDING_BOTTOM_CLASS} sm:shadow-[0_6px_24px_rgba(18,42,38,0.05)] sm:hover:shadow-[0_12px_32px_rgba(18,42,38,0.12)]`}
    >
      <div className={MOBILE_CARD_SHELL_CLASS}>
        <div className={COVER_COLLECTION_IMAGE_OUTER_CLASS}>
          {item.imageSrc ? (
            <img
              src={item.imageSrc}
              alt={item.title}
              className={`max-h-full max-w-full object-contain object-top transition-transform duration-300 ease-out ${COVER_COLLECTION_PRODUCT_IMAGE_TRANSFORM_CLASS}`}
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <img
                src={HOME_ASSET_PATHS.packMark}
                alt=""
                className="h-20 w-16 origin-bottom object-contain opacity-60 transition-transform duration-300 ease-out max-sm:scale-[1.2] sm:h-24 sm:w-[4.5rem] sm:scale-[1.1] sm:group-hover:-translate-y-2 sm:group-hover:scale-[1.15]"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
        <div className="relative z-0 flex flex-1 flex-col justify-end rounded-[1rem] shadow-[0_8px_28px_rgba(18,42,38,0.12)] transition-shadow duration-200 max-sm:min-h-0 max-sm:rounded-none max-sm:bg-transparent max-sm:px-0 max-sm:pb-0 max-sm:shadow-none max-sm:group-hover:shadow-none sm:min-h-0 sm:flex-none sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
          <h3
            className={`relative z-[1] w-full min-w-0 font-montserrat font-extrabold leading-normal text-[#414141] sm:mt-12 sm:px-0 sm:text-left sm:text-xl sm:leading-tight lg:text-2xl ${TITLE_MIN_HEIGHT_MOBILE} ${COVER_COLLECTION_COMPACT_MOBILE_TITLE_MIN_HEIGHT_CLASS} ${titleSizeClass} ${COVER_COLLECTION_MOBILE_TITLE_ALIGN_CLASS} ${COVER_COLLECTION_MOBILE_TITLE_IMAGE_ALIGN_CLASS} ${COVER_COLLECTION_MOBILE_TITLE_OFFSET_CLASS} sm:min-h-0 ${COVER_COLLECTION_DESKTOP_TITLE_OFFSET_CLASS} ${titleClampClass}`}
          >
            {item.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
