'use client';

import { useTranslation } from '@/lib/i18n-client';

interface UpcomingPaginationBarProps {
  totalPages: number;
  safePage: number;
  visiblePaginationPages: number[];
  onPageChange: (page: number) => void;
}

export function UpcomingPaginationBar({
  totalPages,
  safePage,
  visiblePaginationPages,
  onPageChange,
}: UpcomingPaginationBarProps) {
  const { t } = useTranslation();

  if (totalPages === 1) {
    return (
      <div className="mt-1 flex items-center justify-center sm:mt-2" aria-hidden="true">
        <span className="h-1.5 w-[100px] shrink-0 rounded-[12px] bg-[#122a26] sm:h-2" />
      </div>
    );
  }

  return (
    <div
      className="mt-1 flex w-full max-w-[calc(100vw-2.5rem)] flex-nowrap items-center justify-center gap-1.5 sm:mt-2 sm:max-w-none sm:flex-wrap sm:gap-4"
      role="tablist"
      aria-label={t('home.homepage.upcoming.paginationAria')}
    >
      {visiblePaginationPages.map((page) => {
        const isActive = page === safePage;
        return (
          <button
            key={page}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`${t('home.homepage.upcoming.pageAriaPrefix')} ${page}`}
            onClick={() => onPageChange(page)}
            className={`h-1.5 min-w-[1.25rem] flex-1 rounded-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#122a26] focus-visible:ring-offset-2 max-sm:active:bg-[#c9c9c9] sm:h-2 sm:w-[100px] sm:flex-none ${
              isActive ? 'bg-[#122a26]' : 'bg-[#d9d9d9] [@media(hover:hover)]:hover:bg-[#c9c9c9]'
            }`}
          />
        );
      })}
    </div>
  );
}
