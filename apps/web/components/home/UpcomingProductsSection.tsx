'use client';

import { UpcomingPaginationBar } from './UpcomingPaginationBar';
import { UpcomingProductStrip } from './UpcomingProductStrip';
import {
  UpcomingProductsEmptyState,
  UpcomingProductsErrorState,
  UpcomingProductsLoadingState,
} from './UpcomingProductsSectionStates';
import { UpcomingSectionHeader } from './UpcomingSectionHeader';
import {
  UPCOMING_CARDS_PER_PAGE_MOBILE,
  UPCOMING_CARDS_PER_PAGE_SM_UP,
  UPCOMING_SCROLL_CONTAINER_CLASS_NAME,
} from './upcomingProducts.constants';
import { useUpcomingProducts } from './useUpcomingProducts';
import { useUpcomingScrollPagination } from './useUpcomingScrollPagination';
import { useUpcomingSmViewport } from './useUpcomingSmViewport';

/**
 * Home page "Upcoming" section: shows products marked as upcoming from the API.
 */
export function UpcomingProductsSection() {
  const isSmUp = useUpcomingSmViewport();
  const { items, loading, error, fetchUpcoming, fetchGeneration } = useUpcomingProducts();
  const cardsPerPage = isSmUp ? UPCOMING_CARDS_PER_PAGE_SM_UP : UPCOMING_CARDS_PER_PAGE_MOBILE;

  const pagination = useUpcomingScrollPagination({
    itemCount: items.length,
    cardsPerPage,
    isSmUp,
    fetchGeneration,
  });

  if (error) {
    return <UpcomingProductsErrorState error={error} onRetry={fetchUpcoming} />;
  }

  if (loading) {
    return <UpcomingProductsLoadingState />;
  }

  if (items.length === 0) {
    return <UpcomingProductsEmptyState />;
  }

  return (
    <section className="relative isolate flex flex-col gap-4 sm:gap-5 xl:mr-[calc(50%_-_50vw)] xl:overflow-x-clip">
      <UpcomingSectionHeader />
      <div
        ref={pagination.scrollContainerRef}
        onScroll={pagination.handleScroll}
        className={UPCOMING_SCROLL_CONTAINER_CLASS_NAME}
      >
        <UpcomingProductStrip
          items={items}
          cardsPerPage={cardsPerPage}
          isSmUp={isSmUp}
          safePage={pagination.safePage}
          isPageTransitioning={pagination.isPageTransitioning}
          pageDirection={pagination.pageDirection}
          pageStartRefs={pagination.pageStartRefs}
        />
      </div>
      <UpcomingPaginationBar
        totalPages={pagination.totalPages}
        safePage={pagination.safePage}
        visiblePaginationPages={pagination.visiblePaginationPages}
        onPageChange={pagination.handlePageChange}
      />
    </section>
  );
}
