import { useSyncExternalStore } from 'react';

import { XL_MEDIA_QUERY } from './trendingFeatured.constants';

function subscribeXlMediaQuery(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const mq = window.matchMedia(XL_MEDIA_QUERY);
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function getXlMediaQuerySnapshot(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia(XL_MEDIA_QUERY).matches;
}

function getServerXlMediaQuerySnapshot(): boolean {
  return false;
}

export function useTrendingXlBreakpoint(): boolean {
  return useSyncExternalStore(subscribeXlMediaQuery, getXlMediaQuerySnapshot, getServerXlMediaQuerySnapshot);
}
