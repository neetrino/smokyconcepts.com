const WINDOW_SCROLL_TOP: ScrollToOptions = {
  top: 0,
  left: 0,
  behavior: 'auto',
};

/**
 * Resets document scroll. Covers `window`, `html`, `body`, and `main`
 * (iOS Safari + `overflow-x-hidden` on the storefront shell).
 */
export function scrollWindowToTop(): void {
  window.scrollTo(WINDOW_SCROLL_TOP);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  document.querySelector('main')?.scrollTo(WINDOW_SCROLL_TOP);
}
