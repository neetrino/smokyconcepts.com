/**
 * Returns true when an anchor click should show route navigation loading
 * (same-origin, different pathname, left-click without modifiers).
 */
export function shouldShowNavigationLoadingForAnchor(
  anchor: HTMLAnchorElement,
  event: MouseEvent,
  currentPathname: string,
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
  // Opt out for in-page actions that use <Link> + preventDefault (e.g. order modal).
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

  return nextUrl.pathname !== currentPathname;
}
