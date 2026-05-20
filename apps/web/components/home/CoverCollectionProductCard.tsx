import Link from 'next/link';

import { HOME_ASSET_PATHS } from './homePage.data';
import type { HomeCoverCollectionItem } from './homePage.types';

/** Mobile: overlap above panel; image slot nudged up for visual balance. */
const COVER_COLLECTION_MOBILE_PANEL_OVERLAP_CLASS = 'max-sm:pt-[clamp(1.25rem,6vw,2rem)]';
const COVER_COLLECTION_MOBILE_LINK_MARGIN_TOP_CLASS = 'max-sm:mt-1';
/** More negative Y = image sits higher over the white panel. */
const COVER_COLLECTION_MOBILE_IMAGE_OVERLAP_CLASS =
  'max-sm:-top-2 max-sm:-translate-y-12 max-[360px]:-top-1 max-[360px]:-translate-y-10';
/** Mobile: nudge category title down inside the white panel. */
const COVER_COLLECTION_MOBILE_TITLE_OFFSET_CLASS = 'max-sm:translate-y-4';
/** Desktop: card height follows content so the grid row does not add empty space below the title. */
const COVER_COLLECTION_DESKTOP_CARD_HEIGHT_CLASS = 'sm:h-auto';
/** Desktop: white card padding below category title. */
const COVER_COLLECTION_DESKTOP_CARD_PADDING_BOTTOM_CLASS = 'sm:pb-4';
/** Desktop: slight title nudge; keep minimal to avoid empty band under label. */
const COVER_COLLECTION_DESKTOP_TITLE_OFFSET_CLASS = 'sm:translate-y-1';
/** Mobile: title aligns to block start (not centered). */
const COVER_COLLECTION_MOBILE_TITLE_ALIGN_CLASS = 'max-sm:text-left max-sm:text-start';
/** Mobile: inset follows the fluid centered image band. */
const COVER_COLLECTION_MOBILE_TITLE_IMAGE_ALIGN_CLASS =
  'max-sm:pl-[clamp(0.75rem,11vw,1.85rem)] max-sm:pr-2 max-[360px]:pl-3 max-[360px]:pr-1.5';
/** White card panel height on mobile. */
const COVER_COLLECTION_MOBILE_CARD_MIN_HEIGHT_CLASS =
  'max-sm:min-h-[clamp(9.25rem,46vw,11.5rem)] max-[360px]:min-h-[8.875rem]';
/** Compact tile overrides at ≤360px; ~390px+ keeps standard mobile sizing. */
/**
 * Desktop: product hero transform (uniform scale avoids raster stretch).
 * Mobile: image slot slightly above Figma Mob `4345:2059` baseline (`max-sm:`).
 */
const COVER_COLLECTION_PRODUCT_IMAGE_TRANSFORM_CLASS =
  'origin-bottom max-sm:translate-y-0 max-sm:scale-[1.35] translate-y-4 scale-[1.48] sm:translate-y-[8.25rem] sm:scale-[1.44] sm:group-hover:translate-y-[7.75rem] sm:group-hover:scale-[1.54] max-[360px]:scale-[1.2] min-[390px]:max-sm:scale-[1.43]';

const TITLE_MIN_HEIGHT_MOBILE = 'min-h-[3rem]';
const COVER_COLLECTION_COMPACT_MOBILE_TITLE_MIN_HEIGHT_CLASS = 'max-[360px]:min-h-[2.5rem]';
const COVER_COLLECTION_MOBILE_TITLE_SIZE_CLASS =
  'max-sm:text-[clamp(1.125rem,5.5vw,1.375rem)] max-[360px]:text-[1.0625rem]';
/** Long label; smaller type so it fits the narrow tile. */
const COVER_COLLECTION_MOBILE_SPECIAL_EDITION_TITLE_SIZE_CLASS =
  'max-sm:text-[clamp(0.875rem,4.4vw,1.125rem)] max-[360px]:text-[0.8125rem] max-[360px]:tracking-tight';

/** Mobile image band width in 2-col grid. */
const COVER_COLLECTION_IMAGE_SLOT_MAX_WIDTH_CLASS =
  'max-sm:max-w-[clamp(5.5rem,72%,8.75rem)] sm:max-w-none';

const MOBILE_LINK_TOP_PADDING_CLASS = `${COVER_COLLECTION_MOBILE_PANEL_OVERLAP_CLASS} max-sm:shadow-none`;

/** Figma Mob — white card shell fills grid cell; `sm:contents` hoists children for desktop layout. */
const COVER_COLLECTION_MOBILE_CARD_WIDTH_CLASS = 'max-sm:w-full max-sm:min-w-0';
const MOBILE_CARD_SHELL_CLASS = [
  `max-sm:relative max-sm:flex ${COVER_COLLECTION_MOBILE_CARD_MIN_HEIGHT_CLASS} max-sm:w-full max-sm:min-w-0 max-sm:flex-col max-sm:justify-end max-sm:overflow-visible max-sm:rounded-[clamp(1.125rem,6vw,1.5rem)] max-sm:bg-white max-sm:pb-[clamp(0.375rem,1.8vw,0.5rem)] max-sm:pl-0 max-sm:pr-[clamp(0.375rem,2vw,0.5rem)] max-sm:shadow-[0_8px_28px_rgba(18,42,38,0.12)]`,
  COVER_COLLECTION_MOBILE_CARD_WIDTH_CLASS,
  'sm:contents sm:mx-0 sm:w-full sm:translate-x-0',
].join(' ');

/** Mobile: absolute image slot; desktop: existing flow layout. */
const COVER_COLLECTION_IMAGE_OUTER_CLASS = [
  'max-sm:absolute max-sm:left-1/2 max-sm:z-10 max-sm:flex max-sm:h-[clamp(11.5rem,61vw,15.75rem)] max-sm:w-full max-sm:-translate-x-1/2 max-sm:items-end max-sm:justify-center max-sm:overflow-visible max-[360px]:h-[11.25rem]',
  COVER_COLLECTION_MOBILE_IMAGE_OVERLAP_CLASS,
  'relative z-10 mx-auto flex h-52 w-full shrink-0 items-end justify-center sm:z-auto sm:-mt-28 sm:mb-0 sm:h-[22rem] sm:max-w-none sm:translate-y-0',
  COVER_COLLECTION_IMAGE_SLOT_MAX_WIDTH_CLASS,
].join(' ');

interface CoverCollectionProductCardProps {
  item: HomeCoverCollectionItem;
}

/**
 * Home “Cover collections” tile.
 *
 * **Mobile:** white panel, `24px` radius, enlarged hero slot overlapping the panel,
 * `22px` Montserrat ExtraBold title aligned with hero image left edge
 * (`#414141`). **Desktop:** single white card with hero image overlap.
 */
export function CoverCollectionProductCard({ item }: CoverCollectionProductCardProps) {
  const href = '/products';
  const isSpecialEdition = item.slug === 'special-edition';
  const titleClampClass = isSpecialEdition
    ? 'line-clamp-1 truncate whitespace-nowrap max-[389px]:leading-snug'
    : 'line-clamp-2 break-words';
  const titleSizeClass = isSpecialEdition
    ? COVER_COLLECTION_MOBILE_SPECIAL_EDITION_TITLE_SIZE_CLASS
    : COVER_COLLECTION_MOBILE_TITLE_SIZE_CLASS;

  return (
    <Link
      href={href}
      className={`group relative z-0 mt-4 flex h-full min-h-0 w-full min-w-0 flex-col overflow-visible pt-0 transition-shadow duration-200 hover:z-10 focus-visible:z-10 focus-within:z-10 max-sm:max-w-none ${COVER_COLLECTION_MOBILE_LINK_MARGIN_TOP_CLASS} ${MOBILE_LINK_TOP_PADDING_CLASS} ${COVER_COLLECTION_DESKTOP_CARD_HEIGHT_CLASS} sm:mt-8 sm:rounded-[2rem] sm:bg-white sm:px-6 ${COVER_COLLECTION_DESKTOP_CARD_PADDING_BOTTOM_CLASS} sm:shadow-[0_6px_24px_rgba(18,42,38,0.05)] sm:hover:shadow-[0_12px_32px_rgba(18,42,38,0.12)]`}
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
                className="h-20 w-16 origin-bottom object-contain opacity-60 transition-transform duration-300 ease-out max-sm:scale-[1.35] sm:h-24 sm:w-[4.5rem] sm:scale-[1.28] sm:group-hover:-translate-y-2 sm:group-hover:scale-[1.3]"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
        <div className="relative z-0 flex flex-1 flex-col justify-end rounded-[1rem] shadow-[0_8px_28px_rgba(18,42,38,0.12)] transition-shadow duration-200 max-sm:min-h-0 max-sm:rounded-none max-sm:bg-transparent max-sm:px-0 max-sm:pb-0 max-sm:shadow-none max-sm:group-hover:shadow-none sm:min-h-0 sm:flex-none sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
          <h3
            className={`relative z-[1] w-full min-w-0 font-montserrat font-extrabold leading-normal text-[#414141] sm:mt-12 sm:px-0 sm:text-left sm:text-2xl sm:leading-tight lg:text-3xl ${TITLE_MIN_HEIGHT_MOBILE} ${COVER_COLLECTION_COMPACT_MOBILE_TITLE_MIN_HEIGHT_CLASS} ${titleSizeClass} ${COVER_COLLECTION_MOBILE_TITLE_ALIGN_CLASS} ${COVER_COLLECTION_MOBILE_TITLE_IMAGE_ALIGN_CLASS} ${COVER_COLLECTION_MOBILE_TITLE_OFFSET_CLASS} sm:min-h-0 ${COVER_COLLECTION_DESKTOP_TITLE_OFFSET_CLASS} ${titleClampClass}`}
          >
            {item.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
