import { GlassPageSpinner } from './GlassPageSpinner';

interface PageLoadingCenterProps {
  /** Optional accessible label; defaults to a generic loading status. */
  label?: string;
  /** Extra classes for the outer wrapper. */
  className?: string;
}

/**
 * Centered in-page glass spinner for route/page loading states
 * (no fixed duration — parent unmounts when ready).
 */
export function PageLoadingCenter({
  label = 'Loading',
  className = 'mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center px-4 py-12',
}: PageLoadingCenterProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className={className}
    >
      <span className="sr-only">{label}</span>
      <GlassPageSpinner />
    </div>
  );
}
