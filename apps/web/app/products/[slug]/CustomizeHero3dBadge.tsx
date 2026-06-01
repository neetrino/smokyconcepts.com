'use client';

import type { CSSProperties } from 'react';
import {
  CUSTOMIZE_FIGMA_3D_BADGE,
  CUSTOMIZE_HERO_PREVIEW_ASSETS,
} from './customize-tab-preview.constants';

/** Figma node 1:8804 — SC crest on pack front (relative to group 1:8797). */
const LOGO_LEFT_RATIO = (773.533 - 747.016) / CUSTOMIZE_FIGMA_3D_BADGE.widthPx;
const LOGO_TOP_RATIO = (287.089 - 202) / CUSTOMIZE_FIGMA_3D_BADGE.heightPx;
const LOGO_WIDTH_RATIO = 15.32 / CUSTOMIZE_FIGMA_3D_BADGE.widthPx;
const LOGO_HEIGHT_RATIO = 19.28 / CUSTOMIZE_FIGMA_3D_BADGE.heightPx;

interface CustomizeHero3dBadgeProps {
  className?: string;
  style?: CSSProperties;
}

/**
 * Isometric product badge (Figma 1:8797) — transparent stack: pack + SC logo + lid lines.
 */
export function CustomizeHero3dBadge({ className, style }: CustomizeHero3dBadgeProps) {
  return (
    <div className={`relative ${className ?? ''}`} style={style} aria-hidden>
      <svg
        className="block h-auto w-full"
        viewBox="0 0 95 142"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(1.64 0)">
          <path d="M25.9689 0L88.9572 9.393L66.0272 20.1673L0 9.393L25.9689 0Z" fill="#000000" />
        </g>
        <g transform="translate(0 11.05)">
          <path
            d="M0 34.8093L68.5136 45.8599V128.354C68.5136 129.715 67.2952 130.753 65.9516 130.536L1.85819 120.199C0.787262 120.026 0 119.101 0 118.017V34.8093Z"
            fill="#731818"
          />
          <path
            d="M0 0L68.5136 11.0506V42.1597C68.5136 43.5207 67.2952 44.5584 65.9516 44.3416L1.85819 34.004C0.787262 33.8313 0 32.9068 0 31.8221V0Z"
            fill="#731818"
          />
          <path
            d="M91.7198 0L67.4086 11.0506V130.397L91.7198 119.346L91.7198 0Z"
            fill="#731818"
          />
        </g>
        <g transform="translate(66.84 50.02) rotate(-41.63)">
          <path d="M0.162 0.671L9.293 2.874" stroke="#FFFFFF" strokeWidth="1.38" />
        </g>
        <g transform="translate(70.16 43.1) rotate(-41.63)">
          <path d="M0.516 7.299L6.598 0.459" stroke="#FFFFFF" strokeWidth="1.38" />
        </g>
        <g transform="translate(72.35 23.21) rotate(-41.63)">
          <path d="M0.085 4.036L27.089 0.685" stroke="#FFFFFF" strokeWidth="1.38" />
        </g>
      </svg>
      <img
        src={CUSTOMIZE_HERO_PREVIEW_ASSETS.productLogoSrc}
        alt=""
        decoding="async"
        draggable={false}
        className="pointer-events-none absolute object-contain"
        style={{
          left: `${LOGO_LEFT_RATIO * 100}%`,
          top: `${LOGO_TOP_RATIO * 100}%`,
          width: `${LOGO_WIDTH_RATIO * 100}%`,
          height: `${LOGO_HEIGHT_RATIO * 100}%`,
        }}
      />
    </div>
  );
}
