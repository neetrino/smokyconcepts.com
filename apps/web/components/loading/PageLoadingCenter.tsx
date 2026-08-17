'use client';

import { PageLoadingOverlay } from './PageLoadingOverlay';

/** Keeps main tall enough that Footer stays below the fold under a fixed overlay. */
const LOADING_LAYOUT_SPACER_CLASS = 'min-h-[calc(100dvh-12rem)] w-full';

interface PageLoadingCenterProps {
  /** Optional accessible label; defaults to a generic loading status. */
  label?: string;
  /**
   * When false, only the overlay is rendered (caller supplies layout height,
   * e.g. a page skeleton). Defaults to true.
   */
  reserveLayoutSpace?: boolean;
}

/**
 * Full-screen glass loading overlay — same popup style as navigation loading.
 * Name kept for call-site compatibility (replaces the old in-page spinner).
 */
export function PageLoadingCenter({
  label = 'Loading',
  reserveLayoutSpace = true,
}: PageLoadingCenterProps) {
  return (
    <>
      {reserveLayoutSpace ? <div className={LOADING_LAYOUT_SPACER_CLASS} aria-hidden /> : null}
      <PageLoadingOverlay visible label={label} />
    </>
  );
}
