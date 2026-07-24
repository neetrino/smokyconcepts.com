import Image from 'next/image';

import {
  getMasonryInnerShellClassName,
  UPCOMING_LINE_DEFAULT_INNER_SHELL,
  type UpcomingLineMasonryTile,
} from './upcomingLineCard.constants';
import {
  getUpcomingLineImageClassName,
  getUpcomingLineImageFrameClassName,
  getUpcomingLineImageSizes,
  getUpcomingLineRootClassName,
} from './upcomingLineCardImageLayout';

export type { UpcomingLineMasonryTile };

export interface UpcomingLineCardProps {
  title: string;
  imageSrc: string;
  emphasizeImage?: boolean;
  /** Pushes the product image lower inside/over the card (e.g. Notebooks in Figma). */
  imageNudgeDown?: boolean;
  /** Slightly larger Keys artwork, nudged right and down (Figma alignment). */
  imageKeysLayout?: boolean;
  /** Larger Phones artwork, nudged up (less top offset via translate). */
  imagePhonesLayout?: boolean;
  /** Smaller Knifes artwork vs default emphasized cards. */
  imageKnifesLayout?: boolean;
  /** Documents: more `top` + gentler float so the image clears the title. */
  imageDocumentsLayout?: boolean;
  /** Wallets (xl row, no masonry tile): match masonry-style hero image framing. */
  imageWalletsLayout?: boolean;
  /** Per-slot dimensions in the sub-xl masonry grid (white tile + shadow). */
  masonryTile?: UpcomingLineMasonryTile;
}

export function UpcomingLineCard({
  title,
  imageSrc,
  emphasizeImage = false,
  imageNudgeDown = false,
  imageKeysLayout = false,
  imagePhonesLayout = false,
  imageKnifesLayout = false,
  imageDocumentsLayout = false,
  imageWalletsLayout = false,
  masonryTile,
}: UpcomingLineCardProps) {
  const layoutFlags = {
    emphasizeImage,
    imageNudgeDown,
    imageKeysLayout,
    imagePhonesLayout,
    imageKnifesLayout,
    imageDocumentsLayout,
    imageWalletsLayout,
    masonryTile,
  };

  const imageFrameClassName = getUpcomingLineImageFrameClassName(layoutFlags);
  const imageSizes = getUpcomingLineImageSizes(layoutFlags);
  const imageClassName = getUpcomingLineImageClassName(layoutFlags);
  const innerShellClassName = masonryTile
    ? getMasonryInnerShellClassName(masonryTile)
    : UPCOMING_LINE_DEFAULT_INNER_SHELL;
  const rootClassName = getUpcomingLineRootClassName(masonryTile);

  return (
    <div className={rootClassName}>
      <div className={innerShellClassName}>
        <div className={imageFrameClassName}>
          <Image
            src={imageSrc}
            alt={title}
            fill
            className={imageClassName}
            sizes={imageSizes}
            loading="eager"
          />
        </div>
        <h3 className="translate-y-1 text-[1rem] font-extrabold leading-none text-[#36373a] sm:translate-y-2 sm:text-[1.45rem]">{title}</h3>
      </div>
    </div>
  );
}
