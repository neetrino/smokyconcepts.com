import Link from 'next/link';

import { HOME_ASSET_PATHS } from './homePage.data';
import type { HomeCoverCollectionItem } from './homePage.types';

/** Mobile: less overlap above panel — image sits lower, closer to title, not clipped. */
const COVER_COLLECTION_MOBILE_PANEL_OVERLAP_CLASS = 'max-sm:pt-6';
const COVER_COLLECTION_MOBILE_IMAGE_OVERLAP_CLASS = 'max-sm:-translate-y-6 max-sm:top-2';
/**
 * Desktop: product hero transform (uniform scale avoids raster stretch).
 * Mobile: tuned for Figma Mob `4345:2059` image slot 156×220 (`max-sm:`).
 */
const COVER_COLLECTION_PRODUCT_IMAGE_TRANSFORM_CLASS =
  'origin-bottom max-sm:translate-y-6 max-sm:scale-[1.28] translate-y-4 scale-[1.48] sm:translate-y-[8.25rem] sm:scale-[1.44] sm:group-hover:translate-y-[7.75rem] sm:group-hover:scale-[1.54]';

const TITLE_MIN_HEIGHT_MOBILE = 'min-h-[2.75rem]';

/** Mobile image band vs card on `sm+` (narrower band in 2-col grid). */
const COVER_COLLECTION_IMAGE_SLOT_MAX_WIDTH_CLASS = 'max-w-[65%] sm:max-w-none';

const MOBILE_LINK_TOP_PADDING_CLASS = `${COVER_COLLECTION_MOBILE_PANEL_OVERLAP_CLASS} max-sm:shadow-none`;

/** Figma Mob — white card shell fills grid cell; `sm:contents` hoists children for desktop layout. */
const COVER_COLLECTION_MOBILE_CARD_WIDTH_CLASS = 'max-sm:w-full max-sm:min-w-0';
const MOBILE_CARD_SHELL_CLASS = [
  'max-sm:relative max-sm:flex max-sm:min-h-[15.625rem] max-sm:flex-col max-sm:justify-end max-sm:overflow-visible max-sm:rounded-[24px] max-sm:bg-white max-sm:pb-3 max-sm:pl-2 max-sm:pr-2 max-sm:shadow-[0_8px_28px_rgba(18,42,38,0.12)]',
  COVER_COLLECTION_MOBILE_CARD_WIDTH_CLASS,
  'sm:contents sm:mx-0 sm:w-full',
].join(' ');

/** Mobile: absolute image slot; desktop: existing flow layout. */
const COVER_COLLECTION_IMAGE_OUTER_CLASS = [
  'max-sm:absolute max-sm:left-1/2 max-sm:z-10 max-sm:flex max-sm:h-[13.75rem] max-sm:w-full max-sm:max-w-[88%] max-sm:-translate-x-1/2 max-sm:items-end max-sm:justify-center max-sm:overflow-visible',
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
 * **Mobile:** Figma Mob `4345:2059` — white `234px` min-height panel, `24px` radius, `156×220`
 * image slot overlapping `36px` above the panel, `20px` Montserrat ExtraBold centered title
 * (`#414141`). **Desktop:** single white card with hero image overlap.
 */
export function CoverCollectionProductCard({ item }: CoverCollectionProductCardProps) {
  const href = `/products?category=${item.slug}`;
  const isSpecialEdition = item.slug === 'special-edition';
  const titleClampClass = isSpecialEdition
    ? 'line-clamp-1 whitespace-nowrap'
    : 'line-clamp-2 break-words';

  return (
    <Link
      href={href}
      className={`group relative z-0 mt-4 flex h-full min-h-0 w-full min-w-0 flex-col overflow-visible pt-0 transition-shadow duration-200 hover:z-10 focus-visible:z-10 focus-within:z-10 max-sm:max-w-none ${MOBILE_LINK_TOP_PADDING_CLASS} sm:mt-8 sm:rounded-[2rem] sm:bg-white sm:px-6 sm:pb-8 sm:shadow-[0_6px_24px_rgba(18,42,38,0.05)] sm:hover:shadow-[0_12px_32px_rgba(18,42,38,0.12)]`}
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
                className="h-20 w-16 origin-bottom object-contain opacity-60 transition-transform duration-300 ease-out scale-[1.28] sm:h-24 sm:w-[4.5rem] sm:group-hover:-translate-y-2 sm:group-hover:scale-[1.3]"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
        <div className="relative z-0 flex flex-1 flex-col justify-end rounded-[1rem] shadow-[0_8px_28px_rgba(18,42,38,0.12)] transition-shadow duration-200 max-sm:min-h-0 max-sm:rounded-none max-sm:bg-transparent max-sm:px-0 max-sm:pb-0 max-sm:shadow-none max-sm:group-hover:shadow-none sm:min-h-0 sm:flex-none sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
          <h3
            className={`relative z-[1] w-full text-center font-montserrat text-[20px] font-extrabold leading-normal text-[#414141] max-sm:px-1 sm:mt-12 sm:text-left sm:text-2xl sm:leading-tight lg:text-3xl ${TITLE_MIN_HEIGHT_MOBILE} sm:min-h-0 sm:translate-y-3 ${titleClampClass}`}
          >
            {item.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
