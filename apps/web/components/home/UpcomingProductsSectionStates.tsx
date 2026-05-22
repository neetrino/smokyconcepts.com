'use client';

import { UpcomingSectionHeader } from './UpcomingSectionHeader';
import { useTranslation } from '@/lib/i18n-client';

interface UpcomingProductsErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function UpcomingProductsErrorState({ error, onRetry }: UpcomingProductsErrorStateProps) {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-8">
      <UpcomingSectionHeader />
      <div className="flex items-center justify-center gap-4 py-8">
        <p className="text-[#414141]">
          {error === 'load_error' ? t('home.homepage.upcoming.loadError') : error}
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

export function UpcomingProductsLoadingState() {
  return (
    <section className="flex flex-col gap-8">
      <UpcomingSectionHeader />
      <div className="grid grid-cols-2 gap-4 pb-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-3xl bg-white/60" />
        ))}
      </div>
    </section>
  );
}

export function UpcomingProductsEmptyState() {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-8">
      <UpcomingSectionHeader />
      <p className="py-6 text-center text-[#9d9d9d]">{t('home.homepage.upcoming.noUpcoming')}</p>
    </section>
  );
}
