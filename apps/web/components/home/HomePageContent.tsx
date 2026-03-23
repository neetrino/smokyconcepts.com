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

function PackFitCard({
  title,
  subtitle,
  heightClassName,
  widthClassName,
  useCompactImage,
}: (typeof PACK_FIT_ITEMS)[number]) {
  return (
    <div className="flex min-w-[9rem] flex-col items-center gap-3">
      <div className={`relative flex items-end justify-center ${heightClassName} ${widthClassName}`}>
        {useCompactImage ? (
          <Image
            src={HOME_ASSET_PATHS.compactPack}
            alt={title}
            fill
            className="object-contain"
            sizes="144px"
          />
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
    <div className="relative overflow-visible pt-2">
      <div className="rounded-[2rem] bg-white px-5 pb-6 pt-12 shadow-[0_6px_24px_rgba(18,42,38,0.06)] sm:px-6 sm:pt-14">
        <div className="relative -mt-20 mb-3 flex h-36 justify-center sm:-mt-[5.25rem] sm:mb-4 sm:h-40">
          <div className="relative h-full w-full max-w-[12rem]">
            <Image
              src={imageSrc}
              alt={title}
              fill
              className="object-contain [filter:blur(4px)_brightness(0.98)_drop-shadow(0_10px_18px_rgba(18,42,38,0.16))] sm:[filter:blur(6px)_brightness(0.86)_drop-shadow(0_10px_20px_rgba(18,42,38,0.18))]"
              sizes="(max-width: 640px) 45vw, 220px"
            />
          </div>
        </div>
        <h3 className="text-xl font-extrabold text-[#414141]">{title}</h3>
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
  return (
    <div className="overflow-x-hidden overflow-y-visible bg-[#f3f1ee] text-[#414141]">
      <div className="mx-auto flex max-w-[120rem] flex-col gap-24 overflow-x-hidden overflow-y-visible px-4 pb-24 pt-10 sm:px-8 lg:px-[7.5rem]">
        <section className="flex flex-col gap-10">
          <HomeSectionTitle
            title="We Make Concepts Real"
            description="Premium accessories that redefine your rituals."
          />
          <HomeHeroSection slides={heroSlides} />
        </section>

        <section className="flex flex-col gap-10 pb-10">
          <HomeSectionTitle
            title="Will it fit mine?"
            description="Pack names are standard. Dimensions aren’t. We make precise versions that match yours"
          />
          <div className="flex flex-wrap items-end justify-center gap-x-8 gap-y-6">
            {PACK_FIT_ITEMS.map((item) => (
              <PackFitCard key={item.title} {...item} />
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <HomeActionButton href="/products" label="Check Availability" className="min-w-[19rem]" />
          </div>
        </section>

        {coverCollections.length > 0 ? (
          <section className="flex flex-col gap-10 overflow-visible pt-6">
            <HomeSectionTitle title="Cover Collections" />
            <div className="grid gap-8 lg:grid-cols-4 overflow-visible">
              {coverCollections.map((item) => (
                <Link
                  key={item.slug}
                  href={`/products?category=${item.slug}`}
                  className="mt-10 block overflow-visible rounded-[2.5rem] bg-white px-6 pb-4 pt-0 shadow-[0_6px_24px_rgba(18,42,38,0.05)] transition-transform duration-200 hover:-translate-y-1"
                >
                  {/* Պատկերը բլոկից դուրս վեր — negative margin, բլոկի եզրից վեր */}
                  <div className="relative -mt-24 h-[22rem] overflow-visible">
                    {item.imageSrc ? (
                      <img
                        src={item.imageSrc}
                        alt={item.title}
                        className="h-full w-full object-contain object-top"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <img
                          src={HOME_ASSET_PATHS.packMark}
                          alt=""
                          className="h-20 w-16 object-contain opacity-60"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-extrabold leading-none text-[#414141]">{item.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="flex flex-col gap-10">
          <HomeSectionTitle
            title="Your Ritual. Your Signature"
            description="Personalize your Smoky Cover. A small detail. A clear message."
          />
          <div className="overflow-hidden rounded-[2.25rem]">
            <div className="relative h-[30rem]">
              <Image src={HOME_ASSET_PATHS.ritualBanner} alt="Crafting ritual" fill className="object-cover" sizes="1680px" />
            </div>
          </div>
          <div className="rounded-[2.25rem] rounded-t-xl bg-white px-6 pb-7 pt-6 font-montserrat shadow-[0_8px_30px_rgba(18,42,38,0.06)] sm:px-8">
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
                    <h3 className="text-base font-bold leading-snug text-[#333333] sm:text-lg">{step.title}</h3>
                    <p className="mt-0.5 text-xs font-normal leading-relaxed text-[#333333] sm:text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <HomeActionButton href="/contact" label="Personalize" />
            </div>
          </div>
        </section>

        <TrendingFeaturedSection />

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(32rem,35.5rem)_minmax(0,1fr)]">
          <div className="relative min-h-[30rem] overflow-hidden rounded-[2rem] sm:min-h-[32rem]">
            <Image src={HOME_ASSET_PATHS.craftTools} alt="Concept tools" fill className="object-cover object-left" sizes="472px" />
          </div>
          <div className="flex h-full min-h-[30rem] flex-col rounded-[2rem] bg-white px-7 py-8 shadow-[0_10px_30px_rgba(18,42,38,0.05)] sm:min-h-[32rem] sm:px-8 sm:py-9">
            <h2 className="text-3xl font-extrabold leading-[1.05] sm:text-4xl">Bringing Concepts to Life.</h2>
            <div className="mt-5 space-y-3.5 text-base font-medium leading-relaxed sm:mt-6 sm:space-y-4">
              <p>Smoky Concepts brings fresh ideas into real life. We study everyday rituals, find what’s missing, and design the piece that feels right, more beautiful, more personal, more you.</p>
              <p>Our first concept is Covering. Starting with Smoky Covers for cigarette packs, then taking it to other everyday objects, our way.</p>
              <p>We transform what you already use into something you’ll love to hold.</p>
              <p>Engineering meets handcraft to build pieces you’ll keep as part of your ritual. <span className="text-[#dcc090]">More</span></p>
              <p>Now you know the philosophy. Meet what’s coming.</p>
            </div>
          </div>
          <div className="relative min-h-[30rem] overflow-hidden rounded-[2rem] sm:min-h-[32rem]">
            <Image src={HOME_ASSET_PATHS.craftTools} alt="Craft details" fill className="object-cover object-right" sizes="472px" />
          </div>
        </section>

        <UpcomingProductsSection />

        <section className="flex flex-col gap-6 sm:gap-7">
          <div className="mx-auto w-full max-w-4xl">
            <HomeSectionTitle
              title="Behind the Creation"
              description="Technology gives it form. Living materials give it soul. Crafted into something you carry daily."
              className="gap-3 [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_p]:text-sm [&_p]:sm:text-base"
            />
            <div className="relative mt-4 sm:mt-5">
              <div className="overflow-hidden rounded-2xl sm:rounded-[2rem]">
                <div className="relative h-[22rem] sm:h-[26rem] lg:h-[28rem]">
                  <Image
                    src="/assets/home/concepts/behind-creation.png"
                    alt="Behind the creation"
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
                  className="pointer-events-auto flex min-h-[5rem] min-w-[5rem] items-center justify-center rounded-full bg-transparent p-2.5 transition-transform hover:scale-105 sm:min-h-[6rem] sm:min-w-[6rem] sm:p-4"
                >
                  <img
                    src={HOME_ASSET_PATHS.youtubeIcon}
                    alt="YouTube"
                    className="h-12 w-12 max-h-none max-w-none object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:h-16 sm:w-16"
                  />
                </button>
              </div>
            </div>
            <div className="mt-4 flex justify-center sm:mt-5">
              <HomeActionButton href="/about" label="Deep Dive" />
            </div>
          </div>
        </section>

        <CultureVotingSection />

        <section className="grid gap-10 overflow-visible xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
          <div className="flex flex-col justify-center gap-8">
            <HomeSectionTitle
              title="Upcoming Product Lines"
              description="The Covering concept expands: Smoky Covers for money, phones, laptops, documents, keys, Knifes, and more. Next up, and it’s going to be special."
              centered={false}
              className="gap-5 [&_h2]:text-5xl [&_h2]:leading-tight [&_h2]:sm:text-6xl [&_p]:text-sm [&_p]:sm:text-base [&_p]:leading-relaxed"
            />
            <HomeActionButton href="/contact" label="Notify Me" className="w-fit" />
          </div>
          <div className="grid gap-x-4 gap-y-12 overflow-visible pt-8 sm:grid-cols-2 sm:pt-10 xl:grid-cols-3 xl:gap-y-14">
            {UPCOMING_LINES.map((item) => (
              <UpcomingLineCard key={item.title} {...item} />
            ))}
          </div>
        </section>

        <section className="flex flex-col items-center gap-8">
          <HomeSectionTitle
            title="Say Hi"
            description="Have a question, an idea, or a collaboration in mind?"
          />
          <HomeActionButton href="/contact" label="Reach Out" className="min-w-[13.75rem]" />
        </section>
      </div>
    </div>
  );
}
