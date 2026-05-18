const SIZE_MODAL_PANEL_TRANSITION =
  'transform transition-transform duration-[480ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform';

const SIZE_MODAL_BACKDROP_TRANSITION = 'transition-opacity duration-[380ms] ease-out';

const SIZE_MODAL_BLOCK_TRANSITION =
  'transition-[opacity,transform] duration-[420ms] ease-out';

export function sizeModalBackdropClass(isEntered: boolean): string {
  return `${SIZE_MODAL_BACKDROP_TRANSITION} ${isEntered ? 'opacity-100' : 'opacity-0'}`;
}

export function sizeModalPanelClass(isEntered: boolean): string {
  return `${SIZE_MODAL_PANEL_TRANSITION} ${isEntered ? 'translate-x-0' : 'translate-x-full'}`;
}

export function sizeModalBlockClass(isEntered: boolean, isExiting: boolean): string {
  const isVisible = isEntered && !isExiting;
  return `${SIZE_MODAL_BLOCK_TRANSITION} ${
    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[10px] opacity-0'
  }`;
}
