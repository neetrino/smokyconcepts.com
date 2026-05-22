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

/**
 * Horizontal scroll offset so ~half of the first strip card sits left of the viewport (peek hint).
 */
/** Clamped scrollLeft that aligns a page-start anchor with the strip viewport start. */
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
