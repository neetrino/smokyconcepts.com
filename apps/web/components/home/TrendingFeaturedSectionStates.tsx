'use client';

import { HomeActionButton } from './HomeActionButton';
import { HomeSectionTitle } from './HomeSectionTitle';
import { useTranslation } from '@/lib/i18n-client';

interface TrendingFeaturedErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function TrendingFeaturedErrorState({ error, onRetry }: TrendingFeaturedErrorStateProps) {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-8">
      <HomeSectionTitle title={t('home.homepage.trending.title')} centered={false} />
      <div className="flex items-center justify-center gap-4 py-8">
        <p className="text-[#414141]">
          {error === 'load_error' ? t('home.homepage.trending.loadError') : error}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border-2 border-[#122a26] px-4 py-2 text-sm font-medium text-[#122a26] hover:bg-[#122a26]/5"
        >
          {t('home.homepage.common.retry')}
        </button>
      </div>
    </section>
  );
}

export function TrendingFeaturedLoadingState() {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-8 overflow-x-hidden">
      <div className="flex items-center justify-between gap-6">
        <HomeSectionTitle title={t('home.homepage.trending.title')} centered={false} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-80 w-full animate-pulse rounded-3xl bg-white/60" />
        ))}
      </div>
    </section>
  );
}

export function TrendingFeaturedEmptyState() {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-6">
        <HomeSectionTitle title={t('home.homepage.trending.title')} centered={false} />
        <HomeActionButton
          href="/products"
          label={t('home.homepage.trending.buyCta')}
          variant="outline"
          className="hidden sm:inline-flex"
        />
      </div>
      <p className="py-6 text-center text-[#9d9d9d]">{t('home.homepage.trending.noFeatured')}</p>
    </section>
  );
}
