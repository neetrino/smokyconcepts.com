import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` on the client (runs before paint, so hydrated state never flashes),
 * `useEffect` during SSR to avoid React's server-render warning.
 */
export const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;
