'use client';

import {
  CUSTOMIZE_ON_IMAGE_TEXT_CLASS,
  CUSTOMIZE_ON_IMAGE_TEXT_COMPACT_CLASS,
  CUSTOMIZE_OVERLAY_IMAGE_ANCHOR_CLASS,
  CUSTOMIZE_OVERLAY_IMAGE_TOP_ANCHOR_CLASS,
  CUSTOMIZE_OVERLAY_IMAGE_TOP_COMPACT_ANCHOR_CLASS,
} from './customize-product-overlay-styles';

export type CustomizeOverlayPosition = 'bottom' | 'top' | 'tab-pack-body';

export type CustomizeOverlayVariant = 'default' | 'compact';

interface CustomizeProductOverlayProps {
  html: string;
  position?: CustomizeOverlayPosition;
  variant?: CustomizeOverlayVariant;
}

export function CustomizeProductOverlay({
  html,
  position = 'bottom',
  variant = 'default',
}: CustomizeProductOverlayProps) {
  if (!html.trim()) {
    return null;
  }

  const isCompact = variant === 'compact';

  const anchorClass =
    position === 'top'
      ? isCompact
        ? CUSTOMIZE_OVERLAY_IMAGE_TOP_COMPACT_ANCHOR_CLASS
        : CUSTOMIZE_OVERLAY_IMAGE_TOP_ANCHOR_CLASS
      : CUSTOMIZE_OVERLAY_IMAGE_ANCHOR_CLASS;

  const textClass = isCompact ? CUSTOMIZE_ON_IMAGE_TEXT_COMPACT_CLASS : CUSTOMIZE_ON_IMAGE_TEXT_CLASS;

  return (
    <div className={anchorClass}>
      <div className={textClass} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
