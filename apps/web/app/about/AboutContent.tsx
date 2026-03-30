  'use client';

import Image from 'next/image';
import { TeamCarousel } from '../../components/TeamCarousel';
import { useTranslation } from '../../lib/i18n-client';

/**
 * Client content for About Us page (i18n + carousel).
 */
export function AboutContent() {
  const { t } = useTranslation();
  const isTeamSectionVisible = false;

  return (
    <div className="min-h-screen bg-white">
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden shadow-lg">
              <Image
                src="https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Our team working together"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
            <div className="space-y-6">
              <p className="text-sm md:text-base font-semibold uppercase tracking-wider text-[#7CB342]">
                {t('about.subtitle')}
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {t('about.title')}
              </h1>
              <div className="space-y-4 text-gray-600 text-base md:text-lg leading-relaxed">
                <p>{t('about.description.paragraph1')}</p>
                <p>{t('about.description.paragraph2')}</p>
                <p>{t('about.description.paragraph3')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isTeamSectionVisible ? (
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm md:text-base font-semibold uppercase tracking-wider text-[#7CB342] mb-4">
                {t('about.team.subtitle')}
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
                {t('about.team.title')}
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                {t('about.team.description')}
              </p>
            </div>
            <div className="max-w-6xl mx-auto">
              <TeamCarousel />
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
