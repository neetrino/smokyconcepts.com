'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { useTranslation } from '@/lib/i18n-client';

type ShieldLocaleId = 'shield' | 'sc' | 'crown';

type ShieldBase = {
  readonly id: string;
  readonly localeId: ShieldLocaleId;
  readonly icon: string;
};

const SHIELD_BASE: readonly ShieldBase[] = [
  { id: 'shield', localeId: 'shield', icon: '/assets/about/shield-1.svg' },
  { id: 's-c', localeId: 'sc', icon: '/assets/about/shield-2.svg' },
  { id: 'crown', localeId: 'crown', icon: '/assets/about/shield-3.svg' },
];

type Shield = {
  readonly id: string;
  readonly icon: string;
  readonly tag: string;
  readonly title: string;
  readonly body: string;
};

function ShieldCard({ shield }: { shield: Shield }) {
  return (
    <article className="flex flex-col items-center text-center text-[#414141]">
      <div className="relative h-[116px] w-[108px] lg:h-[128px] lg:w-[118px]">
        <Image src={shield.icon} alt="" fill className="object-contain" />
      </div>
      <p className="mt-4 text-[26px] font-extrabold leading-[1.1] sm:text-[30px] lg:text-[36px]">
        <span className="font-medium">[</span>
        <span>{` ${shield.tag} `}</span>
        <span className="font-medium">]</span>
      </p>
      <p className="text-[20px] font-extrabold leading-[1.1] sm:text-[22px] lg:text-[27px]">
        {shield.title}
      </p>
      <p className="mt-4 max-w-[380px] text-[13px] font-bold leading-[22px] sm:text-[14px] lg:text-[15px] lg:font-semibold lg:leading-[23px]">
        {shield.body}
      </p>
    </article>
  );
}

/**
 * "The Mark" — three shields explaining the logo philosophy.
 * Mirrors Figma node 6466:320.
 */
export function AboutMark() {
  const { t } = useTranslation();
  const shields = useMemo<Shield[]>(
    () =>
      SHIELD_BASE.map((base) => ({
        id: base.id,
        icon: base.icon,
        tag: t(`about.about.mark.${base.localeId}_tag`),
        title: t(`about.about.mark.${base.localeId}_title`),
        body: t(`about.about.mark.${base.localeId}_body`),
      })),
    [t],
  );

  return (
    <section className="mx-auto mt-16 max-w-[1500px] text-center text-[#414141] lg:mt-[110px]">
      <h2 className="text-[22px] font-extrabold sm:text-[26px] lg:text-[30px]">
        {t('about.about.mark.title')}
      </h2>
      <p className="mt-2 text-[13px] font-bold leading-[22px] sm:text-[15px] lg:text-[15px] lg:font-semibold lg:leading-[23px]">
        {t('about.about.mark.subtitle')}
      </p>

      <div className="mt-7 h-px w-full bg-[#cbcbcb] lg:mt-7" />

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-8 lg:grid-cols-3 lg:gap-6">
        {shields.map((shield) => (
          <ShieldCard key={shield.id} shield={shield} />
        ))}
      </div>
    </section>
  );
}
