import { useCallback, useEffect, useRef, useState } from 'react';

import { scrollMobileStripToPageAnchor } from '../../app/products/components/catalogStripScroll';
import {
  CATALOG_MOBILE_STRIP_PROGRAMMATIC_SCROLL_RELEASE_MS,
  getCatalogMobileStripScrollGutterClassName,
} from '../../app/products/components/catalogProductCardMobilePresentation';
import {
  UPCOMING_SCROLL_IDLE_UPDATE_DELAY_MS,
  UPCOMING_SCROLL_SETTLE_MAX_WAIT_MS,
  UPCOMING_SCROLL_SETTLE_STABLE_FRAMES,
  UPCOMING_SCROLL_TARGET_TOLERANCE_PX,
} from './upcomingProducts.constants';
import {
  getUpcomingScrollLeftForPage,
  getUpcomingVisiblePageNumbers,
  resolveUpcomingPageFromMobileAnchors,
  resolveUpcomingPageFromStripScroll,
} from './upcomingProductsScroll.utils';

interface UseUpcomingScrollPaginationOptions {
  itemCount: number;
  cardsPerPage: number;
  isSmUp: boolean;
  fetchGeneration: number;
}

export function useUpcomingScrollPagination({
  itemCount,
  cardsPerPage,
  isSmUp,
  fetchGeneration,
}: UseUpcomingScrollPaginationOptions) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const pageStartRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const scrollIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollEndCleanupRef = useRef<(() => void) | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const programmaticScrollRafRef = useRef<number | null>(null);
  const programmaticScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.max(1, Math.ceil(itemCount / cardsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const visiblePaginationPages = getUpcomingVisiblePageNumbers(totalPages);
  const stripScrollOffsetClassName = getCatalogMobileStripScrollGutterClassName();

  useEffect(() => {
    pageStartRefs.current = [];
    setCurrentPage(1);
    scrollContainerRef.current?.scrollTo({ left: 0 });
  }, [isSmUp, itemCount, cardsPerPage, fetchGeneration]);

  useEffect(() => {
    return () => {
      if (scrollIdleTimerRef.current) {
        clearTimeout(scrollIdleTimerRef.current);
      }
      if (scrollEndCleanupRef.current) {
        scrollEndCleanupRef.current();
      }
      if (programmaticScrollTimerRef.current) {
        clearTimeout(programmaticScrollTimerRef.current);
      }
      if (programmaticScrollRafRef.current !== null) {
        cancelAnimationFrame(programmaticScrollRafRef.current);
      }
    };
  }, []);

  const waitForScrollToSettle = useCallback((container: HTMLDivElement, targetScrollLeft: number) => {
    if (programmaticScrollRafRef.current !== null) {
      cancelAnimationFrame(programmaticScrollRafRef.current);
      programmaticScrollRafRef.current = null;
    }
    if (programmaticScrollTimerRef.current) {
      clearTimeout(programmaticScrollTimerRef.current);
      programmaticScrollTimerRef.current = null;
    }

    let previousScrollLeft = container.scrollLeft;
    let stableFrames = 0;

    const releaseFlag = () => {
      isProgrammaticScrollRef.current = false;
      if (programmaticScrollRafRef.current !== null) {
        cancelAnimationFrame(programmaticScrollRafRef.current);
        programmaticScrollRafRef.current = null;
      }
      if (programmaticScrollTimerRef.current) {
        clearTimeout(programmaticScrollTimerRef.current);
        programmaticScrollTimerRef.current = null;
      }
    };

    const tick = () => {
      const current = container.scrollLeft;
      const movedTooLittle = Math.abs(current - previousScrollLeft) < 0.5;
      const reachedTarget = Math.abs(current - targetScrollLeft) <= UPCOMING_SCROLL_TARGET_TOLERANCE_PX;

      if (movedTooLittle || reachedTarget) {
        stableFrames += 1;
      } else {
        stableFrames = 0;
      }
      previousScrollLeft = current;

      if (stableFrames >= UPCOMING_SCROLL_SETTLE_STABLE_FRAMES) {
        releaseFlag();
        return;
      }
      programmaticScrollRafRef.current = requestAnimationFrame(tick);
    };

    programmaticScrollRafRef.current = requestAnimationFrame(tick);
    programmaticScrollTimerRef.current = setTimeout(releaseFlag, UPCOMING_SCROLL_SETTLE_MAX_WAIT_MS);
  }, []);

  const resolvePageFromScrollLeft = useCallback(
    (container: HTMLDivElement) => {
      if (!isSmUp) {
        return resolveUpcomingPageFromMobileAnchors(container, pageStartRefs.current, totalPages);
      }
      return resolveUpcomingPageFromStripScroll(container, pageStartRefs.current, totalPages);
    },
    [isSmUp, totalPages],
  );

  const commitPageFromScroll = useCallback(
    (container: HTMLDivElement) => {
      const nextPage = resolvePageFromScrollLeft(container);
      setCurrentPage((current) => (current === nextPage ? current : nextPage));
    },
    [resolvePageFromScrollLeft],
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    scrollEndCleanupRef.current?.();
    scrollEndCleanupRef.current = null;

    if (!container || isSmUp || totalPages <= 1) {
      return undefined;
    }

    const onScrollEnd = () => {
      if (isProgrammaticScrollRef.current) {
        return;
      }
      commitPageFromScroll(container);
    };

    container.addEventListener('scrollend', onScrollEnd, { passive: true });
    scrollEndCleanupRef.current = () => {
      container.removeEventListener('scrollend', onScrollEnd);
    };

    return () => {
      scrollEndCleanupRef.current?.();
      scrollEndCleanupRef.current = null;
    };
  }, [commitPageFromScroll, isSmUp, totalPages, itemCount, cardsPerPage, fetchGeneration]);

  const handlePageChange = useCallback(
    (page: number) => {
      const container = scrollContainerRef.current;
      const clampedPage = Math.max(1, Math.min(totalPages, page));

      if (!container) {
        setCurrentPage(clampedPage);
        return;
      }

      const pageIndex = Math.max(0, Math.min(totalPages - 1, clampedPage - 1));

      isProgrammaticScrollRef.current = true;
      setCurrentPage(clampedPage);

      if (scrollIdleTimerRef.current) {
        clearTimeout(scrollIdleTimerRef.current);
        scrollIdleTimerRef.current = null;
      }

      if (!isSmUp) {
        scrollMobileStripToPageAnchor(container, pageStartRefs.current[pageIndex]);
        window.setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, CATALOG_MOBILE_STRIP_PROGRAMMATIC_SCROLL_RELEASE_MS);
        return;
      }

      const targetScrollLeft = getUpcomingScrollLeftForPage(
        container,
        clampedPage,
        totalPages,
        isSmUp,
        pageStartRefs.current
      );
      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth',
      });

      waitForScrollToSettle(container, targetScrollLeft);
    },
    [isSmUp, safePage, totalPages, waitForScrollToSettle],
  );

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || totalPages <= 1) {
      return;
    }

    if (!isSmUp) {
      if (scrollIdleTimerRef.current) {
        clearTimeout(scrollIdleTimerRef.current);
      }

      scrollIdleTimerRef.current = setTimeout(() => {
        if (isProgrammaticScrollRef.current) {
          return;
        }
        commitPageFromScroll(container);
      }, UPCOMING_SCROLL_IDLE_UPDATE_DELAY_MS);
      return;
    }

    if (isProgrammaticScrollRef.current) {
      return;
    }

    const commitPage = (nextPage: number) => {
      setCurrentPage((current) => (current === nextPage ? current : nextPage));
    };

    if (scrollIdleTimerRef.current) {
      clearTimeout(scrollIdleTimerRef.current);
    }

    scrollIdleTimerRef.current = setTimeout(() => {
      if (isProgrammaticScrollRef.current) {
        return;
      }

      commitPage(resolvePageFromScrollLeft(container));
    }, UPCOMING_SCROLL_IDLE_UPDATE_DELAY_MS);
  }, [commitPageFromScroll, isSmUp, resolvePageFromScrollLeft, totalPages]);

  return {
    scrollContainerRef,
    pageStartRefs,
    safePage,
    totalPages,
    visiblePaginationPages,
    stripScrollOffsetClassName,
    handlePageChange,
    handleScroll,
  };
}
