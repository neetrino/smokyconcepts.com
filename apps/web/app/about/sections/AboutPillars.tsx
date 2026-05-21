'use client';

import Image from 'next/image';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from '@/lib/i18n-client';
import type { LanguageCode } from '@/lib/language';
import { renderAboutRichParagraphs, renderPillarTitleLines } from '../utils/renderAboutRichText';

/** Image slot (margins below image tuned per language in PillarCard). */
const PILLAR_IMAGE_ROW_BASE_CLASS =
  'pointer-events-none -mt-16 flex h-[212px] shrink-0 items-end justify-center px-1 sm:-mt-20 sm:h-[228px] lg:-mt-14 lg:h-[236px] xl:-mt-16 xl:h-[244px]';

/** Nudge artwork up without changing flex flow (card + heading stay put). */
const PILLAR_IMAGE_ART_SHIFT_CLASS =
  '-translate-y-4 sm:-translate-y-5 lg:-translate-y-5 xl:-translate-y-6';

type PillarLocaleId = 'first' | 'mission' | 'engineering';

type PillarBase = {
  readonly id: string;
  readonly localeId: PillarLocaleId;
  readonly bg: string;
  readonly image: {
    src: string;
    hideWhiteBg?: boolean;
  };
};

const PILLAR_BASE: readonly PillarBase[] = [
  {
    id: 'first-concept',
    localeId: 'first',
    bg: 'bg-[#dcc090]',
    image: {
      src: '/assets/about/first-concept.png',
      hideWhiteBg: true,
    },
  },
  {
    id: 'mission',
    localeId: 'mission',
    bg: 'bg-[#95c48a]',
    image: {
      src: '/assets/about/mission.png',
      hideWhiteBg: true,
    },
  },
  {
    id: 'engineering',
    localeId: 'engineering',
    bg: 'bg-[#cbcbcb]',
    image: {
      src: '/assets/about/engineering.png',
    },
  },
];

type Pillar = {
  readonly id: string;
  readonly title: ReactNode;
  readonly bg: string;
  readonly image: {
    src: string;
    alt: string;
    hideWhiteBg?: boolean;
  };
  readonly body: ReactNode;
};

/** Title scale — Armenian pillar cards. */
const PILLAR_TITLE_HY =
  'text-[22px] sm:text-[23px] lg:text-[24px] xl:text-[26px]';

/** Title scale — English (slightly larger than HY for Latin copy). */
const PILLAR_TITLE_EN =
  'text-[23px] sm:text-[24px] lg:text-[25px] xl:text-[28px]';

/** Body scale — Armenian pillar cards. */
const PILLAR_BODY_HY =
  'mt-2 space-y-[10px] text-[12px] sm:text-[12px] leading-[1.38] xl:space-y-[10px] xl:text-[12px] xl:leading-[17px]';

/** Body scale — English (slightly larger than HY). */
const PILLAR_BODY_EN =
  'mt-2 space-y-[11px] text-[13px] sm:text-[13px] leading-[1.38] xl:space-y-[11px] xl:text-[13px] xl:leading-[18px]';

function pillarImageRowMarginClass(lang: LanguageCode): string {
  if (lang === 'hy') {
    return 'mb-4 sm:mb-5 lg:mb-4 xl:mb-4';
  }

  return 'mb-2.5 sm:mb-3 lg:mb-2.5 xl:mb-3';
}

function pillarTitleClassName(lang: LanguageCode): string {
  const base =
    'shrink-0 text-center font-extrabold leading-tight tracking-[-0.02em] text-[#122a26] xl:leading-[1.08]';

  if (lang === 'hy') {
    return `${base} ${PILLAR_TITLE_HY}`;
  }

  if (lang === 'en') {
    return `${base} ${PILLAR_TITLE_EN}`;
  }

  return `${base} text-[20px] sm:text-[21px] lg:text-[22px] xl:text-[24px]`;
}

function pillarBodyClassName(lang: LanguageCode): string {
  const base =
    'flex-1 break-words font-bold tracking-[-0.01em] text-[#122a26] lg:mt-2.5 lg:space-y-[9px] xl:mt-3';

  if (lang === 'hy') {
    return `${base} ${PILLAR_BODY_HY}`;
  }

  if (lang === 'en') {
    return `${base} ${PILLAR_BODY_EN}`;
  }

  return `${base} mt-1.5 space-y-[9px] text-[11px] sm:text-[11px] leading-[1.36] xl:space-y-[9px] xl:text-[11px] xl:leading-[16px]`;
}

function PillarCard({
  pillar,
  className = '',
  lang,
}: {
  pillar: Pillar;
  className?: string;
  lang: LanguageCode;
}) {
  const imageClassName = pillar.image.hideWhiteBg
    ? 'object-contain object-bottom mix-blend-multiply'
    : 'object-contain object-bottom';

  return (
    <article
      className={`relative flex h-full flex-col pt-[88px] lg:pt-[72px] xl:pt-[80px] ${className}`}
    >
      <div
        className={`relative flex min-h-[600px] flex-1 flex-col rounded-[30px] pl-5 pr-7 pb-6 sm:min-h-[620px] sm:px-6 lg:min-h-[500px] lg:px-6 xl:min-h-[595px] xl:w-[392px] xl:rounded-[36px] xl:px-7 ${pillar.bg} pt-5 sm:pt-7 lg:pt-5 xl:pt-6`}
      >
        <div className={`${PILLAR_IMAGE_ROW_BASE_CLASS} ${pillarImageRowMarginClass(lang)}`}>
          <div
            className={`relative h-full w-full max-w-[min(100%,432px)] xl:max-w-[min(100%,388px)] ${PILLAR_IMAGE_ART_SHIFT_CLASS}`}
          >
            <Image
              src={pillar.image.src}
              alt={pillar.image.alt}
              fill
              sizes="(min-width: 1280px) 388px, (min-width: 1024px) 30vw, 92vw"
              className={imageClassName}
            />
          </div>
        </div>

        <h3 className={pillarTitleClassName(lang)}>{pillar.title}</h3>

        <div className={pillarBodyClassName(lang)}>{pillar.body}</div>
      </div>
    </article>
  );
}

/**
 * Three-up pillar cards — First Concept / Mission / Engineering.
 * Mirrors Figma node 6466:303 (1680 × 919 desktop block).
 */
export function AboutPillars() {
  const { t, lang } = useTranslation();
  const pillars = useMemo<Pillar[]>(
    () =>
      PILLAR_BASE.map((base) => ({
        id: base.id,
        bg: base.bg,
        image: {
          ...base.image,
          alt: t(`about.about.pillars.${base.localeId}.image_alt`),
        },
        title: renderPillarTitleLines(t(`about.about.pillars.${base.localeId}.title`)),
        body: (
          <>
            {renderAboutRichParagraphs(
              t(`about.about.pillars.${base.localeId}.body`),
              base.localeId,
            )}
          </>
        ),
      })),
    [t, lang],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const mobileScrollerRef = useRef<HTMLDivElement | null>(null);
  const mobileCardRefs = useRef<Array<HTMLDivElement | null>>([]);

  const scrollToCard = useCallback((index: number) => {
    const scroller = mobileScrollerRef.current;
    const target = mobileCardRefs.current[index];

    if (!scroller || !target) {
      return;
    }

    scroller.scrollTo({
      left: target.offsetLeft - 16,
      behavior: 'smooth',
    });
    setActiveIndex(index);
  }, []);

  const handleMobileScroll = useCallback(() => {
    const scroller = mobileScrollerRef.current;

    if (!scroller) {
      return;
    }

    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    mobileCardRefs.current.forEach((card, index) => {
      if (!card) {
        return;
      }

      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(cardCenter - center);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    if (nearestIndex !== activeIndex) {
      setActiveIndex(nearestIndex);
    }
  }, [activeIndex]);

  return (
    <section className="mt-16 lg:mt-[92px] xl:mt-[120px]">
      <div
        ref={mobileScrollerRef}
        onScroll={handleMobileScroll}
        className="-mx-4 overflow-x-auto px-4 pb-1 touch-pan-x overscroll-x-contain sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex snap-x snap-mandatory gap-6">
          {pillars.map((pillar, index) => (
            <div
              key={pillar.id}
              ref={(element) => {
                mobileCardRefs.current[index] = element;
              }}
              className="w-[82vw] min-w-[82vw] shrink-0 snap-center last:mr-3"
            >
              <PillarCard pillar={pillar} lang={lang} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 sm:hidden">
        {pillars.map((pillar, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => scrollToCard(index)}
              className={`h-[4px] w-[44px] rounded-full transition-colors ${
                isActive ? 'bg-[#122a26]' : 'bg-[#cbcbcb]'
              }`}
              aria-label={`Go to ${pillar.id}`}
            />
          );
        })}
      </div>

      <div className="hidden sm:grid sm:grid-cols-2 sm:items-stretch sm:gap-8 lg:grid-cols-3 lg:gap-8 xl:grid-cols-[repeat(3,max-content)] xl:items-start xl:justify-center xl:gap-12">
        {pillars.map((pillar) => (
          <PillarCard key={pillar.id} pillar={pillar} className="min-h-0" lang={lang} />
        ))}
      </div>
    </section>
  );
}
