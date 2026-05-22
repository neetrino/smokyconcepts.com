import {
  CATALOG_PRODUCTS_PAGE_CARD_DETAILS_OFFSET_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_CARD_HERO_PULL_UP_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_CARD_MOBILE_DETAILS_LAYOUT_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_CARD_TOP_PADDING_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_MOBILE_HERO_MAX_SCALE,
} from './catalogProductCardMobilePresentation';
import { PRODUCT_SECTION_BADGE_CLASS_NAMES } from './catalogProductLabels';
import {
  CARD_SHADOW_TAILWIND,
  COMPACT_PRODUCT_IMAGE_ASPECT_TARGET,
  COMPACT_PRODUCT_IMAGE_BOX_CLASS_NAME,
  COMPACT_PRODUCT_IMAGE_UNIFORM_SCALE,
  MAX_ASPECT_COMPENSATION_SCALE,
  MAX_PRODUCT_IMAGE_SCALE,
  PRODUCTS_CATALOG_PAGE_DESIRED_IMAGE_SCALE,
  PRODUCTS_CATALOG_PAGE_IMAGE_BOX_CLASS_NAME,
  PRODUCTS_CATALOG_PAGE_SAFE_MAX_IMAGE_SCALE,
} from './productsCatalogCardImage.utils';
import type { ProductsCatalogCardProps } from './productsCatalogCard.types';

interface BuildCatalogCardPresentationParams extends ProductsCatalogCardProps {
  isSmUp: boolean;
  activeImageAspectRatio: number | null;
  activeImageOpaqueCompensation: number;
}

export interface CatalogCardPresentation {
  badgeClassName: string;
  articleClassName: string;
  imageWrapperClassName: string;
  imagePullUpClassName: string;
  imageInnerClassName: string;
  imageObjectClassName: string;
  imageContentFrameClassName: string;
  imageTransformStyle: string | null;
  titleClassName: string;
  badgeClassNames: string;
  priceClassName: string;
  buyButtonClassName: string;
  iconClassName: string;
  catalogBagIconClassName: string;
  detailsOffsetClassName: string;
  imageWrapperBottomMarginClassName: string;
  catalogDetailsLayoutClassName: string;
  catalogDetailsPaddingClassName: string;
  catalogPriceRowClassName: string;
  dotsRowLayoutClassName: string;
  dotsMarginClassName: string;
  sizeBadgeClassName: string;
}

export function buildCatalogCardPresentation({
  sectionLabel,
  sizeLabel,
  compactLayout = false,
  widerCompactCard = false,
  suppressShadow = false,
  tightenDetailsUnderImage = false,
  imageScaleBoost = 0,
  imageNudgeDown = false,
  catalogStripMobilePeek = false,
  slimCatalogGrid = false,
  productsCatalogPage = false,
  productsCatalogPageScaleMultiplier = 1,
  catalogHeroPullUpClassName,
  catalogCardTopPaddingClassName,
  catalogDetailsOffsetClassName,
  catalogImageBottomMarginClassName,
  isSmUp,
  activeImageAspectRatio,
  activeImageOpaqueCompensation,
}: BuildCatalogCardPresentationParams): CatalogCardPresentation {
  void imageScaleBoost;
  void imageNudgeDown;

  const badgeClassName =
    PRODUCT_SECTION_BADGE_CLASS_NAMES[sectionLabel] ?? PRODUCT_SECTION_BADGE_CLASS_NAMES.Classic;
  const isCompactSize = sizeLabel === 'Compact';

  const stripPeekMaxLg = slimCatalogGrid
    ? 'max-lg:max-w-[16.5rem]'
    : productsCatalogPage
      ? 'max-lg:max-w-[16.5rem]'
      : 'max-lg:max-w-[19rem]';
  const stripPeekLgW = slimCatalogGrid
    ? 'lg:w-[11.25rem]'
    : productsCatalogPage
      ? 'lg:w-[11rem]'
      : 'lg:w-[12.75rem]';
  const stripPeekXlW = slimCatalogGrid
    ? 'xl:w-[11.625rem]'
    : productsCatalogPage
      ? 'xl:w-[11.5rem]'
      : 'xl:w-[13rem]';
  const stripPeekMobileWidth = slimCatalogGrid
    ? 'max-lg:w-[calc((100vw-3.75rem)/1.65)]'
    : 'max-lg:w-[calc((100vw-3.75rem)/1.5)]';
  const compactArticleWidth =
    catalogStripMobilePeek && compactLayout
      ? `max-sm:w-full max-sm:max-w-full ${stripPeekMobileWidth} ${stripPeekMaxLg} ${stripPeekLgW} ${stripPeekXlW}`
      : widerCompactCard
        ? 'w-[12rem] max-sm:w-[10.75rem]'
        : 'w-[11rem] max-sm:w-[10.25rem]';
  const cardShadowClass = suppressShadow ? 'shadow-none' : CARD_SHADOW_TAILWIND;
  const articleStackClassName = 'z-0 hover:z-[8] focus-within:z-[8]';
  const compactArticlePaddingClassName = productsCatalogPage
    ? `px-0 pb-2.5 max-sm:pb-2 sm:pb-3 ${catalogCardTopPaddingClassName ?? CATALOG_PRODUCTS_PAGE_CARD_TOP_PADDING_CLASS_NAME}`
    : 'px-2.5 pb-2.5 pt-2 sm:px-3 sm:pb-3 sm:pt-2.5';
  const catalogDetailsLayoutClassName =
    compactLayout && productsCatalogPage
      ? `flex flex-1 flex-col justify-between ${CATALOG_PRODUCTS_PAGE_CARD_MOBILE_DETAILS_LAYOUT_CLASS_NAME}`
      : compactLayout
        ? 'flex flex-1 flex-col justify-between'
        : '';
  const catalogDetailsPaddingClassName = productsCatalogPage ? 'px-2.5 sm:px-3' : '';
  const articleClassName = compactLayout
    ? `relative ${compactArticleWidth} ${articleStackClassName} flex h-full min-h-0 shrink-0 flex-col overflow-visible rounded-[1.125rem] bg-white ${compactArticlePaddingClassName} ${cardShadowClass}`
    : `relative w-[14.25rem] max-sm:w-[12.5rem] ${articleStackClassName} shrink-0 overflow-visible rounded-[1.375rem] bg-white px-3 pb-3 pt-2.5 sm:px-3.5 sm:pb-3.5 sm:pt-3 ${cardShadowClass}`;

  const imageWrapperClassName = compactLayout
    ? widerCompactCard
      ? 'h-[15.25rem] sm:h-[18.5rem]'
      : productsCatalogPage
        ? 'h-[14.75rem] sm:h-[17.75rem] lg:h-[14.5rem]'
        : slimCatalogGrid
          ? 'h-[14.75rem] sm:h-[17.75rem] md:h-[13.5rem] lg:h-[16rem]'
          : 'h-[14.75rem] sm:h-[17.75rem]'
    : isCompactSize
      ? 'h-[12.5rem] sm:h-60'
      : 'h-[15rem] sm:h-72';

  const baseImagePullUpClassName = compactLayout
    ? slimCatalogGrid
      ? '-mt-[5.125rem] sm:-mt-[6.25rem] md:-mt-[4.75rem] lg:-mt-[5.75rem]'
      : '-mt-[5.125rem] sm:-mt-[6.25rem]'
    : isCompactSize
      ? '-mt-12 sm:-mt-16'
      : '-mt-[4.5rem] sm:-mt-24';
  const imagePullUpClassName =
    productsCatalogPage && compactLayout && !slimCatalogGrid
      ? catalogHeroPullUpClassName ?? CATALOG_PRODUCTS_PAGE_CARD_HERO_PULL_UP_CLASS_NAME
      : baseImagePullUpClassName;

  const compactInnerImageHeight = widerCompactCard
    ? 'h-[14.25rem] sm:h-[17.25rem]'
    : productsCatalogPage
      ? 'h-[13.75rem] sm:h-[16.5rem] lg:h-[13.75rem]'
      : slimCatalogGrid
        ? 'h-[13.75rem] sm:h-[16.5rem] md:h-[12.5rem] lg:h-[15rem]'
        : 'h-[13.75rem] sm:h-[16.5rem]';
  const imageInnerClassName = compactLayout ? `${compactInnerImageHeight} w-full` : 'h-full w-full';

  const aspectCompensationScale =
    activeImageAspectRatio && activeImageAspectRatio > 0 && activeImageAspectRatio < COMPACT_PRODUCT_IMAGE_ASPECT_TARGET
      ? Math.min(COMPACT_PRODUCT_IMAGE_ASPECT_TARGET / activeImageAspectRatio, MAX_ASPECT_COMPENSATION_SCALE)
      : 1;
  const tallImageMaxScale =
    activeImageAspectRatio && activeImageAspectRatio > COMPACT_PRODUCT_IMAGE_ASPECT_TARGET
      ? 1
      : MAX_PRODUCT_IMAGE_SCALE;
  const compactImageScaleRaw =
    COMPACT_PRODUCT_IMAGE_UNIFORM_SCALE * aspectCompensationScale * activeImageOpaqueCompensation;
  const productsCatalogPageScale = Math.min(
    PRODUCTS_CATALOG_PAGE_DESIRED_IMAGE_SCALE * productsCatalogPageScaleMultiplier,
    PRODUCTS_CATALOG_PAGE_SAFE_MAX_IMAGE_SCALE
  );
  const compactImageScale =
    productsCatalogPage && compactLayout
      ? productsCatalogPageScale
      : Math.min(
          productsCatalogPage && compactLayout && !isSmUp
            ? Math.min(compactImageScaleRaw, CATALOG_PRODUCTS_PAGE_MOBILE_HERO_MAX_SCALE)
            : compactImageScaleRaw,
          tallImageMaxScale
        );
  const imageClassName = compactLayout ? 'object-contain object-bottom' : 'object-contain';
  const imageObjectClassName =
    compactLayout && productsCatalogPage ? 'object-contain object-center' : imageClassName;
  const imageContentFrameClassName = compactLayout
    ? productsCatalogPage
      ? PRODUCTS_CATALOG_PAGE_IMAGE_BOX_CLASS_NAME
      : COMPACT_PRODUCT_IMAGE_BOX_CLASS_NAME
    : 'relative h-full w-full';

  const titleClassName = compactLayout
    ? 'text-[0.9375rem] sm:text-[1.0625rem]'
    : 'text-[1.0625rem] sm:text-[1.25rem]';
  const badgeClassNames = compactLayout
    ? `rounded-[0.3125rem] px-[0.3125rem] py-px text-[0.5625rem] font-medium leading-tight sm:rounded-[0.375rem] sm:px-[0.375rem] sm:py-[0.125rem] sm:text-[0.625rem] ${badgeClassName}`
    : `rounded-[0.375rem] px-[0.375rem] py-[0.125rem] text-[0.6875rem] font-medium leading-tight sm:px-[0.4375rem] sm:py-[0.1875rem] sm:text-[0.75rem] ${badgeClassName}`;
  const priceClassName = compactLayout
    ? 'text-[0.75rem] sm:text-[0.98rem]'
    : 'text-[0.875rem] sm:text-[1.05rem]';
  const buyButtonClassName = compactLayout
    ? 'inline-flex h-[1.375rem] min-w-[2.75rem] items-center justify-center rounded-[0.4375rem] border-2 border-[#dcc090] px-1.5 text-[0.6875rem] font-extrabold leading-tight text-[#dcc090] transition-colors hover:bg-[#dcc090]/10 sm:h-6 sm:min-w-[3.25rem] sm:rounded-[0.5rem] sm:px-2 sm:text-[0.75rem]'
    : 'inline-flex h-[1.375rem] min-w-[3.25rem] items-center justify-center rounded-[0.5rem] border-2 border-[#dcc090] px-2 text-[0.8125rem] font-extrabold leading-tight text-[#dcc090] transition-colors hover:bg-[#dcc090]/10 sm:h-[1.625rem] sm:min-w-[3.75rem] sm:px-3 sm:text-[0.875rem]';
  const iconClassName = compactLayout
    ? 'h-3.5 w-3.5 object-contain sm:h-4 sm:w-4'
    : 'h-4 w-4 object-contain sm:h-5 sm:w-5';
  const catalogBagIconClassName = compactLayout
    ? 'h-5 w-6 object-contain sm:h-6 sm:w-[28px]'
    : 'h-6 w-8 object-contain sm:h-7 sm:w-9';

  const detailsOffsetClassName = compactLayout
    ? tightenDetailsUnderImage
      ? slimCatalogGrid
        ? '-mt-[4.125rem] sm:-mt-[5rem] md:-mt-[3.75rem] lg:-mt-[4.5rem]'
        : '-mt-[4.125rem] sm:-mt-[5rem]'
      : productsCatalogPage
        ? slimCatalogGrid
          ? '-mt-[3.25rem] sm:-mt-[3.75rem] md:-mt-[3rem] lg:-mt-[3.5rem]'
          : catalogDetailsOffsetClassName ?? CATALOG_PRODUCTS_PAGE_CARD_DETAILS_OFFSET_CLASS_NAME
        : slimCatalogGrid
          ? '-mt-[2.75rem] sm:-mt-[3.25rem] md:-mt-[2.5rem] lg:-mt-[3rem]'
          : '-mt-[2.75rem] sm:-mt-[3.25rem]'
    : '-mt-4';
  const imageWrapperBottomMarginClassName =
    compactLayout && productsCatalogPage
      ? catalogImageBottomMarginClassName ?? 'mb-1 max-sm:mb-1.5 sm:mb-1'
      : 'mb-2';
  const productsCatalogImageNudgeY = 0;
  const imageTransformStyle = compactLayout
    ? `translateY(${productsCatalogImageNudgeY}px) scale(${compactImageScale})`
    : productsCatalogImageNudgeY !== 0
      ? `translateY(${productsCatalogImageNudgeY}px)`
      : null;
  const catalogPriceRowClassName =
    compactLayout && productsCatalogPage
      ? 'mt-2 max-sm:mt-1 flex items-center justify-between gap-2'
      : compactLayout
        ? 'mt-2 flex items-center justify-between gap-2'
        : 'mt-5 flex items-center justify-between gap-3';
  const dotsGapClassName = compactLayout ? 'gap-1' : 'gap-[0.3125rem]';
  const dotsMarginClassName = compactLayout ? (productsCatalogPage ? 'mb-0.5' : 'mb-1') : 'mb-3';
  const dotsRowLayoutClassName = `flex min-h-3 items-center ${dotsGapClassName} ${dotsMarginClassName}`;
  const sizeBadgeClassName = compactLayout
    ? 'inline-flex items-center px-0 py-0 text-[0.5625rem] font-semibold leading-tight text-[#122a26] sm:text-[0.625rem]'
    : 'inline-flex items-center px-0 py-0 text-[0.6875rem] font-semibold leading-tight text-[#122a26] sm:text-[0.75rem]';

  return {
    badgeClassName,
    articleClassName,
    imageWrapperClassName,
    imagePullUpClassName,
    imageInnerClassName,
    imageObjectClassName,
    imageContentFrameClassName,
    imageTransformStyle,
    titleClassName,
    badgeClassNames,
    priceClassName,
    buyButtonClassName,
    iconClassName,
    catalogBagIconClassName,
    detailsOffsetClassName,
    imageWrapperBottomMarginClassName,
    catalogDetailsLayoutClassName,
    catalogDetailsPaddingClassName,
    catalogPriceRowClassName,
    dotsRowLayoutClassName,
    dotsMarginClassName,
    sizeBadgeClassName,
  };
}
