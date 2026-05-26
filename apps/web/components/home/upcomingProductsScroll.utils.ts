import {
  getCatalogStripMaxScrollLeft,
  getCatalogStripPeekStartScroll,
  getCatalogStripScrollLeftForPage,
  resolveMobileStripPageFromScroll,
} from '../../app/products/components/catalogStripScroll';
import { UPCOMING_SCROLL_TARGET_TOLERANCE_PX } from './upcomingProducts.constants';

/**
 * Mobile/sm+ pagination tabs — always one tab per page; dot widths flex to fit one row on narrow viewports.
 */
export function getUpcomingVisiblePageNumbers(totalPages: number): number[] {
  return Array.from({ length: totalPages }, (_, i) => i + 1);
}

/** Scroll offset of `element` within `container` (works when `offsetLeft` chain differs). */
export function getScrollLeftForElementWithin(container: HTMLDivElement, element: HTMLElement): number {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  return container.scrollLeft + (elementRect.left - containerRect.left);
}

/** Mobile upcoming strip — 1-based page index from scroll position. */
export function resolveUpcomingPageFromMobileAnchors(
  container: HTMLDivElement,
  pageStartAnchors: Array<HTMLDivElement | null | undefined>,
  totalPages: number,
): number {
  if (totalPages <= 1) {
    return 1;
  }

  if (container.scrollLeft >= getCatalogStripMaxScrollLeft(container) - UPCOMING_SCROLL_TARGET_TOLERANCE_PX) {
    return totalPages;
  }

  return resolveMobileStripPageFromScroll(container, pageStartAnchors, totalPages) + 1;
}

export function resolveUpcomingPageFromProportionalScroll(
  container: HTMLDivElement,
  totalPages: number,
): number {
  if (totalPages <= 1) {
    return 1;
  }

  const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
  if (maxScrollLeft <= 0) {
    return 1;
  }

  const scrollLeft = container.scrollLeft;

  if (scrollLeft <= UPCOMING_SCROLL_TARGET_TOLERANCE_PX) {
    return 1;
  }
  if (scrollLeft >= maxScrollLeft - UPCOMING_SCROLL_TARGET_TOLERANCE_PX) {
    return totalPages;
  }

  const pageIndex = Math.round((scrollLeft / maxScrollLeft) * (totalPages - 1));
  return Math.min(totalPages, Math.max(1, pageIndex + 1));
}

export function getUpcomingProportionalScrollLeft(
  container: HTMLDivElement,
  page: number,
  totalPages: number,
): number {
  const pageIndex = Math.max(0, Math.min(totalPages - 1, page - 1));
  const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
  if (maxScrollLeft <= 0 || totalPages <= 1) {
    return 0;
  }

  const denominator = Math.max(1, totalPages - 1);
  return Math.min(maxScrollLeft, (maxScrollLeft * pageIndex) / denominator);
}

export function getUpcomingScrollLeftForPage(
  container: HTMLDivElement,
  page: number,
  totalPages: number,
  isSmUp: boolean,
  pageStartAnchors: Array<HTMLDivElement | null | undefined>,
): number {
  const pageIndex = Math.max(0, Math.min(totalPages - 1, page - 1));

  if (isSmUp) {
    const anchorTarget = getCatalogStripScrollLeftForPage(
      container,
      pageIndex,
      pageStartAnchors,
      totalPages
    );
    if (pageStartAnchors[pageIndex]) {
      return anchorTarget;
    }
    return getUpcomingProportionalScrollLeft(container, page, totalPages);
  }

  const anchor = pageStartAnchors[pageIndex];
  if (!anchor) {
    return 0;
  }

  const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
  return Math.min(getScrollLeftForElementWithin(container, anchor), maxScrollLeft);
}

/** Resolves active page from strip scroll (peek-aware page 1, anchors for later pages). */
export function resolveUpcomingPageFromStripScroll(
  container: HTMLDivElement,
  pageStartAnchors: Array<HTMLDivElement | null | undefined>,
  totalPages: number,
): number {
  if (totalPages <= 1) {
    return 1;
  }

  const peekStart = getCatalogStripPeekStartScroll(container);
  if (container.scrollLeft <= peekStart + UPCOMING_SCROLL_TARGET_TOLERANCE_PX) {
    return 1;
  }

  return resolveUpcomingPageFromMobileAnchors(container, pageStartAnchors, totalPages);
}
