/** Upper bound so deferred work still runs on pages that never go fully idle. */
const IDLE_TIMEOUT_MS = 2000;

/** Fallback delay for browsers without `requestIdleCallback` (Safari < 16.4). */
const IDLE_FALLBACK_DELAY_MS = 300;

/**
 * Defer non-critical browser work (prefetch/preload) until the main thread is idle,
 * so it never competes with the resources the current view actually renders.
 */
export function scheduleWhenIdle(task: () => void): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(task, { timeout: IDLE_TIMEOUT_MS });
    return;
  }

  window.setTimeout(task, IDLE_FALLBACK_DELAY_MS);
}
