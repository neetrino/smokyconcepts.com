import {
  SIZE_MODAL_BACKDROP_ENTER_DURATION_MS,
  SIZE_MODAL_BACKDROP_EXIT_DELAY_MS,
  SIZE_MODAL_BACKDROP_EXIT_DURATION_MS,
  SIZE_MODAL_BLOCK_ENTER_DURATION_MS,
  SIZE_MODAL_CONTENT_ENTER_DURATION_MS,
  SIZE_MODAL_PANEL_ENTER_DURATION_MS,
  SIZE_MODAL_PANEL_EXIT_DELAY_MS,
  SIZE_MODAL_PANEL_EXIT_DURATION_MS,
} from './size-modal-animation.constants';

const SIZE_MODAL_PANEL_ENTER_TRANSITION = `transform transition-transform duration-[${SIZE_MODAL_PANEL_ENTER_DURATION_MS}ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform`;

const SIZE_MODAL_PANEL_EXIT_TRANSITION = `transform transition-transform duration-[${SIZE_MODAL_PANEL_EXIT_DURATION_MS}ms] delay-[${SIZE_MODAL_PANEL_EXIT_DELAY_MS}ms] ease-[cubic-bezier(0.4,0,1,1)] will-change-transform`;

const SIZE_MODAL_BACKDROP_ENTER_TRANSITION = `transition-opacity duration-[${SIZE_MODAL_BACKDROP_ENTER_DURATION_MS}ms] ease-out`;

const SIZE_MODAL_BACKDROP_EXIT_TRANSITION = `transition-opacity duration-[${SIZE_MODAL_BACKDROP_EXIT_DURATION_MS}ms] delay-[${SIZE_MODAL_BACKDROP_EXIT_DELAY_MS}ms] ease-in`;

const SIZE_MODAL_BLOCK_ENTER_TRANSITION = `transition-[opacity,transform] duration-[${SIZE_MODAL_BLOCK_ENTER_DURATION_MS}ms] ease-[cubic-bezier(0.22,1,0.36,1)]`;

const SIZE_MODAL_CONTENT_ENTER_TRANSITION = `transition-[opacity,transform] duration-[${SIZE_MODAL_CONTENT_ENTER_DURATION_MS}ms] ease-[cubic-bezier(0.22,1,0.36,1)]`;

/** Inner chrome stays visible during exit; only the panel shell animates out */
const SIZE_MODAL_INNER_VISIBLE_WHILE_EXITING = 'translate-y-0 opacity-100';

export interface SizeModalMotionState {
  isEntered: boolean;
  isExiting: boolean;
}

function pickTransition(isExiting: boolean, enter: string, exit: string): string {
  return isExiting ? exit : enter;
}

export function sizeModalBackdropClass({ isEntered, isExiting }: SizeModalMotionState): string {
  return `${pickTransition(
    isExiting,
    SIZE_MODAL_BACKDROP_ENTER_TRANSITION,
    SIZE_MODAL_BACKDROP_EXIT_TRANSITION
  )} ${isEntered ? 'opacity-100' : 'opacity-0'}`;
}

export function sizeModalPanelClass({ isEntered, isExiting }: SizeModalMotionState): string {
  return `${pickTransition(
    isExiting,
    SIZE_MODAL_PANEL_ENTER_TRANSITION,
    SIZE_MODAL_PANEL_EXIT_TRANSITION
  )} ${isEntered ? 'translate-x-0' : 'translate-x-full'}`;
}

export function sizeModalBlockClass({ isEntered, isExiting }: SizeModalMotionState): string {
  if (isExiting) {
    return SIZE_MODAL_INNER_VISIBLE_WHILE_EXITING;
  }
  return `${SIZE_MODAL_BLOCK_ENTER_TRANSITION} ${
    isEntered ? 'translate-y-0 opacity-100' : 'translate-y-[10px] opacity-0'
  }`;
}

export function sizeModalContentClass({ isEntered, isExiting }: SizeModalMotionState): string {
  if (isExiting) {
    return SIZE_MODAL_INNER_VISIBLE_WHILE_EXITING;
  }
  return `${SIZE_MODAL_CONTENT_ENTER_TRANSITION} ${
    isEntered ? 'translate-y-0 opacity-100' : 'translate-y-[8px] opacity-0'
  }`;
}

/** Enter stagger on open; no exit stagger — panel slide handles close. */
export function sizeModalBlockTransitionDelay(
  enterDelayMs: number,
  _exitDelayMs: number,
  { isEntered, isExiting }: SizeModalMotionState
): string {
  if (isExiting || !isEntered) {
    return '0ms';
  }
  return `${enterDelayMs}ms`;
}
