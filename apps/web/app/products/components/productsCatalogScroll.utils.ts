import { getScrollLeftForElementWithin } from './catalogStripScroll';
import { CATALOG_SCROLL_TARGET_TOLERANCE_PX, CATALOG_STRIP_PEEK_MEDIA_QUERY } from './productsCatalogView.constants';

export function resolveSectionPageFromScrollAnchors(
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

/**
 * Horizontal scroll offset so ~half of the first strip card sits left of the viewport (mobile hint).
 */
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

export function resolveSectionPageFromDesktopScroll(
  container: HTMLDivElement,
  totalPages: number
): number {
  const maxScrollLeft = container.scrollWidth - container.clientWidth;
  const startLeft = getCatalogStripPeekStartScroll(container);
  const span = Math.max(0, maxScrollLeft - startLeft);
  const scrollLeft = container.scrollLeft;
  const adjustedLeft = Math.max(0, scrollLeft - startLeft);

  if (span <= 0 || totalPages <= 1) {
    return 0;
  }
  if (scrollLeft <= startLeft + CATALOG_SCROLL_TARGET_TOLERANCE_PX) {
    return 0;
  }
  if (scrollLeft >= maxScrollLeft - CATALOG_SCROLL_TARGET_TOLERANCE_PX) {
    return totalPages - 1;
  }
  return Math.round((adjustedLeft / span) * (totalPages - 1));
}
