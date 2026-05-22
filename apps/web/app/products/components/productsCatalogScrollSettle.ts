import {
  CATALOG_SCROLL_SETTLE_MAX_WAIT_MS,
  CATALOG_SCROLL_SETTLE_STABLE_FRAMES,
  CATALOG_SCROLL_TARGET_TOLERANCE_PX,
} from './productsCatalogView.constants';

interface ScrollSettleRefs {
  programmatic: Record<string, boolean>;
  settleRaf: Record<string, number | null>;
  settleTimer: Record<string, ReturnType<typeof setTimeout> | null>;
}

export function waitForSectionScrollToSettle(
  title: string,
  container: HTMLDivElement,
  targetScrollLeft: number,
  refs: ScrollSettleRefs
): void {
  const existingRaf = refs.settleRaf[title];
  if (existingRaf !== null && existingRaf !== undefined) {
    cancelAnimationFrame(existingRaf);
    refs.settleRaf[title] = null;
  }
  const existingTimer = refs.settleTimer[title];
  if (existingTimer) {
    clearTimeout(existingTimer);
    refs.settleTimer[title] = null;
  }

  let previousScrollLeft = container.scrollLeft;
  let stableFrames = 0;

  const releaseFlag = () => {
    refs.programmatic[title] = false;
    const rafId = refs.settleRaf[title];
    if (rafId !== null && rafId !== undefined) {
      cancelAnimationFrame(rafId);
      refs.settleRaf[title] = null;
    }
    const timerId = refs.settleTimer[title];
    if (timerId) {
      clearTimeout(timerId);
      refs.settleTimer[title] = null;
    }
  };

  const tick = () => {
    const current = container.scrollLeft;
    const movedTooLittle = Math.abs(current - previousScrollLeft) < 0.5;
    const reachedTarget = Math.abs(current - targetScrollLeft) <= CATALOG_SCROLL_TARGET_TOLERANCE_PX;

    if (movedTooLittle || reachedTarget) {
      stableFrames += 1;
    } else {
      stableFrames = 0;
    }
    previousScrollLeft = current;

    if (stableFrames >= CATALOG_SCROLL_SETTLE_STABLE_FRAMES) {
      releaseFlag();
      return;
    }
    refs.settleRaf[title] = requestAnimationFrame(tick);
  };

  refs.settleRaf[title] = requestAnimationFrame(tick);
  refs.settleTimer[title] = setTimeout(releaseFlag, CATALOG_SCROLL_SETTLE_MAX_WAIT_MS);
}

export function clearSectionScrollSettleTimers(
  idleTimers: Record<string, ReturnType<typeof setTimeout>>,
  settleRaf: Record<string, number | null>,
  settleTimer: Record<string, ReturnType<typeof setTimeout> | null>
): void {
  for (const timer of Object.values(idleTimers)) {
    clearTimeout(timer);
  }
  for (const key of Object.keys(settleRaf)) {
    const rafId = settleRaf[key];
    if (rafId !== null && rafId !== undefined) {
      cancelAnimationFrame(rafId);
    }
  }
  for (const key of Object.keys(settleTimer)) {
    const timerId = settleTimer[key];
    if (timerId) {
      clearTimeout(timerId);
    }
  }
}
