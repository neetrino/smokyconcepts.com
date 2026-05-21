'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';

import {
  type CatalogProductHeroStripLayout,
  getCatalogProductCardStructuralOverflowAboveCardPx,
  getCatalogProductHeroViewportBand,
  getCompactHeroDrawableHeightPx,
  measureCatalogProductHeroFrameSize,
  resolveCatalogProductCardHeroDisplayScale,
} from './catalogProductCardHeroTopCap';
import {
  CATALOG_PRODUCTS_PAGE_HERO_SLOT_HEIGHT_RATIO,
  CATALOG_PRODUCTS_PAGE_HERO_SLOT_WIDTH_RATIO,
  PRODUCT_CARD_HERO_SLOT_HEIGHT_RATIO,
  PRODUCT_CARD_HERO_SLOT_WIDTH_RATIO,
} from './catalogProductCardImageSlot';
import {
  CATALOG_PRODUCT_CARD_HERO_NORMALIZED_SLOT_HEIGHT_RATIO,
  CATALOG_PRODUCTS_PAGE_HERO_NORMALIZED_SLOT_HEIGHT_RATIO,
} from './catalogProductCardHeroScale';
import { CATALOG_PRODUCT_CARD_HERO_MAX_TOP_OVERFLOW_PX } from './catalogProductCardHeroBoundary';

interface NaturalImageSize {
  width: number;
  height: number;
}

interface FrameSize {
  width: number;
  height: number;
}

export interface UseCatalogProductHeroScaleParams {
  enabled: boolean;
  targetScale: number;
  isSmUp: boolean;
  maxHeroScale: number;
  /** Subtracts hero bottom squeeze from drawable height ( `/products` strip ). */
  applyBottomSqueeze?: boolean;
  stripLayout?: CatalogProductHeroStripLayout;
  /** Clears cached natural size when the hero asset changes (gallery / product). */
  imageKey?: string;
}

export interface UseCatalogProductHeroScaleResult {
  frameRef: RefObject<HTMLDivElement>;
  scale: number;
  onImageLoad: (naturalWidth: number, naturalHeight: number) => void;
}

/**
 * Measures the hero frame and caps scale so bleed above the white card stays within the top limit.
 */
export function useCatalogProductHeroScale({
  enabled,
  targetScale,
  isSmUp,
  maxHeroScale,
  applyBottomSqueeze = false,
  stripLayout = 'homeCompact',
  imageKey,
}: UseCatalogProductHeroScaleParams): UseCatalogProductHeroScaleResult {
  const frameRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState<NaturalImageSize | null>(null);
  const [frameSize, setFrameSize] = useState<FrameSize | null>(null);
  const [viewportBand, setViewportBand] = useState(() =>
    getCatalogProductHeroViewportBand(isSmUp)
  );

  const measureFrame = useCallback(() => {
    const element = frameRef.current;
    if (!element) {
      return;
    }
    const band = getCatalogProductHeroViewportBand(isSmUp);
    setFrameSize(measureCatalogProductHeroFrameSize(element, band, applyBottomSqueeze));
  }, [isSmUp, applyBottomSqueeze]);

  useEffect(() => {
    setViewportBand(getCatalogProductHeroViewportBand(isSmUp));
  }, [isSmUp]);

  useEffect(() => {
    setNaturalSize(null);
  }, [imageKey]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const img = frameRef.current?.querySelector('img');
    if (!img?.complete || img.naturalWidth <= 0 || img.naturalHeight <= 0) {
      return;
    }
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    measureFrame();
  }, [enabled, imageKey, measureFrame]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }
    const lgMedia = window.matchMedia('(min-width: 1024px)');
    const onViewportChange = () => {
      setViewportBand(getCatalogProductHeroViewportBand(isSmUp));
    };
    lgMedia.addEventListener('change', onViewportChange);
    return () => lgMedia.removeEventListener('change', onViewportChange);
  }, [enabled, isSmUp]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    measureFrame();
    const element = frameRef.current;
    if (!element || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(measureFrame);
    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, measureFrame, viewportBand]);

  const onImageLoad = useCallback(
    (naturalWidth: number, naturalHeight: number) => {
      setNaturalSize({ width: naturalWidth, height: naturalHeight });
      measureFrame();
    },
    [measureFrame]
  );

  const scale = useMemo(() => {
    if (!enabled) {
      return targetScale;
    }

    const frameHeightPx =
      frameSize?.height ??
      getCompactHeroDrawableHeightPx(viewportBand, applyBottomSqueeze, stripLayout);
    const frameWidthPx = frameSize?.width ?? frameHeightPx;
    const slotWidthRatio =
      stripLayout === 'productsCatalog'
        ? CATALOG_PRODUCTS_PAGE_HERO_SLOT_WIDTH_RATIO
        : PRODUCT_CARD_HERO_SLOT_WIDTH_RATIO;
    const slotHeightRatio =
      stripLayout === 'productsCatalog'
        ? CATALOG_PRODUCTS_PAGE_HERO_SLOT_HEIGHT_RATIO
        : PRODUCT_CARD_HERO_SLOT_HEIGHT_RATIO;
    const slotHeightPx = frameHeightPx * slotHeightRatio;
    const slotWidthPx = frameWidthPx * slotWidthRatio;
    const normalizedSlotHeightRatio =
      stripLayout === 'productsCatalog'
        ? CATALOG_PRODUCTS_PAGE_HERO_NORMALIZED_SLOT_HEIGHT_RATIO
        : CATALOG_PRODUCT_CARD_HERO_NORMALIZED_SLOT_HEIGHT_RATIO;
    const naturalWidth = naturalSize?.width ?? 0;
    const naturalHeight = naturalSize?.height ?? 0;
    const structuralOverflow = getCatalogProductCardStructuralOverflowAboveCardPx(
      viewportBand,
      stripLayout
    );

    if (naturalWidth <= 0 || naturalHeight <= 0) {
      return targetScale;
    }

    return resolveCatalogProductCardHeroDisplayScale(
      naturalWidth,
      naturalHeight,
      targetScale,
      slotHeightPx,
      slotWidthPx,
      structuralOverflow,
      maxHeroScale,
      CATALOG_PRODUCT_CARD_HERO_MAX_TOP_OVERFLOW_PX,
      normalizedSlotHeightRatio
    );
  }, [
    enabled,
    targetScale,
    maxHeroScale,
    applyBottomSqueeze,
    stripLayout,
    naturalSize,
    frameSize,
    viewportBand,
  ]);

  return { frameRef: frameRef as RefObject<HTMLDivElement>, scale, onImageLoad };
}
