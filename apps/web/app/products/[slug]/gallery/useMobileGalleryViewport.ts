import { useSyncExternalStore } from 'react';
import { MOBILE_GALLERY_MEDIA_QUERY } from './galleryCarousel.constants';

function subscribeMobileGallery(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const mediaQuery = window.matchMedia(MOBILE_GALLERY_MEDIA_QUERY);
  mediaQuery.addEventListener('change', onStoreChange);
  return () => mediaQuery.removeEventListener('change', onStoreChange);
}

function getMobileGallerySnapshot(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_GALLERY_MEDIA_QUERY).matches;
}

function getServerMobileGallerySnapshot(): boolean {
  return true;
}

/** True below Tailwind `lg` — mobile/tablet gallery slide behavior. */
export function useMobileGalleryViewport(): boolean {
  return useSyncExternalStore(
    subscribeMobileGallery,
    getMobileGallerySnapshot,
    getServerMobileGallerySnapshot,
  );
}
