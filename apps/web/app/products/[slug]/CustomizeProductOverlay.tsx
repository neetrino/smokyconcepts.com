'use client';

import {
  CUSTOMIZE_ON_IMAGE_TEXT_CLASS,
  CUSTOMIZE_OVERLAY_IMAGE_ANCHOR_CLASS,
} from './customize-product-overlay-styles';

interface CustomizeProductOverlayProps {
  html: string;
}

export function CustomizeProductOverlay({ html }: CustomizeProductOverlayProps) {
  if (!html.trim()) {
    return null;
  }
  return (
    <div className={CUSTOMIZE_OVERLAY_IMAGE_ANCHOR_CLASS}>
      <div className={CUSTOMIZE_ON_IMAGE_TEXT_CLASS} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
