import { ChevronLeft, ChevronRight } from 'lucide-react';

import { TRACK_EASING, TRACK_TRANSITION_MS } from './trendingFeatured.constants';
import type { TrendingPageSliderProps } from './trendingFeatured.types';

/** Bottom slider tab: prev | current (large) | next, flanked by chevron arrows. Mirrors Figma. */
export function TrendingPageSlider({
  prevLabel,
  currentLabel,
  nextLabel,
  onPrev,
  onNext,
  disabled,
  prevAria,
  nextAria,
}: TrendingPageSliderProps) {
  const sideLabelBase =
    'truncate text-base font-extrabold leading-none text-[#122a26]/50 sm:text-xl xl:text-[1.5rem]';

  return (
    <div className="relative z-20 mx-auto grid w-full max-w-[34rem] grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 sm:max-w-[44rem] sm:gap-5 xl:flex xl:max-w-none xl:justify-center xl:gap-72">
      <button
        type="button"
        onClick={onPrev}
        disabled={disabled}
        className="col-start-1 row-start-1 flex h-10 w-10 items-center justify-center justify-self-start text-[#122a26] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 xl:-translate-y-16"
        aria-label={prevAria}
      >
        <ChevronLeft className="h-8 w-8" strokeWidth={2.5} />
      </button>
      {/* Mobile-only label strip: on xl labels live under each cluster inside the coverflow. */}
      <div className="col-start-2 row-start-1 flex w-full items-end justify-center gap-3 sm:justify-around sm:gap-6 xl:hidden">
        <span className={`hidden sm:inline ${sideLabelBase}`}>{prevLabel}</span>
        <span
          key={currentLabel}
          className="trending-current-label truncate text-2xl font-black leading-none text-[#122a26] sm:text-[1.75rem]"
          style={{
            animation: `trending-label-pop ${TRACK_TRANSITION_MS}ms ${TRACK_EASING}`,
          }}
        >
          {currentLabel && currentLabel !== 'Featured' ? currentLabel : '—'}
        </span>
        <span className={`hidden sm:inline ${sideLabelBase}`}>{nextLabel}</span>
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="col-start-3 row-start-1 flex h-10 w-10 items-center justify-center justify-self-end text-[#122a26] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 xl:-translate-y-16"
        aria-label={nextAria}
      >
        <ChevronRight className="h-8 w-8" strokeWidth={2.5} />
      </button>
    </div>
  );
}
