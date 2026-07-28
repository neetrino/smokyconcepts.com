/** Matches Tailwind `max-lg` so strip peek scroll stays in sync with card breakpoints. */
export const CATALOG_STRIP_PEEK_MEDIA_QUERY = '(max-width: 1023px)';

/** Tolerance (px) when matching live scrollLeft to the target page anchor. */
export const CATALOG_SCROLL_TARGET_TOLERANCE_PX = 2;

/** Scroll offset of `element` within `container` (works when `offsetParent` chain differs). */
export function getScrollLeftForElementWithin(container: HTMLElement, element: HTMLElement): number {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  return container.scrollLeft + (elementRect.left - containerRect.left);
}

export function resolveStripPageFromScrollAnchors(
  container: HTMLDivElement,
  pageStartAnchors: Array<HTMLDivElement | null | undefined>
): number {
  const scrollLeft = container.scrollLeft;
  let bestPage = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let pageIndex = 0; pageIndex < pageStartAnchors.length; pageIndex += 1) {
    const anchor = pageStartAnchors[pageIndex];
    if (!anchor) {
      continue;
    }
    const anchorScrollLeft = getScrollLeftForElementWithin(container, anchor);
    const distance = Math.abs(scrollLeft - anchorScrollLeft);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestPage = pageIndex;
    }
  }

  return bestPage;
}

/** Fraction of viewport width from scroll origin used as the active-page pivot (2-up mobile strips). */
const MOBILE_STRIP_PAGE_PIVOT_VIEWPORT_RATIO = 0.2;

/**
 * Mobile horizontal strip — map scroll position to a page index (0-based).
 * Uses the last page-start at or before a leading-edge pivot (works when two cards are visible).
 */
export function resolveMobileStripPageFromScroll(
  container: HTMLDivElement,
  pageStartAnchors: Array<HTMLDivElement | null | undefined>,
  totalPages: number
): number {
  if (totalPages <= 1) {
    return 0;
  }

  const maxScrollLeft = getCatalogStripMaxScrollLeft(container);
  const scrollLeft = container.scrollLeft;

  if (scrollLeft >= maxScrollLeft - CATALOG_SCROLL_TARGET_TOLERANCE_PX) {
    return totalPages - 1;
  }

  let anchorCount = 0;
  let activePage = 0;
  const pivot = scrollLeft + container.clientWidth * MOBILE_STRIP_PAGE_PIVOT_VIEWPORT_RATIO;

  for (let pageIndex = 0; pageIndex < pageStartAnchors.length; pageIndex += 1) {
    const anchor = pageStartAnchors[pageIndex];
    if (!anchor) {
      continue;
    }
    anchorCount += 1;
    const anchorScrollLeft = getScrollLeftForElementWithin(container, anchor);
    if (anchorScrollLeft <= pivot + CATALOG_SCROLL_TARGET_TOLERANCE_PX) {
      activePage = pageIndex;
    }
  }

  if (anchorCount > 0) {
    return Math.min(activePage, totalPages - 1);
  }

  if (maxScrollLeft <= 0) {
    return 0;
  }

  return Math.min(totalPages - 1, Math.round((scrollLeft / maxScrollLeft) * (totalPages - 1)));
}

/**
 * Horizontal scroll offset so ~half of the first strip card sits left of the viewport (peek hint).
 */
/** Clamped scrollLeft that aligns a page-start anchor with the strip viewport start. */
export function getCatalogStripMaxScrollLeft(container: HTMLElement): number {
  return Math.max(0, container.scrollWidth - container.clientWidth);
}

export function getClampedMobileStripScrollTarget(
  container: HTMLElement,
  anchor: HTMLElement
): number {
  const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
  return Math.min(Math.max(0, getScrollLeftForElementWithin(container, anchor)), maxScrollLeft);
}

/**
 * Scroll a snap-enabled horizontal strip to a mobile page anchor.
 * Instant scroll avoids `scroll-snap` fighting `behavior: 'smooth'` on pagination taps.
 */
export function scrollMobileStripToPageAnchor(
  container: HTMLElement,
  anchor: HTMLElement | null | undefined
): number {
  if (!anchor) {
    container.scrollTo({ left: 0, behavior: 'auto' });
    return 0;
  }

  const targetScrollLeft = getClampedMobileStripScrollTarget(container, anchor);
  anchor.scrollIntoView({ behavior: 'auto', inline: 'start', block: 'nearest' });

  if (Math.abs(container.scrollLeft - targetScrollLeft) > CATALOG_SCROLL_TARGET_TOLERANCE_PX) {
    container.scrollTo({ left: targetScrollLeft, behavior: 'auto' });
  }

  return targetScrollLeft;
}

/**
 * Scroll target for a catalog/upcoming strip page (page 0 respects max-lg peek).
 * Last page scrolls to the strip end so the final cards align flush on the right.
 */
export function getCatalogStripScrollLeftForPage(
  container: HTMLElement,
  pageIndex: number,
  pageStartAnchors: Array<HTMLElement | null | undefined>,
  totalPages?: number
): number {
  const maxScrollLeft = getCatalogStripMaxScrollLeft(container);

  if (totalPages !== undefined && totalPages > 1 && pageIndex >= totalPages - 1) {
    return maxScrollLeft;
  }

  if (pageIndex <= 0) {
    return getCatalogStripPeekStartScroll(container);
  }

  const anchor = pageStartAnchors[pageIndex];
  if (!anchor) {
    return maxScrollLeft;
  }

  return getClampedMobileStripScrollTarget(container, anchor);
}

export function getCatalogStripPeekStartScroll(container: HTMLElement): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  if (!window.matchMedia(CATALOG_STRIP_PEEK_MEDIA_QUERY).matches) {
    return 0;
  }

  const first = container.querySelector<HTMLElement>('[data-catalog-strip-card]');
  if (!first) {
    return 0;
  }

  const halfCard = Math.round(first.offsetWidth / 2);
  const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);

  return Math.min(halfCard, maxScroll);
}

/** Page 0 scroll: mobile flush start, sm–lg peek offset when the peek media query matches. */
export function applyCatalogStripPageZeroScroll(container: HTMLElement, isSmUp: boolean): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  if (!isSmUp || !window.matchMedia(CATALOG_STRIP_PEEK_MEDIA_QUERY).matches) {
    container.scrollLeft = 0;
    return 0;
  }

  const peekStart = getCatalogStripPeekStartScroll(container);
  container.scrollLeft = peekStart;
  return peekStart;
}

/** Re-apply a remembered scrollLeft after layout thrash (clamped to the live max). */
export function restoreCatalogStripScrollLeft(
  container: HTMLElement,
  savedLeft: number,
  tolerancePx: number = CATALOG_SCROLL_TARGET_TOLERANCE_PX
): void {
  const maxScrollLeft = getCatalogStripMaxScrollLeft(container);
  const clampedLeft = Math.min(Math.max(0, savedLeft), maxScrollLeft);
  if (Math.abs(container.scrollLeft - clampedLeft) > tolerancePx) {
    container.scrollLeft = clampedLeft;
  }
}

/**
 * Mobile URL-bar show/hide fires `resize` with height-only change. Call `onHeightOnlyResize`
 * for those; `onWidthChange` only when `innerWidth` actually changes.
 */
export function subscribeCatalogStripViewportResize(handlers: {
  onHeightOnlyResize: () => void;
  onWidthChange: () => void;
}): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let lastWidth = window.innerWidth;

  const handleResize = () => {
    const nextWidth = window.innerWidth;
    if (lastWidth === nextWidth) {
      requestAnimationFrame(handlers.onHeightOnlyResize);
      return;
    }
    lastWidth = nextWidth;
    handlers.onWidthChange();
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}
