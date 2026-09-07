/**
 * True when pathname is a product detail route: `/products/:slug` (not `/products`).
 */
export function isProductDetailPathname(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  return segments[0] === 'products' && segments.length >= 2 && Boolean(segments[1]);
}

/**
 * Show glass loading only when navigating into a PDP (slow Neon SSR).
 */
export function shouldShowProductDetailNavigationLoading(
  anchor: HTMLAnchorElement,
  event: MouseEvent,
  currentPathname: string
): boolean {
  if (event.defaultPrevented) {
    return false;
  }
  if (event.button !== 0) {
    return false;
  }
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }
  if (anchor.target && anchor.target !== '_self') {
    return false;
  }
  if (anchor.hasAttribute('download')) {
    return false;
  }
  if (anchor.hasAttribute('data-no-navigation-loading')) {
    return false;
  }

  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return false;
  }

  let nextUrl: URL;
  try {
    nextUrl = new URL(href, window.location.href);
  } catch {
    return false;
  }

  if (nextUrl.origin !== window.location.origin) {
    return false;
  }

  if (!isProductDetailPathname(nextUrl.pathname)) {
    return false;
  }

  return nextUrl.pathname !== currentPathname;
}
