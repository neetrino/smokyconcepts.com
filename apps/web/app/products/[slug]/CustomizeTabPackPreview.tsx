'use client';

import type { CSSProperties } from 'react';
import {
  CUSTOMIZE_FIGMA_PREVIEW,
  CUSTOMIZE_HERO_PREVIEW_BODY_CLASS,
  CUSTOMIZE_HERO_PREVIEW_FRAME_CLASS,
  CUSTOMIZE_HERO_PREVIEW_FRAME_STYLE,
  CUSTOMIZE_HERO_PREVIEW_INNER_STYLE,
  CUSTOMIZE_HERO_PREVIEW_TEXT_CLASS,
  CUSTOMIZE_HERO_PREVIEW_TEXT_STYLE,
  CUSTOMIZE_HERO_PREVIEW_WIDTH_RATIO,
} from './customize-tab-preview.constants';

interface CustomizeHeroPreviewProps {
  overlayHtml: string;
}

const PREVIEW_CONTAINER_STYLE: CSSProperties = {
  containerType: 'inline-size',
  aspectRatio: `${CUSTOMIZE_FIGMA_PREVIEW.width} / ${CUSTOMIZE_FIGMA_PREVIEW.height}`,
};

/**
 * Live customize hero preview (Figma 1:8769 / 1:8810): dashed frame, #111 body, white text.
 * Centered in the fixed gallery hero frame so the white card size stays stable.
 */
export function CustomizeHeroPreview({ overlayHtml }: CustomizeHeroPreviewProps) {
  if (!overlayHtml.trim()) {
    return null;
  }

  return (
    <div
      className="absolute left-1/2 top-1/2 max-w-[450px] -translate-x-1/2 -translate-y-1/2"
      style={{
        width: `${CUSTOMIZE_HERO_PREVIEW_WIDTH_RATIO * 100}%`,
      }}
      aria-live="polite"
    >
      <div className="relative w-full" style={PREVIEW_CONTAINER_STYLE}>
        <div className={CUSTOMIZE_HERO_PREVIEW_FRAME_CLASS} style={CUSTOMIZE_HERO_PREVIEW_FRAME_STYLE} aria-hidden />
        <div className={CUSTOMIZE_HERO_PREVIEW_BODY_CLASS} style={CUSTOMIZE_HERO_PREVIEW_INNER_STYLE}>
          <div
            className={CUSTOMIZE_HERO_PREVIEW_TEXT_CLASS}
            style={CUSTOMIZE_HERO_PREVIEW_TEXT_STYLE}
            dangerouslySetInnerHTML={{ __html: overlayHtml }}
          />
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use {@link CustomizeHeroPreview} */
export const CustomizePackPreview = CustomizeHeroPreview;

/** @deprecated Use {@link CustomizeHeroPreview} */
export const CustomizeTabPackPreview = CustomizeHeroPreview;
