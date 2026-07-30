'use client';

import { PageLoadingOverlay } from './PageLoadingOverlay';

interface PageLoadingCenterProps {
  /** Optional accessible label; defaults to a generic loading status. */
  label?: string;
}

/**
 * Full-screen glass loading overlay — same popup style as navigation loading.
 * Name kept for call-site compatibility (replaces the old in-page spinner).
 */
export function PageLoadingCenter({ label = 'Loading' }: PageLoadingCenterProps) {
  return <PageLoadingOverlay visible label={label} />;
}
