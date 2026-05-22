import type { UpcomingLineMasonryTile } from './upcomingLineCard.constants';

export interface UpcomingLineImageLayoutFlags {
  emphasizeImage: boolean;
  imageNudgeDown: boolean;
  imageKeysLayout: boolean;
  imagePhonesLayout: boolean;
  imageKnifesLayout: boolean;
  imageDocumentsLayout: boolean;
  imageWalletsLayout: boolean;
  masonryTile?: UpcomingLineMasonryTile;
}

export function getUpcomingLineImageFrameClassName(flags: UpcomingLineImageLayoutFlags): string {
  const {
    emphasizeImage,
    imageNudgeDown,
    imageKeysLayout,
    imagePhonesLayout,
    imageKnifesLayout,
    imageDocumentsLayout,
    imageWalletsLayout,
    masonryTile,
  } = flags;

  if (!emphasizeImage) {
    if (imageDocumentsLayout) {
      return masonryTile === 'documents'
        ? 'pointer-events-none absolute left-[76%] top-2.5 h-[7rem] w-[7rem] origin-bottom -translate-x-1/2 -translate-y-[28%] sm:top-3 sm:h-40 sm:w-40 sm:-translate-y-[24%]'
        : 'pointer-events-none absolute left-[76%] top-4 h-[7rem] w-[7rem] origin-bottom -translate-x-1/2 -translate-y-[20%] sm:top-5 sm:h-40 sm:w-40 sm:-translate-y-[18%] xl:left-1/2 xl:top-4 xl:h-48 xl:w-48 xl:-translate-y-[30%]';
    }
    return 'pointer-events-none absolute left-1/2 top-0 h-[5.5rem] w-[5.5rem] origin-bottom -translate-x-1/2 -translate-y-[36%] sm:h-32 sm:w-32 sm:-translate-y-[36%] xl:h-40 xl:w-40 xl:-translate-y-[40%]';
  }

  if (imageNudgeDown) {
    return masonryTile === 'notebooks'
      ? 'pointer-events-none absolute left-1/2 top-2 h-[9rem] w-[9rem] origin-bottom -translate-x-1/2 -translate-y-[28%] sm:top-4 sm:h-[12rem] sm:w-[12rem] sm:-translate-y-[25%]'
      : 'pointer-events-none absolute left-1/2 top-2 h-24 w-24 origin-bottom -translate-x-1/2 -translate-y-[28%] sm:top-4 sm:h-36 sm:w-36 sm:-translate-y-[24%] xl:top-5 xl:h-44 xl:w-44 xl:-translate-y-[28%]';
  }

  if (imageKeysLayout) {
    return masonryTile === 'keys'
      ? 'pointer-events-none absolute left-[60%] top-0 h-56 w-56 origin-bottom -translate-x-1/2 -translate-y-[36%] sm:left-[59%] sm:top-0 sm:h-[18rem] sm:w-[18rem] sm:-translate-y-[34%]'
      : 'pointer-events-none absolute left-[60%] top-0 h-36 w-36 origin-bottom -translate-x-1/2 -translate-y-[36%] sm:left-[59%] sm:top-0 sm:h-48 sm:w-48 sm:-translate-y-[34%] xl:left-[59%] xl:top-0 xl:h-[14rem] xl:w-[14rem] xl:-translate-y-[38%]';
  }

  if (imagePhonesLayout) {
    return masonryTile === 'phones'
      ? 'pointer-events-none absolute left-1/2 top-1 h-36 w-36 origin-bottom -translate-x-1/2 -translate-y-[32%] sm:top-2 sm:h-[11.5rem] sm:w-[11.5rem] sm:-translate-y-[28%]'
      : 'pointer-events-none absolute left-1/2 top-2 h-40 w-40 origin-bottom -translate-x-1/2 -translate-y-[32%] sm:top-3 sm:h-52 sm:w-52 sm:-translate-y-[28%] xl:top-4 xl:h-[15.5rem] xl:w-[15.5rem] xl:-translate-y-[32%]';
  }

  if (imageKnifesLayout) {
    return masonryTile === 'knifes'
      ? 'pointer-events-none absolute left-[68%] top-3 h-32 w-32 origin-bottom -translate-x-1/2 -translate-y-[19%] sm:left-[68%] sm:top-2 sm:h-36 sm:w-36 sm:-translate-y-[17%]'
      : 'pointer-events-none absolute left-[68%] top-4 h-32 w-32 origin-bottom -translate-x-1/2 -translate-y-[12%] sm:left-[68%] sm:top-4 sm:h-36 sm:w-36 sm:-translate-y-[12%] xl:left-[68%] xl:top-1 xl:h-36 xl:w-36 xl:-translate-y-[30%]';
  }

  if (masonryTile === 'wallets' || imageWalletsLayout) {
    return 'pointer-events-none absolute left-1/2 top-0 h-[10rem] w-[10rem] origin-bottom -translate-x-1/2 -translate-y-[44%] sm:top-0 sm:h-[12.5rem] sm:w-[12.5rem] sm:-translate-y-[40%] xl:top-0 xl:h-[13.5rem] xl:w-[13.5rem] xl:-translate-y-[46%]';
  }

  return 'pointer-events-none absolute left-1/2 top-0 h-24 w-24 origin-bottom -translate-x-1/2 -translate-y-[40%] sm:h-36 sm:w-36 sm:-translate-y-[38%] xl:h-44 xl:w-44 xl:-translate-y-[42%]';
}

export function getUpcomingLineImageSizes(flags: UpcomingLineImageLayoutFlags): string {
  const {
    imageNudgeDown,
    imageKeysLayout,
    imagePhonesLayout,
    imageKnifesLayout,
    imageDocumentsLayout,
    imageWalletsLayout,
    masonryTile,
  } = flags;

  if (imagePhonesLayout) {
    return masonryTile === 'phones'
      ? '(max-width: 640px) 132px, (max-width: 1280px) 184px, 240px'
      : '(max-width: 640px) 144px, (max-width: 1280px) 200px, 256px';
  }

  if (imageKeysLayout) {
    return masonryTile === 'keys'
      ? '(max-width: 640px) 304px, (max-width: 1280px) 352px, 480px'
      : '(max-width: 640px) 152px, (max-width: 1280px) 232px, 288px';
  }

  if (imageKnifesLayout) {
    return '(max-width: 640px) 132px, (max-width: 1280px) 176px, 176px';
  }

  if (masonryTile === 'documents') {
    return '(max-width: 640px) 136px, (max-width: 1280px) 176px, 208px';
  }

  if (imageNudgeDown && masonryTile === 'notebooks') {
    return '(max-width: 640px) 168px, (max-width: 1280px) 208px, 256px';
  }

  if (masonryTile === 'wallets' || imageWalletsLayout) {
    return '(max-width: 640px) 208px, (max-width: 1280px) 256px, 304px';
  }

  return '(max-width: 640px) 88px, (max-width: 1280px) 144px, 176px';
}

export function getUpcomingLineImageClassName(flags: UpcomingLineImageLayoutFlags): string {
  const { emphasizeImage, imageDocumentsLayout } = flags;

  if (emphasizeImage) {
    return 'object-contain object-center [filter:blur(1px)_brightness(1.02)_drop-shadow(0_10px_16px_rgba(18,42,38,0.16))] sm:[filter:blur(2px)_brightness(0.95)_drop-shadow(0_12px_22px_rgba(18,42,38,0.18))]';
  }

  if (imageDocumentsLayout) {
    return 'object-contain object-center origin-center rotate-[19deg] [filter:blur(1.5px)_brightness(1.03)_drop-shadow(0_8px_14px_rgba(18,42,38,0.12))] sm:[filter:blur(3px)_brightness(0.95)_drop-shadow(0_10px_20px_rgba(18,42,38,0.16))]';
  }

  return 'object-contain object-center [filter:blur(1.5px)_brightness(1.03)_drop-shadow(0_8px_14px_rgba(18,42,38,0.12))] sm:[filter:blur(3px)_brightness(0.95)_drop-shadow(0_10px_20px_rgba(18,42,38,0.16))]';
}

export function getUpcomingLineRootClassName(masonryTile?: UpcomingLineMasonryTile): string {
  if (!masonryTile) {
    return 'relative flex h-full flex-col overflow-visible pt-5 sm:pt-7';
  }

  if (masonryTile === 'knifes' || masonryTile === 'wallets' || masonryTile === 'documents') {
    return 'relative flex h-auto w-full flex-col overflow-visible pt-2 sm:pt-4';
  }

  return 'relative flex h-auto w-full flex-col overflow-visible pt-5 sm:pt-7';
}
