'use client';

import { CATALOG_MOBILE_PAGINATION_ROW_CLASS_NAME } from '../../app/products/components/catalogProductCardMobilePresentation';
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
      <div
        className="relative z-20 mt-4 flex justify-center px-5 max-sm:mt-10 sm:mt-6"
        aria-hidden="true"
      >
        <span className="h-2 w-[6.25rem] shrink-0 rounded-full bg-[#122a26]" />
      </div>
    );
  }

  return (
    <div className="relative z-20 mt-4 flex justify-center px-5 max-sm:mt-10 sm:mt-6 sm:mt-8">
      <div
        className={`${CATALOG_MOBILE_PAGINATION_ROW_CLASS_NAME} sm:max-w-none sm:justify-center sm:gap-4`}
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
              className={`h-2 min-w-[1.25rem] shrink rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#122a26] focus-visible:ring-offset-2 max-sm:h-1.5 max-sm:flex-1 max-sm:active:bg-[#c9c9c9] sm:w-[6.25rem] sm:flex-none ${
                isActive ? 'bg-[#122a26]' : 'bg-[#d9d9d9] [@media(hover:hover)]:hover:bg-[#c9c9c9]'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
