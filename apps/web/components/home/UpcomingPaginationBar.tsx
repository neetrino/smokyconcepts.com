'use client';

import {
  CATALOG_PRODUCTS_PAGE_PAGINATION_WRAPPER_CLASS_NAME,
  CATALOG_STRIP_PAGINATION_DOT_CLASS_NAME,
  CATALOG_STRIP_PAGINATION_ROW_CLASS_NAME,
} from '../../app/products/components/catalogProductCardMobilePresentation';
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
      <div className={CATALOG_PRODUCTS_PAGE_PAGINATION_WRAPPER_CLASS_NAME} aria-hidden="true">
        <span className={`${CATALOG_STRIP_PAGINATION_DOT_CLASS_NAME} bg-[#122a26]`} />
      </div>
    );
  }

  return (
    <div className={CATALOG_PRODUCTS_PAGE_PAGINATION_WRAPPER_CLASS_NAME}>
      <div
        className={CATALOG_STRIP_PAGINATION_ROW_CLASS_NAME}
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
              className={`${CATALOG_STRIP_PAGINATION_DOT_CLASS_NAME} ${
                isActive ? 'bg-[#122a26]' : 'bg-[#d9d9d9] [@media(hover:hover)]:hover:bg-[#c9c9c9]'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
