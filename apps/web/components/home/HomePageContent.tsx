import Image from 'next/image';
import Link from 'next/link';

import { HomeActionButton } from './HomeActionButton';
import { CultureVotingSection } from './CultureVotingSection';
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
        <h3 className="text-sm font-extrabold leading-none text-[#414141]">{title}</h3>
        {subtitle ? <p className="mt-1 text-[9px] font-medium text-black">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function UpcomingLineCard({ title, imageSrc }: (typeof UPCOMING_LINES)[number]) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-[0_6px_24px_rgba(18,42,38,0.05)]">
      <div className="relative mb-6 h-36">
        <Image src={imageSrc} alt={title} fill className="object-contain blur-[0.4px]" sizes="220px" />
      </div>
      <h3 className="text-2xl font-extrabold text-[#414141]">{title}</h3>
    </div>
  );
}

/**
 * Full static homepage assembled from Figma-derived assets.
 */
interface HomePageContentProps {
  coverCollections: HomeCoverCollectionItem[];
}

export function HomePageContent({ coverCollections }: HomePageContentProps) {
  return (
    <div className="overflow-x-hidden overflow-y-clip bg-[#f3f1ee] text-[#414141]">
      <div className="mx-auto flex max-w-[120rem] flex-col gap-24 overflow-x-hidden overflow-y-clip px-4 pb-24 pt-10 sm:px-8 lg:px-[7.5rem]">
        <section className="flex flex-col gap-10">
          <HomeSectionTitle
            title="We Make Concepts Real"
            description="Premium accessories that redefine your rituals."
          />
          <div className="relative overflow-hidden rounded-[2.25rem]">
            <div className="relative h-[42.5rem]">
              <Image src={HOME_ASSET_PATHS.heroBanner} alt="Smoky Concepts hero" fill className="object-cover" priority sizes="1680px" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
              <div className="absolute bottom-12 left-8 max-w-[33rem] text-white sm:left-12">
                <h1 className="text-6xl font-extrabold leading-none">Contrary</h1>
                <p className="mt-5 text-xl font-medium leading-[1.65]">
                  The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from
                </p>
                <HomeActionButton href="/about" label="Deep Dive" className="mt-7" />
              </div>
              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                <span className="h-1.5 w-4 rounded-full bg-white" />
                <span className="h-1.5 w-3 rounded-full bg-white/60" />
                <span className="h-1.5 w-2 rounded-full bg-white/50" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
              </div>
            </div>
          </div>
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
                  <h3 className="text-[1.5rem] font-extrabold leading-none text-[#414141]">{item.title}</h3>
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
            <div className="relative h-[32.5rem]">
              <Image src={HOME_ASSET_PATHS.ritualBanner} alt="Crafting ritual" fill className="object-cover" sizes="1680px" />
            </div>
          </div>
          <div className="rounded-[2.25rem] rounded-t-xl bg-white px-8 pb-10 pt-8 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
            <div className="grid gap-8 xl:grid-cols-4">
              {RITUAL_STEPS.map((step, index) => (
                <div key={step.step} className={`flex gap-5 ${index < RITUAL_STEPS.length - 1 ? 'xl:border-r xl:border-black/10 xl:pr-6' : ''}`}>
                  <span className="text-7xl font-bold leading-none text-[#dcc090]">{step.step}</span>
                  <div className="pt-2">
                    <h3 className="text-[1.8rem] font-extrabold leading-none">{step.title}</h3>
                    <p className="mt-3 text-lg font-medium leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <HomeActionButton href="/contact" label="Personalize" />
            </div>
          </div>
        </section>

        <TrendingFeaturedSection />

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(32rem,35.5rem)_minmax(0,1fr)]">
          <div className="relative min-h-[40rem] overflow-hidden rounded-[2rem]">
            <Image src={HOME_ASSET_PATHS.craftTools} alt="Concept tools" fill className="object-cover object-left" sizes="472px" />
          </div>
          <div className="rounded-[2rem] bg-white px-10 py-12 shadow-[0_10px_30px_rgba(18,42,38,0.05)]">
            <h2 className="text-5xl font-extrabold leading-[1.05]">Bringing Concepts to Life.</h2>
            <div className="mt-10 space-y-6 text-lg font-medium leading-[1.65]">
              <p>Smoky Concepts brings fresh ideas into real life. We study everyday rituals, find what’s missing, and design the piece that feels right, more beautiful, more personal, more you.</p>
              <p>Our first concept is Covering. Starting with Smoky Covers for cigarette packs, then taking it to other everyday objects, our way.</p>
              <p>We transform what you already use into something you’ll love to hold.</p>
              <p>Engineering meets handcraft to build pieces you’ll keep as part of your ritual. <span className="text-[#dcc090]">More</span></p>
              <p>Now you know the philosophy. Meet what’s coming.</p>
            </div>
          </div>
          <div className="relative min-h-[40rem] overflow-hidden rounded-[2rem]">
            <Image src={HOME_ASSET_PATHS.craftTools} alt="Craft details" fill className="object-cover object-right" sizes="472px" />
          </div>
        </section>

        <UpcomingProductsSection />

        <section className="flex flex-col gap-10">
          <HomeSectionTitle
            title="Behind the Creation"
            description="Technology gives it form. Living materials give it soul. Crafted into something you carry daily."
          />
          <div className="relative overflow-hidden rounded-[2.25rem]">
            <div className="relative h-[39rem]">
              <Image src="/assets/home/concepts/behind-creation.png" alt="Behind the creation" fill className="object-cover" sizes="1080px" />
              <div className="absolute inset-0 bg-black/15" />
              <button type="button" className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#dcc090] transition-transform hover:scale-105">
                <img src={HOME_ASSET_PATHS.playIcon} alt="Play" className="h-28 w-28 object-contain" />
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <HomeActionButton href="/about" label="Deep Dive" />
          </div>
        </section>

        <CultureVotingSection />

        <section className="grid gap-10 xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
          <div className="flex flex-col justify-center gap-8">
            <HomeSectionTitle
              title="Upcoming Product Lines"
              description="The Covering concept expands: Smoky Covers for money, phones, laptops, documents, keys, Knifes, and more. Next up, and it’s going to be special."
              centered={false}
            />
            <HomeActionButton href="/contact" label="Notify Me" className="w-fit" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
