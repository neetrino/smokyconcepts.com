'use client';

import Image from 'next/image';
import Link from 'next/link';

import { HomeActionButton } from './HomeActionButton';
import { CoverCollectionProductCard } from './CoverCollectionProductCard';
import { CultureVotingSection } from './CultureVotingSection';
import { HomeHeroSection } from './HomeHeroSection';
import { HomeSectionTitle } from './HomeSectionTitle';
import {
  HOME_ASSET_PATHS,
  PACK_FIT_ITEMS,
  RITUAL_STEPS,
  UPCOMING_LINES,
} from './homePage.data';
import { TrendingFeaturedSection } from './TrendingFeaturedSection';
import { UpcomingProductsSection } from '@/components/home/UpcomingProductsSection';
import type { HomeCoverCollectionItem } from './homePage.types';
import type { HomeHeroSlide } from '@/lib/types/home-hero.types';
import { getProductsPathWithSelectSizeAutopen } from '@/lib/constants/products-catalog.constants';
import { useTranslation } from '@/lib/i18n-client';

/**
 * Sub-xl masonry (2×3 cards): vertical `gap-y` between rows; keep tight so tiles read as one strip.
 */
const UPCOMING_LINES_MASONRY_STACK_CLASS = 'flex w-full flex-col gap-y-1 sm:gap-y-2 xl:hidden';
const UPCOMING_LINES_MASONRY_ROW_CLASS = 'flex min-w-0 gap-x-2.5 sm:gap-x-3.5';
/** Row 3 — `items-end` so Documents + Wallets white tiles share one bottom edge (sub-xl). */
const UPCOMING_LINES_MASONRY_ROW3_CLASS = `${UPCOMING_LINES_MASONRY_ROW_CLASS} items-end`;
/** Row 1 — Phones (1) wider/taller; Notebooks nudged up (Figma). */
const MASONRY_ROW1_LEFT = 'min-w-0 flex-[0.92] sm:flex-[0.93]';
const MASONRY_ROW1_RIGHT = 'min-w-0 flex-[1.08] sm:flex-[1.07] -translate-y-1 sm:-translate-y-1.5';
/** Row 2 — card 3 narrow/tall, card 4 wider. */
const MASONRY_ROW2_LEFT = 'min-w-0 flex-[0.7] sm:flex-[0.74]';
const MASONRY_ROW2_RIGHT = 'min-w-0 flex-[1.3] sm:flex-[1.26]';
/** Row 3 — Documents narrower, Wallets wider (sub-xl masonry). */
const MASONRY_ROW3_LEFT = 'min-w-0 flex-[1.48] sm:flex-[1.44]';
const MASONRY_ROW3_RIGHT = 'min-w-0 flex-[1.02] sm:flex-[1.06]';
/** Figma Mob — 2×2 grid; horizontal gap between cards in the same row. */
const COVER_COLLECTIONS_MOBILE_GRID_GAP_X_CLASS = 'max-sm:gap-x-6';
const COVER_COLLECTIONS_MOBILE_GRID_GAP_Y_CLASS = 'max-sm:gap-y-10';
/** Mobile: pull card grid closer to section title. */
const COVER_COLLECTIONS_MOBILE_SECTION_GAP_CLASS = 'max-sm:gap-5';
const COVER_COLLECTIONS_MOBILE_GRID_MARGIN_TOP_CLASS = 'max-sm:mt-0';

function PackFitCard({
  title,
  subtitle,
  heightClassName,
  widthClassName,
  useCompactImage,
}: (typeof PACK_FIT_ITEMS)[number]) {
  return (
    <div className="flex shrink-0 snap-center scale-[0.88] flex-col items-center gap-2 sm:scale-100 sm:gap-3">
      <div className={`relative flex items-end justify-center ${heightClassName} ${widthClassName}`}>
        {useCompactImage ? (
          <>
            <Image
              src={HOME_ASSET_PATHS.compactPack}
              alt={title}
              fill
              className="object-contain"
              sizes="144px"
            />
            <img
              src={HOME_ASSET_PATHS.packMark}
              alt=""
              className="absolute left-1/2 top-[62%] h-8 w-7 -translate-x-1/2 -translate-y-1/2 object-contain opacity-90"
              aria-hidden="true"
            />
          </>
        ) : (
          <div className={`relative overflow-hidden rounded-b-[0.25rem] rounded-t-[0.25rem] bg-[#731818] ${heightClassName} ${widthClassName}`}>
            <div className="h-[28%] rounded-t-[0.25rem] border-b-2 border-white/80 bg-[#731818]" />
            <img
              src={HOME_ASSET_PATHS.packMark}
              alt=""
              className="absolute left-1/2 top-[58%] h-8 w-7 -translate-x-1/2 -translate-y-1/2 object-contain opacity-90"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      <div className="flex min-h-[2.75rem] flex-col justify-end text-center">
        <h3 className="text-xs font-black leading-none text-[#414141]">{title}</h3>
        {subtitle ? <p className="mt-1 text-[0.5rem] font-semibold text-black">{subtitle}</p> : null}
      </div>
    </div>
  );
}

export type UpcomingLineMasonryTile =
  | 'phones'
  | 'notebooks'
  | 'knifes'
  | 'keys'
  | 'documents'
  | 'wallets';

interface UpcomingLineCardProps {
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

/** Elevation for masonry tiles; matches catalog card token. */
const UPCOMING_LINE_MASONRY_SHADOW = 'shadow-[0_4px_22.5px_rgba(0,0,0,0.08)]';

/** No `flex-1` — avoids stretching sibling tiles when one row card has a larger `min-h`. */
const MASONRY_INNER_BASE =
  'relative flex flex-col justify-end rounded-[1.1rem] bg-white px-2.5 pb-2 sm:rounded-[1.75rem] sm:px-5 xl:min-h-0';

const MASONRY_INNER_BY_TILE: Record<UpcomingLineMasonryTile, string> = {
  phones: `${MASONRY_INNER_BASE} min-h-[8.25rem] pt-9 ${UPCOMING_LINE_MASONRY_SHADOW} sm:min-h-[11.25rem] sm:pb-4 sm:pt-12`,
  notebooks: `${MASONRY_INNER_BASE} min-h-[9.5rem] pt-10 ${UPCOMING_LINE_MASONRY_SHADOW} sm:min-h-[12.25rem] sm:pb-5 sm:pt-[3.35rem]`,
  knifes: `${MASONRY_INNER_BASE} min-h-[11.25rem] pt-3 ${UPCOMING_LINE_MASONRY_SHADOW} sm:min-h-[14.75rem] sm:pb-5 sm:pt-6`,
  keys: `${MASONRY_INNER_BASE} min-h-[9.25rem] pt-7 ${UPCOMING_LINE_MASONRY_SHADOW} sm:min-h-[13rem] sm:pb-4 sm:pt-10`,
  documents: `${MASONRY_INNER_BASE} min-h-[6.25rem] pt-3 ${UPCOMING_LINE_MASONRY_SHADOW} sm:min-h-[9rem] sm:pb-4 sm:pt-6`,
  wallets: `${MASONRY_INNER_BASE} min-h-[8rem] pt-4 ${UPCOMING_LINE_MASONRY_SHADOW} sm:min-h-[11.25rem] sm:pb-4 sm:pt-6`,
};

function getMasonryInnerShellClassName(tile: UpcomingLineMasonryTile): string {
  return MASONRY_INNER_BY_TILE[tile];
}

function UpcomingLineCard({
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
  const imageFrameClassName = !emphasizeImage
    ? imageDocumentsLayout
      ? masonryTile === 'documents'
        ? 'pointer-events-none absolute left-[76%] top-2.5 h-[7rem] w-[7rem] origin-bottom -translate-x-1/2 -translate-y-[28%] sm:top-3 sm:h-40 sm:w-40 sm:-translate-y-[24%]'
        : 'pointer-events-none absolute left-[76%] top-4 h-[7rem] w-[7rem] origin-bottom -translate-x-1/2 -translate-y-[20%] sm:top-5 sm:h-40 sm:w-40 sm:-translate-y-[18%] xl:left-1/2 xl:top-4 xl:h-48 xl:w-48 xl:-translate-y-[30%]'
      : 'pointer-events-none absolute left-1/2 top-0 h-[5.5rem] w-[5.5rem] origin-bottom -translate-x-1/2 -translate-y-[36%] sm:h-32 sm:w-32 sm:-translate-y-[36%] xl:h-40 xl:w-40 xl:-translate-y-[40%]'
    : imageNudgeDown
      ? masonryTile === 'notebooks'
        ? 'pointer-events-none absolute left-1/2 top-2 h-[9rem] w-[9rem] origin-bottom -translate-x-1/2 -translate-y-[28%] sm:top-4 sm:h-[12rem] sm:w-[12rem] sm:-translate-y-[25%]'
        : 'pointer-events-none absolute left-1/2 top-2 h-24 w-24 origin-bottom -translate-x-1/2 -translate-y-[28%] sm:top-4 sm:h-36 sm:w-36 sm:-translate-y-[24%] xl:top-5 xl:h-44 xl:w-44 xl:-translate-y-[28%]'
      : imageKeysLayout
        ? masonryTile === 'keys'
          ? 'pointer-events-none absolute left-[60%] top-0 h-56 w-56 origin-bottom -translate-x-1/2 -translate-y-[36%] sm:left-[59%] sm:top-0 sm:h-[18rem] sm:w-[18rem] sm:-translate-y-[34%]'
          : 'pointer-events-none absolute left-[60%] top-0 h-36 w-36 origin-bottom -translate-x-1/2 -translate-y-[36%] sm:left-[59%] sm:top-0 sm:h-48 sm:w-48 sm:-translate-y-[34%] xl:left-[59%] xl:top-0 xl:h-[14rem] xl:w-[14rem] xl:-translate-y-[38%]'
        : imagePhonesLayout
          ? masonryTile === 'phones'
            ? 'pointer-events-none absolute left-1/2 top-1 h-36 w-36 origin-bottom -translate-x-1/2 -translate-y-[32%] sm:top-2 sm:h-[11.5rem] sm:w-[11.5rem] sm:-translate-y-[28%]'
            : 'pointer-events-none absolute left-1/2 top-2 h-40 w-40 origin-bottom -translate-x-1/2 -translate-y-[32%] sm:top-3 sm:h-52 sm:w-52 sm:-translate-y-[28%] xl:top-4 xl:h-[15.5rem] xl:w-[15.5rem] xl:-translate-y-[32%]'
          : imageKnifesLayout
            ? masonryTile === 'knifes'
              ? 'pointer-events-none absolute left-[68%] top-3 h-32 w-32 origin-bottom -translate-x-1/2 -translate-y-[19%] sm:left-[68%] sm:top-2 sm:h-36 sm:w-36 sm:-translate-y-[17%]'
              : 'pointer-events-none absolute left-[68%] top-4 h-32 w-32 origin-bottom -translate-x-1/2 -translate-y-[12%] sm:left-[68%] sm:top-4 sm:h-36 sm:w-36 sm:-translate-y-[12%] xl:left-[68%] xl:top-1 xl:h-36 xl:w-36 xl:-translate-y-[30%]'
            : masonryTile === 'wallets' || imageWalletsLayout
              ? 'pointer-events-none absolute left-1/2 top-0 h-[10rem] w-[10rem] origin-bottom -translate-x-1/2 -translate-y-[44%] sm:top-0 sm:h-[12.5rem] sm:w-[12.5rem] sm:-translate-y-[40%] xl:top-0 xl:h-[13.5rem] xl:w-[13.5rem] xl:-translate-y-[46%]'
              : 'pointer-events-none absolute left-1/2 top-0 h-24 w-24 origin-bottom -translate-x-1/2 -translate-y-[40%] sm:h-36 sm:w-36 sm:-translate-y-[38%] xl:h-44 xl:w-44 xl:-translate-y-[42%]';
  const imageSizes = imagePhonesLayout
    ? masonryTile === 'phones'
      ? '(max-width: 640px) 132px, (max-width: 1280px) 184px, 240px'
      : '(max-width: 640px) 144px, (max-width: 1280px) 200px, 256px'
    : imageKeysLayout
      ? masonryTile === 'keys'
        ? '(max-width: 640px) 304px, (max-width: 1280px) 352px, 480px'
        : '(max-width: 640px) 152px, (max-width: 1280px) 232px, 288px'
      : imageKnifesLayout
        ? '(max-width: 640px) 132px, (max-width: 1280px) 176px, 176px'
        : masonryTile === 'documents'
          ? '(max-width: 640px) 136px, (max-width: 1280px) 176px, 208px'
          : imageNudgeDown && masonryTile === 'notebooks'
            ? '(max-width: 640px) 168px, (max-width: 1280px) 208px, 256px'
            : masonryTile === 'wallets' || imageWalletsLayout
              ? '(max-width: 640px) 208px, (max-width: 1280px) 256px, 304px'
              : '(max-width: 640px) 88px, (max-width: 1280px) 144px, 176px';
  const imageClassName = emphasizeImage
    ? 'object-contain object-center [filter:blur(1px)_brightness(1.02)_drop-shadow(0_10px_16px_rgba(18,42,38,0.16))] sm:[filter:blur(2px)_brightness(0.95)_drop-shadow(0_12px_22px_rgba(18,42,38,0.18))]'
    : imageDocumentsLayout
      ? 'object-contain object-center origin-center rotate-[19deg] [filter:blur(1.5px)_brightness(1.03)_drop-shadow(0_8px_14px_rgba(18,42,38,0.12))] sm:[filter:blur(3px)_brightness(0.95)_drop-shadow(0_10px_20px_rgba(18,42,38,0.16))]'
      : 'object-contain object-center [filter:blur(1.5px)_brightness(1.03)_drop-shadow(0_8px_14px_rgba(18,42,38,0.12))] sm:[filter:blur(3px)_brightness(0.95)_drop-shadow(0_10px_20px_rgba(18,42,38,0.16))]';

  const innerShellClassName = masonryTile
    ? getMasonryInnerShellClassName(masonryTile)
    : 'relative flex min-h-[7rem] flex-1 flex-col justify-end rounded-[1.1rem] bg-[#f3f3f3] px-2.5 pb-2 pt-9 sm:min-h-[10.5rem] sm:rounded-[1.75rem] sm:bg-white sm:px-5 sm:pb-5 sm:pt-12 xl:min-h-0';

  const rootClassName = masonryTile
    ? masonryTile === 'knifes'
      ? 'relative flex h-auto w-full flex-col overflow-visible pt-2 sm:pt-4'
      : masonryTile === 'wallets' || masonryTile === 'documents'
        ? 'relative flex h-auto w-full flex-col overflow-visible pt-2 sm:pt-4'
        : 'relative flex h-auto w-full flex-col overflow-visible pt-5 sm:pt-7'
    : 'relative flex h-full flex-col overflow-visible pt-5 sm:pt-7';

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

/**
 * Full static homepage assembled from Figma-derived assets.
 */
interface HomePageContentProps {
  coverCollections: HomeCoverCollectionItem[];
  heroSlides: HomeHeroSlide[];
}

export function HomePageContent({ coverCollections, heroSlides }: HomePageContentProps) {
  const { t } = useTranslation();
  const packFitKeyByIndex = ['ultraSlims', 'compact', 'superSlims', 'slims', 'kingSize', 'sticks'] as const;
  const ritualStepKeys = ['apply', 'consultation', 'designAndMaterials', 'packagingAndDelivery'] as const;
  const upcomingLineKeyByTitle: Record<string, string> = {
    Notebooks: 'notebooks',
    Knifes: 'knifes',
    Phones: 'phones',
    Wallets: 'wallets',
    Documents: 'documents',
    Keys: 'keys',
  };
  const upcomingLineByTitle: Record<string, (typeof UPCOMING_LINES)[number]> = Object.fromEntries(
    UPCOMING_LINES.map((it) => [it.title, it]),
  );
  const renderUpcomingLineCard = (lineTitle: string, options?: { masonryTile?: UpcomingLineMasonryTile }) => {
    const item = upcomingLineByTitle[lineTitle];
    if (!item) return null;
    return (
      <UpcomingLineCard
        {...item}
        emphasizeImage={
          item.title === 'Notebooks' ||
          item.title === 'Knifes' ||
          item.title === 'Phones' ||
          item.title === 'Keys' ||
          item.title === 'Wallets'
        }
        imageNudgeDown={item.title === 'Notebooks'}
        imageKeysLayout={item.title === 'Keys'}
        imagePhonesLayout={item.title === 'Phones'}
        imageKnifesLayout={item.title === 'Knifes'}
        imageDocumentsLayout={item.title === 'Documents'}
        imageWalletsLayout={item.title === 'Wallets'}
        title={t(`home.homepage.upcomingLines.cards.${upcomingLineKeyByTitle[item.title] ?? 'documents'}`)}
        masonryTile={options?.masonryTile}
      />
    );
  };

  return (
    <div className="overflow-x-hidden overflow-y-hidden bg-[#efefef] text-[#414141]">
      <div className="mx-auto flex max-w-[120rem] flex-col gap-[140px] overflow-x-hidden overflow-y-hidden px-5 pb-20 pt-8 sm:px-8 sm:pb-24 sm:pt-10 lg:px-[7.5rem]">
        <section className="flex flex-col gap-4 sm:gap-5">
          <HomeSectionTitle
            title={t('home.homepage.hero.title')}
            titleMobile={t('home.homepage.hero.titleMobile')}
            descriptionEmphasis={{
              lead: t('home.homepage.hero.tagline.lead'),
              bold1: t('home.homepage.hero.tagline.bold1'),
              mid: t('home.homepage.hero.tagline.mid'),
              bold2: t('home.homepage.hero.tagline.bold2'),
              tail: t('home.homepage.hero.tagline.tail'),
            }}
          />
          <HomeHeroSection slides={heroSlides} />
        </section>

        <section className="-mt-10 flex flex-col gap-8 pb-8 sm:mt-1 sm:gap-10 sm:pb-10">
          <HomeSectionTitle
            title={t('home.homepage.packFit.title')}
            description={t('home.homepage.packFit.description')}
          />
          <div className="sm:hidden">
            <div className="-mx-5 overflow-x-auto px-5 pb-2 scrollbar-hide">
              <div className="flex min-w-max snap-x snap-mandatory items-end gap-x-0.5">
                {PACK_FIT_ITEMS.map((item, index) => (
                  <PackFitCard
                    key={item.title}
                    {...item}
                    title={t(`home.homepage.packFit.items.${packFitKeyByIndex[index]}.title`)}
                    subtitle={t(`home.homepage.packFit.items.${packFitKeyByIndex[index]}.subtitle`)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="hidden flex-wrap items-end justify-center gap-x-6 gap-y-6 sm:flex">
            {PACK_FIT_ITEMS.map((item, index) => (
              <PackFitCard
                key={item.title}
                {...item}
                title={t(`home.homepage.packFit.items.${packFitKeyByIndex[index]}.title`)}
                subtitle={t(`home.homepage.packFit.items.${packFitKeyByIndex[index]}.subtitle`)}
              />
            ))}
          </div>
          <div className="flex justify-center pt-1 sm:pt-2">
            <HomeActionButton
              href={getProductsPathWithSelectSizeAutopen()}
              label={t('home.homepage.packFit.cta')}
              className="min-w-[19rem] text-[1.2rem] font-black text-[#0f201d] sm:text-base"
            />
          </div>
        </section>

        {coverCollections.length > 0 ? (
          <section
            className={`flex flex-col gap-8 overflow-visible pt-3 sm:gap-10 sm:pt-6 ${COVER_COLLECTIONS_MOBILE_SECTION_GAP_CLASS}`}
          >
            <HomeSectionTitle
              title={t('home.homepage.coverCollections.title')}
              className="-translate-y-10 sm:-translate-y-4 lg:-translate-y-6"
            />
            <div
              className={`mt-4 grid w-full min-w-0 grid-cols-2 items-start justify-items-stretch gap-x-2 gap-y-16 overflow-visible sm:mt-0 sm:grid-cols-4 sm:gap-8 ${COVER_COLLECTIONS_MOBILE_GRID_MARGIN_TOP_CLASS} ${COVER_COLLECTIONS_MOBILE_GRID_GAP_X_CLASS} ${COVER_COLLECTIONS_MOBILE_GRID_GAP_Y_CLASS}`}
            >
              {coverCollections.map((item) => (
                <CoverCollectionProductCard key={item.slug} item={item} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="flex flex-col gap-4 sm:gap-5">
          <HomeSectionTitle
            title={t('home.homepage.ritual.title')}
            descriptionTwoLine={{
              line1Bold: t('home.homepage.ritual.description.line1Bold'),
              line1Rest: t('home.homepage.ritual.description.line1Rest'),
              line2: t('home.homepage.ritual.description.line2'),
            }}
            className="[&_p]:text-[0.95rem] sm:[&_p]:text-[0.95rem] [&_p]:font-medium"
            titleClassName="sm:whitespace-normal !font-black"
          />
          <div className="overflow-hidden rounded-t-[1.5rem] rounded-b-[0.4rem] sm:rounded-t-[2.25rem] sm:rounded-b-[0.55rem]">
            <div className="relative h-[24rem] sm:h-[30rem] lg:h-[25.5rem]">
              <Image src={HOME_ASSET_PATHS.ritualBanner} alt={t('home.homepage.ritual.bannerAlt')} fill className="object-cover" sizes="1680px" />
            </div>
          </div>
          <div className="-mt-2 rounded-b-[1.5rem] rounded-t-[0.4rem] bg-white px-5 pb-6 pt-5 font-montserrat shadow-[0_8px_30px_rgba(18,42,38,0.06)] sm:-mt-2 sm:rounded-b-[2.25rem] sm:rounded-t-[0.55rem] sm:px-8 sm:pb-7 sm:pt-6">
            <div className="grid max-xl:gap-0 gap-6 xl:grid-cols-4">
              {RITUAL_STEPS.map((step, index) => (
                <div
                  key={step.step}
                  className={`flex gap-3 ${
                    index < RITUAL_STEPS.length - 1
                      ? 'border-b border-[#dddddd] pb-6 xl:border-b-0 xl:border-r xl:border-[#dddddd] xl:pb-0 xl:pr-6'
                      : ''
                  }`}
                >
                  <span className="shrink-0 text-5xl font-bold leading-none tracking-tight text-[#dcc49a] sm:text-6xl">
                    {step.step}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <h3 className="text-base font-bold leading-snug text-[#1f1f1f] sm:text-lg">
                      {t(`home.homepage.ritual.steps.${ritualStepKeys[index]}.title`)}
                    </h3>
                    <p className="mt-0.5 text-xs font-normal leading-relaxed text-[#2a2a2a] sm:text-sm">
                      {t(`home.homepage.ritual.steps.${ritualStepKeys[index]}.description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-start sm:mt-6 lg:justify-center">
              <HomeActionButton href="/contact" label={t('home.homepage.ritual.cta')} className="font-semibold" />
            </div>
          </div>
        </section>

        <div className="sm:mt-16">
          <TrendingFeaturedSection />
        </div>

        <section className="grid gap-y-6 sm:gap-y-8 lg:gap-x-2 lg:grid-cols-[minmax(0,1.28fr)_minmax(30rem,33.5rem)_minmax(0,1.28fr)]">
          <div className="relative min-h-[20.5rem] overflow-hidden rounded-t-[2rem] rounded-b-[1rem] sm:min-h-[32rem] sm:rounded-[2rem] lg:rounded-r-[0.625rem]">
            <Image src={HOME_ASSET_PATHS.craftTools} alt={t('home.homepage.bringing.imageAltLeft')} fill className="object-cover object-left" sizes="472px" />
          </div>
          <div className="flex h-full min-h-[23rem] flex-col bg-white px-5 py-7 shadow-[0_8px_30px_rgba(18,42,38,0.08)] sm:min-h-[32rem] sm:px-8 sm:py-9 lg:px-9 rounded-[1.5rem] sm:rounded-[1rem]">
            <h2 className="max-w-[20rem] whitespace-pre-line text-[1.82rem] font-black leading-[1.04] tracking-[-0.01em] text-[#434347] sm:text-[2.4rem]">
              {t('home.homepage.bringing.title')}
            </h2>
            <div className="mt-5 space-y-4 text-[0.84rem] font-semibold leading-[1.48] text-[#434347] sm:mt-7 sm:space-y-5 sm:text-[0.95rem] sm:leading-[1.48] lg:text-[1rem]">
              <p>{t('home.homepage.bringing.paragraphs.first')}</p>
              <p>{t('home.homepage.bringing.paragraphs.second')}</p>
              <p>{t('home.homepage.bringing.paragraphs.third')}</p>
              <p>
                {t('home.homepage.bringing.paragraphs.fourthPrefix')}{' '}
                <Link
                  href="/about"
                  className="text-[#dcc090] underline-offset-2 transition-opacity hover:opacity-90 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcc090]"
                >
                  {t('home.homepage.bringing.moreLabel')}
                </Link>
              </p>
              <p>{t('home.homepage.bringing.paragraphs.fifth')}</p>
            </div>
          </div>
          <div className="relative hidden min-h-[20.5rem] overflow-hidden rounded-t-[2rem] rounded-b-[1rem] sm:min-h-[32rem] sm:rounded-[2rem] lg:block lg:rounded-l-[0.625rem]">
            <Image src={HOME_ASSET_PATHS.craftTools} alt={t('home.homepage.bringing.imageAltRight')} fill className="object-cover object-right" sizes="472px" />
          </div>
        </section>

        <UpcomingProductsSection />

        <section className="flex flex-col gap-6 sm:gap-7">
          <div className="mx-auto w-full max-w-4xl">
            <HomeSectionTitle
              title={t('home.homepage.behindCreation.title')}
              description={t('home.homepage.behindCreation.description')}
              className="gap-3 [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_p]:text-sm [&_p]:sm:text-base"
            />
            <div className="relative mt-4 sm:mt-5">
              <div className="overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
                <div className="relative h-[170.812px] sm:h-[26rem] lg:h-[28rem]">
                  <Image
                    src="/assets/home/concepts/behind-creation.webp"
                    alt={t('home.homepage.behindCreation.imageAlt')}
                    fill
                    className="object-cover object-[58%_center] sm:object-center"
                    sizes="(max-width: 896px) 100vw, 896px"
                  />
                  <div className="absolute inset-0 bg-black/15" />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  className="pointer-events-auto flex min-h-[3.4rem] min-w-[3.4rem] translate-x-6 items-center justify-center rounded-full p-2 transition-transform hover:scale-105 sm:min-h-[4.7rem] sm:min-w-[4.7rem] sm:translate-x-7 sm:p-3"
                >
                  <span
                    aria-hidden="true"
                    className="relative flex h-[3.15rem] w-[3.15rem] items-center justify-center rounded-full bg-[#dcc090] drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:h-[4.25rem] sm:w-[4.25rem]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="ml-[0.3rem] h-[2.7rem] w-[2.7rem] sm:ml-[0.34rem] sm:h-[3.2rem] sm:w-[3.2rem]"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 6.5c0-.83.94-1.3 1.6-.8l7.2 5.5a1 1 0 0 1 0 1.6l-7.2 5.5A1 1 0 0 1 8 17.5v-11Z"
                        fill="#1f2442"
                        stroke="#1f2442"
                        strokeWidth="0.9"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="sr-only">{t('home.homepage.behindCreation.youtubeAlt')}</span>
                </button>
              </div>
            </div>
            <div className="mt-4 flex justify-center sm:mt-5">
              <HomeActionButton
                href="/about"
                label={t('home.homepage.behindCreation.cta')}
                className="min-w-[13.75rem] !rounded-[0.55rem] !px-7 !text-[1.08rem] !font-semibold !tracking-[0.14em] sm:min-w-[14.25rem] sm:!text-[1.12rem] sm:!tracking-[0.16em]"
              />
            </div>
          </div>
        </section>

        <CultureVotingSection />

        <section className="grid gap-8 overflow-visible sm:gap-10 xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
          <div className="flex flex-col justify-start gap-6 pt-5 sm:gap-8 sm:pt-7 xl:pt-12">
            <HomeSectionTitle
              title={t('home.homepage.upcomingLines.title')}
              description={t('home.homepage.upcomingLines.description')}
              descriptionMobile={t('home.homepage.upcomingLines.descriptionMobile')}
              centerOnMobileOnly
              className="gap-4 sm:gap-5 [&_h2]:text-[2.125rem] [&_h2]:leading-[1.18] [&_h2]:sm:text-6xl [&_p]:text-sm [&_p]:sm:text-base [&_p]:leading-relaxed"
            />
            <HomeActionButton
              href="/contact"
              label={t('home.homepage.upcomingLines.cta')}
              className="mx-auto hidden w-fit !rounded-[0.55rem] !px-7 !text-[1.08rem] !font-bold !tracking-[0.14em] sm:mx-0 sm:inline-flex sm:!text-[1.12rem] sm:!font-extrabold sm:!tracking-[0.16em]"
            />
          </div>
          <div className="overflow-visible pt-3 sm:pt-10">
            <div className={UPCOMING_LINES_MASONRY_STACK_CLASS}>
              <div className={`${UPCOMING_LINES_MASONRY_ROW_CLASS} items-start`}>
                <div className={MASONRY_ROW1_LEFT}>
                  {renderUpcomingLineCard('Phones', { masonryTile: 'phones' })}
                </div>
                <div className={MASONRY_ROW1_RIGHT}>
                  {renderUpcomingLineCard('Notebooks', { masonryTile: 'notebooks' })}
                </div>
              </div>
              <div className={`${UPCOMING_LINES_MASONRY_ROW_CLASS} items-start`}>
                <div className={MASONRY_ROW2_LEFT}>
                  {renderUpcomingLineCard('Knifes', { masonryTile: 'knifes' })}
                </div>
                <div className={MASONRY_ROW2_RIGHT}>
                  {renderUpcomingLineCard('Keys', { masonryTile: 'keys' })}
                </div>
              </div>
              <div className={UPCOMING_LINES_MASONRY_ROW3_CLASS}>
                <div className={MASONRY_ROW3_LEFT}>
                  {renderUpcomingLineCard('Documents', { masonryTile: 'documents' })}
                </div>
                <div className={MASONRY_ROW3_RIGHT}>
                  {renderUpcomingLineCard('Wallets', { masonryTile: 'wallets' })}
                </div>
              </div>
            </div>
            <div className="hidden xl:grid xl:h-[23.5rem] xl:w-full xl:grid-cols-3 xl:gap-x-3 2xl:h-[27.5rem] 2xl:gap-x-4">
              <div className="grid h-full xl:[grid-template-rows:350fr_32fr_186fr]">
                {renderUpcomingLineCard('Notebooks')}
                <div aria-hidden="true" />
                {renderUpcomingLineCard('Wallets')}
              </div>
              <div className="grid h-full xl:[grid-template-rows:234fr_32fr_302fr]">
                {renderUpcomingLineCard('Knifes')}
                <div aria-hidden="true" />
                {renderUpcomingLineCard('Documents')}
              </div>
              <div className="grid h-full xl:[grid-template-rows:350fr_32fr_186fr]">
                {renderUpcomingLineCard('Phones')}
                <div aria-hidden="true" />
                {renderUpcomingLineCard('Keys')}
              </div>
            </div>
          </div>
          {/* Keep CTA inside section so parent `gap-[140px]` does not insert ~140px between cards and button (<sm). */}
          <div className="flex justify-center sm:hidden">
            <HomeActionButton
              href="/contact"
              label={t('home.homepage.upcomingLines.cta')}
              className="w-fit !rounded-[0.55rem] !px-7 !text-[1.08rem] !font-bold !tracking-[0.14em] sm:!text-[1.12rem] sm:!font-extrabold sm:!tracking-[0.16em]"
            />
          </div>
        </section>

        <section className="flex flex-col items-center gap-8">
          <HomeSectionTitle
            title={t('home.homepage.sayHi.title')}
            description={t('home.homepage.sayHi.description')}
          />
          <HomeActionButton
            href="/contact"
            label={t('home.homepage.sayHi.cta')}
            className="min-w-[13.75rem] !min-h-11 sm:!min-h-12 !rounded-[0.55rem] !px-7 !text-[1.08rem] !font-bold !tracking-[0.14em] sm:!text-[1.12rem] sm:!font-extrabold sm:!tracking-[0.16em]"
          />
        </section>
      </div>
    </div>
  );
}
