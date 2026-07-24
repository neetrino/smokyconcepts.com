'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CATALOG_SECTION_PAGE_SIZE, type CatalogProduct } from '../catalogProductLabels';
import {
  getCatalogStripMaxScrollLeft,
  getCatalogStripPeekStartScroll,
  getCatalogStripScrollLeftForPage,
  scrollMobileStripToPageAnchor,
} from '../catalogStripScroll';
import {
  CATALOG_PRODUCTS_PAGE_MOBILE_CARDS_PER_PAGE,
  CATALOG_SCROLL_IDLE_UPDATE_DELAY_MS,
} from '../catalogProductCardMobilePresentation';
import { CATALOG_STRIP_PEEK_MEDIA_QUERY, SECTION_ORDER } from '../productsCatalogView.constants';
import {
  clearSectionScrollSettleTimers,
  waitForSectionScrollToSettle,
} from '../productsCatalogScrollSettle';
import { resolveSectionPageFromScrollAnchors } from '../productsCatalogScroll.utils';
import { CATALOG_SCROLL_TARGET_TOLERANCE_PX } from '../productsCatalogView.constants';
import type { CatalogSectionViewModel } from '../productsCatalogView.types';

interface UseProductsCatalogSectionScrollParams {
  isSmUp: boolean;
  cardsPerPage: number;
  sectionItemsByTitle: Record<string, CatalogProduct[]>;
  catalogStripSectionTitles: readonly string[];
  selectedCollection: string;
  selectedSectionTitle: string | null;
}

export function useProductsCatalogSectionScroll({
  isSmUp,
  cardsPerPage,
  sectionItemsByTitle,
  catalogStripSectionTitles,
  selectedCollection,
  selectedSectionTitle,
}: UseProductsCatalogSectionScrollParams) {
  const sectionScrollRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sectionPageStartRefs = useRef<Record<string, Array<HTMLDivElement | null>>>({});
  const sectionScrollIdleTimerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const sectionProgrammaticScrollRef = useRef<Record<string, boolean>>({});
  const sectionScrollSettleRafRef = useRef<Record<string, number | null>>({});
  const sectionScrollSettleTimerRef = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
  const [sectionPages, setSectionPages] = useState<Record<string, number>>({});

  useEffect(() => {
    setSectionPages((currentPages) => {
      let hasChanges = false;
      const nextPages: Record<string, number> = {};

      SECTION_ORDER.forEach((title) => {
        const items = sectionItemsByTitle[title] ?? [];
        if (items.length === 0) {
          return;
        }

        const totalPages = Math.max(1, Math.ceil(items.length / cardsPerPage));
        const normalizedPage = Math.min(currentPages[title] ?? 0, totalPages - 1);
        nextPages[title] = normalizedPage;

        if (currentPages[title] !== normalizedPage) {
          hasChanges = true;
        }
      });

      if (Object.keys(currentPages).length !== Object.keys(nextPages).length) {
        hasChanges = true;
      }

      return hasChanges ? nextPages : currentPages;
    });
  }, [cardsPerPage, sectionItemsByTitle]);

  const sections = useMemo((): CatalogSectionViewModel[] => {
    const orderedSectionTitles =
      selectedCollection !== 'all' && selectedSectionTitle
        ? [selectedSectionTitle]
        : SECTION_ORDER;

    return orderedSectionTitles
      .map((title) => {
        const items = sectionItemsByTitle[title] ?? [];
        if (items.length === 0) {
          return null;
        }

        const totalPages = Math.max(1, Math.ceil(items.length / cardsPerPage));
        const currentPage = Math.min(sectionPages[title] ?? 0, totalPages - 1);
        const startIndex = currentPage * cardsPerPage;

        return {
          title,
          items,
          totalPages,
          currentPage,
          pageItems: items.slice(startIndex, startIndex + cardsPerPage),
        };
      })
      .filter((section): section is CatalogSectionViewModel => Boolean(section));
  }, [cardsPerPage, sectionItemsByTitle, sectionPages, selectedCollection, selectedSectionTitle]);

  useEffect(() => {
    setSectionPages({});
    for (const title of catalogStripSectionTitles) {
      const element = sectionScrollRefs.current[title];
      if (element) {
        element.scrollLeft = 0;
      }
    }
  }, [cardsPerPage, catalogStripSectionTitles]);

  const applyStripPeekStartScroll = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    for (const title of catalogStripSectionTitles) {
      if ((sectionItemsByTitle[title]?.length ?? 0) === 0) {
        continue;
      }

      const element = sectionScrollRefs.current[title];
      if (!element) {
        continue;
      }

      if (!isSmUp || !window.matchMedia(CATALOG_STRIP_PEEK_MEDIA_QUERY).matches) {
        element.scrollLeft = 0;
        continue;
      }

      element.scrollLeft = getCatalogStripPeekStartScroll(element);
    }
  }, [catalogStripSectionTitles, isSmUp, sectionItemsByTitle]);

  useLayoutEffect(() => {
    applyStripPeekStartScroll();
    const frame = requestAnimationFrame(() => {
      applyStripPeekStartScroll();
    });
    return () => cancelAnimationFrame(frame);
  }, [applyStripPeekStartScroll]);

  useEffect(() => {
    window.addEventListener('resize', applyStripPeekStartScroll);
    return () => window.removeEventListener('resize', applyStripPeekStartScroll);
  }, [applyStripPeekStartScroll]);

  const scrollSettleRefs = {
    programmatic: sectionProgrammaticScrollRef.current,
    settleRaf: sectionScrollSettleRafRef.current,
    settleTimer: sectionScrollSettleTimerRef.current,
  };

  const handleSectionPageChange = (title: string, pageIndex: number) => {
    const container = sectionScrollRefs.current[title];
    if (container) {
      let targetScrollLeft = 0;

      const pageAnchors = sectionPageStartRefs.current[title] ?? [];
      const itemCount = sectionItemsByTitle[title]?.length ?? 0;
      const totalPages = Math.max(1, Math.ceil(itemCount / cardsPerPage));
      const isLastPage = totalPages > 1 && pageIndex >= totalPages - 1;

      if (!isSmUp) {
        targetScrollLeft = isLastPage
          ? getCatalogStripMaxScrollLeft(container)
          : scrollMobileStripToPageAnchor(container, pageAnchors[pageIndex]);
        if (isLastPage) {
          container.scrollTo({ left: targetScrollLeft, behavior: 'auto' });
        }
      } else {
        targetScrollLeft = getCatalogStripScrollLeftForPage(
          container,
          pageIndex,
          pageAnchors,
          totalPages
        );
      }

      sectionProgrammaticScrollRef.current[title] = true;

      const idleTimer = sectionScrollIdleTimerRef.current[title];
      if (idleTimer) {
        clearTimeout(idleTimer);
        delete sectionScrollIdleTimerRef.current[title];
      }

      if (isSmUp) {
        container.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth',
        });
      }

      waitForSectionScrollToSettle(title, container, targetScrollLeft, scrollSettleRefs);
    }

    setSectionPages((currentPages) => {
      if (currentPages[title] === pageIndex) {
        return currentPages;
      }
      return {
        ...currentPages,
        [title]: pageIndex,
      };
    });
  };

  const handleSectionScroll = (title: string) => {
    const container = sectionScrollRefs.current[title];
    const section = sections.find((item) => item.title === title);

    if (!container || !section || section.totalPages <= 1) {
      return;
    }

    if (sectionProgrammaticScrollRef.current[title]) {
      return;
    }

    const commitPage = (nextPage: number) => {
      setSectionPages((currentPages) => {
        if (currentPages[title] === nextPage) {
          return currentPages;
        }
        return {
          ...currentPages,
          [title]: nextPage,
        };
      });
    };

    if (!isSmUp) {
      const maxScrollLeft = getCatalogStripMaxScrollLeft(container);
      if (container.scrollLeft >= maxScrollLeft - CATALOG_SCROLL_TARGET_TOLERANCE_PX) {
        commitPage(section.totalPages - 1);
        return;
      }

      const idleTimer = sectionScrollIdleTimerRef.current[title];
      if (idleTimer) {
        clearTimeout(idleTimer);
      }

      sectionScrollIdleTimerRef.current[title] = setTimeout(() => {
        delete sectionScrollIdleTimerRef.current[title];
        if (sectionProgrammaticScrollRef.current[title]) {
          return;
        }
        const anchors = sectionPageStartRefs.current[title] ?? [];
        const nextPage = resolveSectionPageFromScrollAnchors(container, anchors);
        commitPage(nextPage);
      }, CATALOG_SCROLL_IDLE_UPDATE_DELAY_MS);
      return;
    }

    const maxScrollLeft = getCatalogStripMaxScrollLeft(container);
    if (container.scrollLeft >= maxScrollLeft - CATALOG_SCROLL_TARGET_TOLERANCE_PX) {
      commitPage(section.totalPages - 1);
      return;
    }

    const peekStart = getCatalogStripPeekStartScroll(container);
    if (container.scrollLeft <= peekStart + CATALOG_SCROLL_TARGET_TOLERANCE_PX) {
      commitPage(0);
      return;
    }

    const anchors = sectionPageStartRefs.current[title] ?? [];
    const nextPage = resolveSectionPageFromScrollAnchors(container, anchors);
    commitPage(Math.max(0, Math.min(section.totalPages - 1, nextPage)));
  };

  useEffect(() => {
    return () => {
      clearSectionScrollSettleTimers(
        sectionScrollIdleTimerRef.current,
        sectionScrollSettleRafRef.current,
        sectionScrollSettleTimerRef.current
      );
    };
  }, []);

  const registerSectionScrollRef = (title: string, element: HTMLDivElement | null) => {
    sectionScrollRefs.current[title] = element;
  };

  const registerSectionPageStartRef = (
    sectionTitle: string,
    pageIndex: number,
    element: HTMLDivElement | null
  ) => {
    if (!element) {
      return;
    }
    const pageAnchors = sectionPageStartRefs.current[sectionTitle] ?? [];
    pageAnchors[pageIndex] = element;
    sectionPageStartRefs.current[sectionTitle] = pageAnchors;
  };

  return {
    sections,
    handleSectionPageChange,
    handleSectionScroll,
    registerSectionScrollRef,
    registerSectionPageStartRef,
  };
}

export function useProductsCatalogCardsPerPage(isSmUp: boolean): number {
  return isSmUp ? CATALOG_SECTION_PAGE_SIZE : CATALOG_PRODUCTS_PAGE_MOBILE_CARDS_PER_PAGE;
}
