'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { useTranslation } from '@/lib/i18n-client';

type NextCard = {
  readonly id: string;
  readonly bg: string;
  readonly icon: string;
  readonly tag: string;
  readonly bodyKey: string;
};

const NEXT_CARDS: readonly NextCard[] = [
  {
    id: 'now',
    bg: 'bg-[#414141]',
    icon: '/assets/about/icon-now.svg',
    tag: 'NOW',
    bodyKey: 'about.about.next.card_now_body',
  },
  {
    id: 'expanding',
    bg: 'bg-[#b79c75]',
    icon: '/assets/about/icon-expanding.svg',
    tag: 'EXPANDING',
    bodyKey: 'about.about.next.card_expanding_body',
  },
  {
    id: 'next',
    bg: 'bg-[#2a574f]',
    icon: '/assets/about/icon-next.svg',
    tag: 'NEXT',
    bodyKey: 'about.about.next.card_next_body',
  },
  {
    id: 'always',
    bg: 'bg-[#122a26]',
    icon: '/assets/about/icon-always.svg',
    tag: 'ALWAYS',
    bodyKey: 'about.about.next.card_always_body',
  },
];

const INTRO_KEYS = [
  'about.about.next.intro_1',
  'about.about.next.intro_2',
  'about.about.next.intro_3',
] as const;

type NextTileCard = NextCard & { readonly body: string };

function NextTile({ card }: { card: NextTileCard }) {
  return (
    <article
      className={`relative ${card.bg} flex h-[182px] flex-col justify-end rounded-[18px] p-3 text-white sm:h-[298px] sm:rounded-[30px] sm:p-5 lg:h-[344px] lg:rounded-[34px] lg:p-6`}
    >
      <div className="absolute right-3 top-3 h-[34px] w-[34px] sm:right-5 sm:top-5 sm:h-[110px] sm:w-[110px] lg:h-[133px] lg:w-[133px]">
        <Image src={card.icon} alt="" fill className="object-contain" />
      </div>
      <p className="text-[22px] font-extrabold tracking-[0.08em] sm:text-[18px] lg:text-[21px]">
        {card.tag}
      </p>
      <p className="mt-1 max-w-[150px] text-[11px] font-semibold leading-[15px] sm:mt-1.5 sm:max-w-[280px] sm:text-[14px] sm:leading-[19px] lg:text-[16px] lg:leading-[22px]">
        {card.body}
      </p>
    </article>
  );
}

/**
 * "What Comes Next" intro + four tiles.
 * Mirrors Figma node 6466:346.
 */
export function AboutNext() {
  const { t } = useTranslation();
  const introParagraphs = useMemo(() => INTRO_KEYS.map((key) => t(key)), [t]);
  const nextCards = useMemo<NextTileCard[]>(
    () => NEXT_CARDS.map((card) => ({ ...card, body: t(card.bodyKey) })),
    [t],
  );

  return (
    <section className="mt-16 text-[#414141] lg:mt-[110px]">
      <div className="mx-auto max-w-[1260px] text-left lg:text-center">
        <h2 className="text-left text-[22px] font-extrabold tracking-[-0.02em] sm:text-[24px] lg:text-[30px] lg:text-center">
          {t('about.about.next.title')}
        </h2>
        <div className="mt-3 flex max-w-[1180px] flex-col gap-px text-left text-[12px] font-bold leading-[19px] tracking-[-0.01em] sm:mt-5 sm:gap-1 sm:text-[14px] sm:leading-[20px] lg:mx-auto lg:mt-6 lg:gap-1 lg:text-center lg:text-[15px] lg:font-semibold lg:leading-[22px]">
          {introParagraphs.map((paragraph) => (
            <p key={paragraph} className="m-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-6 grid max-w-[1260px] grid-cols-2 gap-3 sm:mt-7 sm:gap-4 lg:mt-9 lg:grid-cols-4 lg:gap-6">
        {nextCards.map((card) => (
          <NextTile key={card.id} card={card} />
        ))}
      </div>

      <div className="mx-auto mt-6 max-w-[1260px] space-y-1 text-left text-[12px] font-bold leading-[20px] sm:mt-7 sm:space-y-1.5 sm:text-[15px] sm:leading-[23px] lg:mt-8 lg:text-center lg:text-[15px] lg:font-semibold lg:leading-[23px]">
        <p>{t('about.about.next.footer_1')}</p>
        <p>{t('about.about.next.footer_2')}</p>
      </div>
    </section>
  );
}
