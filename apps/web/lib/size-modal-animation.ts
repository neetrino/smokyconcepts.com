import {
  SIZE_MODAL_BACKDROP_EXIT_DELAY_MS,
  SIZE_MODAL_BACKDROP_EXIT_DURATION_MS,
  SIZE_MODAL_PANEL_EXIT_DELAY_MS,
  SIZE_MODAL_PANEL_EXIT_DURATION_MS,
} from './size-modal-animation.constants';

/** Exit transitions — static literals so Tailwind JIT includes them (see tailwind `content` + safelist). */
const SIZE_MODAL_PANEL_EXIT_CLASS =
  'transform transition-transform duration-[420ms] delay-[0ms] ease-[cubic-bezier(0.4,0,1,1)] will-change-transform';

const SIZE_MODAL_BACKDROP_EXIT_CLASS =
  'transition-opacity duration-[320ms] delay-[48ms] ease-in';

/** Inner chrome stays visible during exit; only the panel shell animates out */
const SIZE_MODAL_INNER_VISIBLE_WHILE_EXITING = 'translate-y-0 opacity-100';

export interface SizeModalMotionState {
  isEntered: boolean;
  isExiting: boolean;
  /** When true, skip enter keyframes (prefers-reduced-motion). */
  skipEnterAnimation?: boolean;
}

export function sizeModalBackdropClass({
  isEntered,
  isExiting,
  skipEnterAnimation,
}: SizeModalMotionState): string {
  if (isExiting) {
    return `${SIZE_MODAL_BACKDROP_EXIT_CLASS} opacity-0`;
  }
  if (!isEntered) {
    return 'opacity-0';
  }
  if (skipEnterAnimation) {
    return 'opacity-100';
  }
  return 'animate-size-modal-backdrop-in opacity-100';
}

export function sizeModalPanelClass({
  isEntered,
  isExiting,
  skipEnterAnimation,
}: SizeModalMotionState): string {
  if (isExiting) {
    return `${SIZE_MODAL_PANEL_EXIT_CLASS} translate-x-full`;
  }
  if (!isEntered) {
    return 'translate-x-full';
  }
  if (skipEnterAnimation) {
    return 'translate-x-0';
  }
  return 'animate-size-modal-panel-in';
}

export function sizeModalBlockClass({
  isEntered,
  isExiting,
  skipEnterAnimation,
}: SizeModalMotionState): string {
  if (isExiting) {
    return SIZE_MODAL_INNER_VISIBLE_WHILE_EXITING;
  }
  if (!isEntered) {
    return 'translate-y-[10px] opacity-0';
  }
  if (skipEnterAnimation) {
    return 'translate-y-0 opacity-100';
  }
  return 'animate-size-modal-block-in';
}

export function sizeModalContentClass({
  isEntered,
  isExiting,
  skipEnterAnimation,
}: SizeModalMotionState): string {
  if (isExiting) {
    return SIZE_MODAL_INNER_VISIBLE_WHILE_EXITING;
  }
  if (!isEntered) {
    return 'translate-y-[8px] opacity-0';
  }
  if (skipEnterAnimation) {
    return 'translate-y-0 opacity-100';
  }
  return 'animate-size-modal-block-in';
}

/** Enter stagger on open (`animation-delay`); no exit stagger — panel slide handles close. */
export function sizeModalBlockEnterStyle(
  enterDelayMs: number,
  { isEntered, isExiting }: SizeModalMotionState
): { animationDelay: string } | undefined {
  if (isExiting || !isEntered) {
    return undefined;
  }
  return { animationDelay: `${enterDelayMs}ms` };
}

/** Sync check — exit timer must cover the longest exit transition. */
export const SIZE_MODAL_PANEL_EXIT_MS =
  SIZE_MODAL_PANEL_EXIT_DELAY_MS + SIZE_MODAL_PANEL_EXIT_DURATION_MS;

export const SIZE_MODAL_BACKDROP_EXIT_MS =
  SIZE_MODAL_BACKDROP_EXIT_DELAY_MS + SIZE_MODAL_BACKDROP_EXIT_DURATION_MS;
