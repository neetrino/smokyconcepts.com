'use client';

import type { ReactNode } from 'react';
import Link, { useLinkStatus } from 'next/link';

interface AdminNavLinkProps {
  href: string;
  className: string;
  children: ReactNode;
  /** Runs on click, e.g. to close the mobile drawer. */
  onNavigate?: () => void;
}

/** Spinner rendered only while the clicked admin route is still in flight. */
function AdminNavPendingIndicator() {
  const { pending } = useLinkStatus();

  if (!pending) {
    return null;
  }

  return (
    <span
      role="status"
      aria-label="Loading"
      className="h-3.5 w-3.5 flex-shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
    />
  );
}

/**
 * Admin navigation entry.
 *
 * Uses `next/link` (instead of `router.push`) so Next.js prefetches the target
 * route's RSC payload and JS chunk before the click, and shows a pending
 * spinner while the navigation completes.
 */
export function AdminNavLink({ href, className, children, onNavigate }: AdminNavLinkProps) {
  return (
    <Link href={href} prefetch className={className} onClick={onNavigate}>
      {children}
      <AdminNavPendingIndicator />
    </Link>
  );
}
