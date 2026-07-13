'use client';

import Image from 'next/image';

import { HomeActionButton } from './HomeActionButton';
import { HomeSectionTitle } from './HomeSectionTitle';
import { HOME_ASSET_PATHS, RITUAL_STEPS } from './homePage.data';
import { useTranslation } from '@/lib/i18n-client';

const RITUAL_STEP_KEYS = ['apply', 'consultation', 'designAndMaterials', 'packagingAndDelivery'] as const;

export function HomeRitualSection() {
  const { t } = useTranslation();

  return (
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
                  {t(`home.homepage.ritual.steps.${RITUAL_STEP_KEYS[index]}.title`)}
                </h3>
                <p className="mt-0.5 text-xs font-normal leading-relaxed text-[#2a2a2a] sm:text-sm">
                  {t(`home.homepage.ritual.steps.${RITUAL_STEP_KEYS[index]}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-start sm:mt-6 lg:justify-center">
          <HomeActionButton href="/personalize" label={t('home.homepage.ritual.cta')} className="font-semibold" />
        </div>
      </div>
    </section>
  );
}
