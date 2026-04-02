'use client';

import Image from 'next/image';
import Link from 'next/link';

import { HomeActionButton } from './HomeActionButton';
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
import { useTranslation } from '@/lib/i18n-client';

function PackFitCard({
  title,
  subtitle,
  heightClassName,
  widthClassName,
  useCompactImage,
}: (typeof PACK_FIT_ITEMS)[number]) {
  return (
    <div className="flex min-w-[8.25rem] shrink-0 snap-center flex-col items-center gap-3 sm:min-w-[9rem]">
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
        <h3 className="text-xs font-extrabold leading-none text-[#414141]">{title}</h3>
        {subtitle ? <p className="mt-1 text-[0.5rem] font-medium text-black">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function UpcomingLineCard({ title, imageSrc }: (typeof UPCOMING_LINES)[number]) {
  return (
    <div className="relative overflow-visible pt-6 sm:pt-8">
      <div className="relative flex min-h-[7.6rem] flex-col justify-end rounded-[1.2rem] bg-[#f3f3f3] px-3 pb-2.5 pt-10 sm:min-h-[11.5rem] sm:rounded-[2rem] sm:bg-white sm:px-6 sm:pb-6 sm:pt-14">
        <div className="pointer-events-none absolute left-1/2 top-0 h-20 w-20 -translate-x-1/2 -translate-y-[33%] sm:h-28 sm:w-28 sm:-translate-y-[34%]">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-contain [filter:blur(2px)_brightness(1.03)_drop-shadow(0_8px_14px_rgba(18,42,38,0.12))] sm:[filter:blur(5px)_brightness(0.9)_drop-shadow(0_10px_20px_rgba(18,42,38,0.16))]"
            sizes="(max-width: 640px) 84px, 112px"
          />
        </div>
        <h3 className="text-[1.25rem] font-extrabold leading-none text-[#36373a] sm:text-3xl">{title}</h3>
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
  const upcomingLineOrder: Record<string, number> = {
    Phones: 0,
    Notebooks: 1,
    Knifes: 2,
    Keys: 3,
    Documents: 4,
    Wallets: 5,
  };
  const orderedUpcomingLines = [...UPCOMING_LINES].sort((a, b) => {
    const aOrder = upcomingLineOrder[a.title] ?? Number.MAX_SAFE_INTEGER;
    const bOrder = upcomingLineOrder[b.title] ?? Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder;
  });
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

  return (
    <div className="overflow-x-hidden overflow-y-hidden bg-[#efefef] text-[#414141]">
      <div className="mx-auto flex max-w-[120rem] flex-col gap-16 overflow-x-hidden overflow-y-hidden px-6 pb-20 pt-8 sm:gap-24 sm:px-8 sm:pb-24 sm:pt-10 lg:px-[7.5rem]">
        <section className="flex flex-col gap-8 sm:gap-10">
          <HomeSectionTitle
            title={t('home.homepage.hero.title')}
            description={t('home.homepage.hero.description')}
          />
          <HomeHeroSection slides={heroSlides} />
        </section>

        <section className="flex flex-col gap-8 pb-8 sm:gap-10 sm:pb-10">
          <HomeSectionTitle
            title={t('home.homepage.packFit.title')}
            description={t('home.homepage.packFit.description')}
          />
          <div className="sm:hidden">
            <div className="-mx-6 overflow-x-auto px-6 pb-2 scrollbar-hide">
              <div className="flex min-w-max snap-x snap-mandatory items-end gap-5">
                {PACK_FIT_ITEMS.map((item, index) => (
                  <PackFitCard
                    key={item.title}
                    {...item}
                    title={t(`home.homepage.packFit.items.${packFitKeyByIndex[index]}.title`)}
                    subtitle={
                      packFitKeyByIndex[index] === 'kingSize' ||
                      packFitKeyByIndex[index] === 'sticks'
                        ? ''
                        : t(`home.homepage.packFit.items.${packFitKeyByIndex[index]}.subtitle`)
                    }
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="hidden flex-wrap items-end justify-center gap-x-8 gap-y-6 sm:flex">
            {PACK_FIT_ITEMS.map((item, index) => (
              <PackFitCard
                key={item.title}
                {...item}
                title={t(`home.homepage.packFit.items.${packFitKeyByIndex[index]}.title`)}
                subtitle={
                  packFitKeyByIndex[index] === 'kingSize' ||
                  packFitKeyByIndex[index] === 'sticks'
                    ? ''
                    : t(`home.homepage.packFit.items.${packFitKeyByIndex[index]}.subtitle`)
                }
              />
            ))}
          </div>
          <div className="flex justify-center pt-1 sm:pt-2">
            <HomeActionButton href="/products" label={t('home.homepage.packFit.cta')} className="min-w-[19rem]" />
          </div>
        </section>

        {coverCollections.length > 0 ? (
          <section className="flex flex-col gap-8 overflow-visible pt-3 sm:gap-10 sm:pt-6">
            <HomeSectionTitle title={t('home.homepage.coverCollections.title')} />
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 overflow-visible sm:gap-8 lg:grid-cols-4">
              {coverCollections.map((item) => (
                <Link
                  key={item.slug}
                  href={`/products?category=${item.slug}`}
                  className="group relative z-0 mt-7 block overflow-visible rounded-[1.5rem] bg-white px-4 pb-3 pt-0 shadow-[0_6px_24px_rgba(18,42,38,0.05)] transition-shadow duration-200 hover:z-10 hover:shadow-[0_12px_32px_rgba(18,42,38,0.12)] focus-visible:z-10 focus-within:z-10 sm:mt-10 sm:rounded-[2.5rem] sm:px-6 sm:pb-4"
                >
                  <div className="relative -mt-16 h-44 overflow-visible sm:-mt-24 sm:h-[22rem]">
                    {item.imageSrc ? (
                      <img
                        src={item.imageSrc}
                        alt={item.title}
                        className="h-full w-full origin-bottom object-contain object-top transition-transform duration-300 ease-out group-hover:scale-110 group-hover:drop-shadow-[0_12px_24px_rgba(18,42,38,0.18)]"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <img
                          src={HOME_ASSET_PATHS.packMark}
                          alt=""
                          className="h-20 w-16 origin-bottom object-contain opacity-60 transition-transform duration-300 ease-out group-hover:scale-110"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold leading-none text-[#414141] sm:text-xl">{item.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="flex flex-col gap-8 sm:gap-10">
          <HomeSectionTitle
            title={t('home.homepage.ritual.title')}
            description={t('home.homepage.ritual.description')}
          />
          <div className="overflow-hidden rounded-[1.5rem] sm:rounded-[2.25rem]">
            <div className="relative h-[24rem] sm:h-[30rem]">
              <Image src={HOME_ASSET_PATHS.ritualBanner} alt={t('home.homepage.ritual.bannerAlt')} fill className="object-cover" sizes="1680px" />
            </div>
          </div>
          <div className="rounded-[1.5rem] rounded-t-xl bg-white px-5 pb-6 pt-5 font-montserrat shadow-[0_8px_30px_rgba(18,42,38,0.06)] sm:rounded-[2.25rem] sm:px-8 sm:pb-7 sm:pt-6">
            <div className="grid gap-6 xl:grid-cols-4">
              {RITUAL_STEPS.map((step, index) => (
                <div
                  key={step.step}
                  className={`flex gap-3 ${index < RITUAL_STEPS.length - 1 ? 'xl:border-r xl:border-[#eeeeee] xl:pr-6' : ''}`}
                >
                  <span className="shrink-0 text-5xl font-bold leading-none tracking-tight text-[#dcc49a] sm:text-6xl">
                    {step.step}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <h3 className="text-base font-bold leading-snug text-[#333333] sm:text-lg">
                      {t(`home.homepage.ritual.steps.${ritualStepKeys[index]}.title`)}
                    </h3>
                    <p className="mt-0.5 text-xs font-normal leading-relaxed text-[#333333] sm:text-sm">
                      {t(`home.homepage.ritual.steps.${ritualStepKeys[index]}.description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-start sm:mt-6 lg:justify-center">
              <HomeActionButton href="/contact" label={t('home.homepage.ritual.cta')} />
            </div>
          </div>
        </section>

        <TrendingFeaturedSection />

        <section className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(32rem,35.5rem)_minmax(0,1fr)]">
          <div className="relative min-h-[23rem] overflow-hidden rounded-[1.5rem] sm:min-h-[32rem] sm:rounded-[2rem]">
            <Image src={HOME_ASSET_PATHS.craftTools} alt={t('home.homepage.bringing.imageAltLeft')} fill className="object-cover object-left" sizes="472px" />
          </div>
          <div className="flex h-full min-h-[23rem] flex-col rounded-[1.5rem] bg-white px-5 py-6 shadow-[0_10px_30px_rgba(18,42,38,0.05)] sm:min-h-[32rem] sm:rounded-[2rem] sm:px-8 sm:py-9">
            <h2 className="text-[2rem] font-extrabold leading-[1.05] sm:text-4xl">{t('home.homepage.bringing.title')}</h2>
            <div className="mt-4 space-y-3 text-sm font-medium leading-relaxed sm:mt-6 sm:space-y-4 sm:text-base">
              <p>{t('home.homepage.bringing.paragraphs.first')}</p>
              <p>{t('home.homepage.bringing.paragraphs.second')}</p>
              <p>{t('home.homepage.bringing.paragraphs.third')}</p>
              <p>
                {t('home.homepage.bringing.paragraphs.fourthPrefix')}{' '}
                <span className="text-[#dcc090]">{t('home.homepage.bringing.moreLabel')}</span>
              </p>
              <p>{t('home.homepage.bringing.paragraphs.fifth')}</p>
            </div>
          </div>
          <div className="relative min-h-[23rem] overflow-hidden rounded-[1.5rem] sm:min-h-[32rem] sm:rounded-[2rem]">
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
                    src="/assets/home/concepts/behind-creation.png"
                    alt={t('home.homepage.behindCreation.imageAlt')}
                    fill
                    className="object-cover"
                    sizes="(max-width: 896px) 100vw, 896px"
                  />
                  <div className="absolute inset-0 bg-black/15" />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  className="pointer-events-auto flex min-h-[4rem] min-w-[4rem] items-center justify-center rounded-full bg-transparent p-2 transition-transform hover:scale-105 sm:min-h-[6rem] sm:min-w-[6rem] sm:p-4"
                >
                  <img
                    src={HOME_ASSET_PATHS.youtubeIcon}
                    alt={t('home.homepage.behindCreation.youtubeAlt')}
                    className="h-10 w-10 max-h-none max-w-none object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:h-16 sm:w-16"
                  />
                </button>
              </div>
            </div>
            <div className="mt-4 flex justify-center sm:mt-5">
              <HomeActionButton href="/about" label={t('home.homepage.behindCreation.cta')} />
            </div>
          </div>
        </section>

        <CultureVotingSection />

        <section className="grid gap-8 overflow-visible sm:gap-10 xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
          <div className="flex flex-col justify-center gap-6 sm:gap-8">
            <HomeSectionTitle
              title={t('home.homepage.upcomingLines.title')}
              description={t('home.homepage.upcomingLines.description')}
              centered={false}
              className="gap-4 text-center sm:gap-5 sm:text-left [&_h2]:text-[2.125rem] [&_h2]:leading-[1.18] [&_h2]:sm:text-6xl [&_p]:text-sm [&_p]:sm:text-base [&_p]:leading-relaxed"
            />
            <HomeActionButton href="/contact" label={t('home.homepage.upcomingLines.cta')} className="mx-auto hidden w-fit sm:inline-flex sm:mx-0" />
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-3 overflow-visible pt-3 sm:gap-x-4 sm:gap-y-10 sm:pt-10 xl:grid-cols-3 xl:gap-y-14">
            {orderedUpcomingLines.map((item) => (
              <UpcomingLineCard
                key={item.title}
                {...item}
                title={t(`home.homepage.upcomingLines.cards.${upcomingLineKeyByTitle[item.title] ?? 'documents'}`)}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col items-center gap-8">
          <HomeSectionTitle
            title={t('home.homepage.sayHi.title')}
            description={t('home.homepage.sayHi.description')}
          />
          <HomeActionButton href="/contact" label={t('home.homepage.sayHi.cta')} className="min-w-[13.75rem]" />
        </section>
      </div>
    </div>
  );
}
