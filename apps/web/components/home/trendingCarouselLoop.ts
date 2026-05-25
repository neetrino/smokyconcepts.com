import { TRENDING_TRACK_BUFFER_COPIES } from './trendingFeatured.constants';

/** Logical page index for a track slot (clone strip: 0 = last clone, 1…N = pages, N+1 = first clone). */
export function getTrendingDisplayIndexLogical(displayIndex: number, totalPages: number): number {
  if (totalPages <= 1) {
    return 0;
  }
  return ((displayIndex % totalPages) + totalPages) % totalPages;
}

export function getTrendingInitialDisplayIndex(totalPages: number): number {
  return totalPages > 1 ? totalPages : 0;
}

export function getTrendingMaxCloneDisplayIndex(totalPages: number): number {
  return totalPages > 1 ? totalPages * TRENDING_TRACK_BUFFER_COPIES - 1 : 0;
}

/** After animating onto a clone slot, snap to the matching real slot (no transition). */
export function normalizeTrendingCloneDisplayIndex(index: number, totalPages: number): number | null {
  if (totalPages <= 1) {
    return null;
  }
  if (index >= totalPages * 2) {
    return index - totalPages;
  }
  if (index < totalPages) {
    return index + totalPages;
  }
  return null;
}

export function getTrendingCoverflowDistance(
  slotLogicalIndex: number,
  focalLogicalIndex: number,
  totalPages: number
): number {
  if (totalPages <= 0) {
    return 0;
  }
  const raw = Math.abs(slotLogicalIndex - focalLogicalIndex);
  return Math.min(raw, totalPages - raw);
}

export function isTrendingTrackTransformEnd(event: TransitionEvent, track: HTMLElement): boolean {
  if (event.target !== track) {
    return false;
  }
  const property = event.propertyName;
  return property === 'transform' || property === '-webkit-transform';
}
