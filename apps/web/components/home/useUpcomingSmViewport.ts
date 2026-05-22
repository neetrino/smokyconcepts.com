import { useSyncExternalStore } from 'react';

import { CATALOG_PRODUCT_CARD_SM_VIEWPORT_QUERY } from '../../app/products/components/catalogProductCardMobilePresentation';

function subscribeUpcomingSmViewport(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const mq = window.matchMedia(CATALOG_PRODUCT_CARD_SM_VIEWPORT_QUERY);
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function getUpcomingSmViewportSnapshot(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(CATALOG_PRODUCT_CARD_SM_VIEWPORT_QUERY).matches;
}

/** SSR: assume mobile pagination (2 per step) to avoid layout jump on narrow clients. */
function getServerUpcomingSmViewportSnapshot(): boolean {
  return false;
}

export function useUpcomingSmViewport(): boolean {
  return useSyncExternalStore(
    subscribeUpcomingSmViewport,
    getUpcomingSmViewportSnapshot,
    getServerUpcomingSmViewportSnapshot,
  );
}
