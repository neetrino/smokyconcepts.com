'use client';

import type { ReactNode } from 'react';

interface MobileGalleryThumbnailTrackProps {
  startIndex: number;
  thumbStepPx: number;
  children: ReactNode;
}

const THUMBNAIL_TRACK_TRANSITION_CLASSES =
  'flex min-h-0 flex-nowrap items-center gap-2 transition-transform duration-300 ease-out sm:gap-3';

/** Mobile thumbnail row — slides so the leading thumb exits and the next enters from the edge. */
export function MobileGalleryThumbnailTrack({
  startIndex,
  thumbStepPx,
  children,
}: MobileGalleryThumbnailTrackProps) {
  return (
    <div
      className={THUMBNAIL_TRACK_TRANSITION_CLASSES}
      style={{ transform: `translateX(-${startIndex * thumbStepPx}px)` }}
    >
      {children}
    </div>
  );
}
