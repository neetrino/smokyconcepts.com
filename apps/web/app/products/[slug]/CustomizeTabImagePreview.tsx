'use client';

import { CustomizeProductOverlay } from './CustomizeProductOverlay';

const PREVIEW_FRAME_MAX_WIDTH_CLASS = 'max-w-[200px] sm:max-w-[220px]';
const PREVIEW_IMAGE_MAX_HEIGHT_CLASS = 'max-h-[120px] sm:max-h-[132px]';

interface CustomizeTabImagePreviewProps {
  imageUrl: string;
  overlayHtml: string | null;
}

/** Live customize preview in the Customize tab (above font toolbar). */
export function CustomizeTabImagePreview({ imageUrl, overlayHtml }: CustomizeTabImagePreviewProps) {
  return (
    <div
      className={`relative mx-auto flex w-full items-center justify-center overflow-hidden rounded-md bg-[#f0f0f0] ${PREVIEW_FRAME_MAX_WIDTH_CLASS}`}
      aria-live="polite"
    >
      <img
        src={imageUrl}
        alt=""
        decoding="async"
        draggable={false}
        className={`block h-auto w-full ${PREVIEW_IMAGE_MAX_HEIGHT_CLASS} object-contain object-center`}
      />
      {overlayHtml ? (
        <CustomizeProductOverlay html={overlayHtml} position="top" variant="compact" />
      ) : null}
    </div>
  );
}
