'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import { THUMBNAILS_PER_VIEW } from './constants';
import type { Product } from './types';
import { CustomizeHeroPreview } from './CustomizeTabPackPreview';
import {
  CUSTOMIZE_HERO_PREVIEW_3D_RIGHT_RATIO,
  CUSTOMIZE_HERO_PREVIEW_3D_TOP_RATIO,
  CUSTOMIZE_HERO_PREVIEW_3D_WIDTH_RATIO,
  CUSTOMIZE_HERO_PREVIEW_ASSETS,
} from './customize-tab-preview.constants';
import { CustomizeProductOverlay, type CustomizeOverlayPosition } from './CustomizeProductOverlay';
import { MobileGalleryHeroSlider } from './gallery/MobileGalleryHeroSlider';
import { MobileGalleryThumbnailTrack } from './gallery/MobileGalleryThumbnailTrack';
import { useMobileGalleryViewport } from './gallery/useMobileGalleryViewport';

interface ProductImageGalleryProps {
  /** Main product images for the thumbnail strip (admin media only). */
  images: string[];
  /** Hero image — main gallery image or variant override when a variant is selected. */
  heroImageSrc: string;
  /** Highlighted thumbnail index; null when hero shows a variant image. */
  activeThumbnailIndex: number | null;
  product: Product;
  language: LanguageCode;
  currentImageIndex: number;
  onImageIndexChange: (index: number) => void;
  thumbnailStartIndex: number;
  onThumbnailStartIndexChange: (index: number) => void;
  /** Sanitized customize HTML overlaid on the hero image after Apply */
  customizeOverlayHtml: string | null;
  customizeOverlayPosition?: CustomizeOverlayPosition;
  /** Figma black-body preview replaces hero while customize text is entered */
  showCustomizeHeroPreview?: boolean;
  customizeHeroPreviewHtml?: string | null;
  /** @deprecated Use showCustomizeHeroPreview */
  showCustomizePackPreview?: boolean;
  /** @deprecated Use customizeHeroPreviewHtml */
  customizePackPreviewHtml?: string | null;
}

/**
 * Space below the site header before the white card (pairs with {@link HERO_PULL_ABOVE_CARD}).
 */
const GALLERY_TOP_OFFSET_CLASSES = 'pt-5 sm:pt-14 lg:pt-16';

/**
 * Pulls the product hero slightly above the card top (skipped for customize preview so the 3D badge stays inside the card).
 * Pairs with {@link GALLERY_TOP_OFFSET_CLASSES} for header clearance.
 */
const HERO_PULL_ABOVE_CARD = 'max-sm:-mt-7 sm:-mt-12 lg:-mt-14';

/** Mobile hero height (px) — fits typical phone viewport without clipping below the fold. */
const MOBILE_HERO_IMAGE_HEIGHT_CLASS = 'h-[270px]';

/** Fixed hero frame — small sources scale up, large sources scale down (no crop). */
const HERO_IMAGE_BOX_SIZE_CLASSES = `${MOBILE_HERO_IMAGE_HEIGHT_CLASS} w-full max-w-full shrink-0 sm:h-[440px] lg:h-[480px]`;

/** Compact thumbnail frame — fixed square, does not stretch with flex. */
const THUMBNAIL_IMAGE_BOX_SIZE_CLASSES = 'size-[36px] shrink-0 sm:size-[40px]';

/** Thumbnail strip nav control — flanks the thumbnail row on all breakpoints. */
const THUMBNAIL_NAV_BUTTON_CLASSES =
  'flex size-9 shrink-0 items-center justify-center rounded-full text-[#122a26] transition-opacity disabled:cursor-not-allowed disabled:opacity-30 sm:size-10';

const THUMBNAIL_NAV_ICON_CLASSES = 'size-5 sm:size-6';

/**
 * Fills the fixed hero/thumb frame without layout jump from intrinsic image size.
 * `absolute inset-0` keeps the CSS box stable before decode; object-contain scales the bitmap.
 */
const GALLERY_IMAGE_FIT_CLASSES = 'absolute inset-0 size-full object-contain object-center';

/** Vertical rhythm between hero and thumbnail strip inside the card. */
const GALLERY_SECTION_GAP_CLASSES = 'gap-3 sm:gap-4';

/** Thumbnail underline — desktop/tablet only. */
const THUMBNAIL_ACTIVE_INDICATOR_CLASSES =
  'hidden h-0.5 rounded-[1px] sm:block';

/** Thumbnail strip scroll — hide native scrollbar (avoids grey line on mobile). */
const THUMBNAIL_STRIP_SCROLL_BASE_CLASSES =
  'scrollbar-hide min-h-0 min-w-0 flex-1 overflow-y-visible overscroll-x-contain';

const THUMBNAIL_STRIP_SCROLL_CLIP_CLASSES = 'max-sm:overflow-x-hidden sm:overflow-x-auto';

/** Mobile edge mask width — matches nav button size (`size-9`). */
const THUMBNAIL_STRIP_MOBILE_EDGE_BLOCK_WIDTH_PX = 36;

const THUMBNAIL_STRIP_MOBILE_EDGE_BLOCK_BASE_CLASSES =
  'pointer-events-none absolute inset-y-0 z-[5] w-9 bg-white max-sm:block sm:hidden';

const THUMBNAIL_STRIP_MOBILE_EDGE_BLOCK_PREVIOUS_CLASSES =
  `${THUMBNAIL_STRIP_MOBILE_EDGE_BLOCK_BASE_CLASSES} left-0`;

const THUMBNAIL_STRIP_MOBILE_EDGE_BLOCK_NEXT_CLASSES =
  `${THUMBNAIL_STRIP_MOBILE_EDGE_BLOCK_BASE_CLASSES} right-0`;

/** Invisible slot — fills the scroll window when the trailing edge has fewer than {@link THUMBNAILS_PER_VIEW} images. */
const THUMBNAIL_EMPTY_SLOT_CLASS =
  'pointer-events-none invisible flex shrink-0 flex-col items-center justify-center gap-0.5';

/** Compact strip (≤ {@link THUMBNAILS_PER_VIEW} images): nav arrows overlay thumbnail row edges. */
const THUMBNAIL_STRIP_COMPACT_ROW_CLASSES = 'relative z-20 w-full min-w-0 shrink-0';

const THUMBNAIL_STRIP_COMPACT_THUMBS_CLASSES =
  'flex w-full min-w-0 items-center justify-center gap-3 overflow-x-hidden max-sm:gap-2 sm:px-11';

/** Windowed strip — thumbs align from the start when the row overflows and slides. */
const THUMBNAIL_STRIP_WINDOWED_THUMBS_CLASSES =
  'flex w-full min-w-0 items-center justify-start overflow-x-hidden max-sm:gap-2 sm:gap-3';

const THUMBNAIL_STRIP_COMPACT_NAV_BUTTON_CLASSES =
  `${THUMBNAIL_NAV_BUTTON_CLASSES} absolute top-1/2 z-10 -translate-y-1/2 max-sm:bg-transparent sm:bg-white/85`;

const THUMBNAIL_STRIP_COMPACT_PREVIOUS_CLASSES = `${THUMBNAIL_STRIP_COMPACT_NAV_BUTTON_CLASSES} left-0`;
const THUMBNAIL_STRIP_COMPACT_NEXT_CLASSES = `${THUMBNAIL_STRIP_COMPACT_NAV_BUTTON_CLASSES} right-0`;

const THUMBNAIL_STRIP_WINDOWED_INNER_ROW_CLASSES =
  'flex min-h-0 w-full min-w-0 flex-nowrap items-center justify-start gap-2 sm:gap-3';

const THUMBNAIL_STRIP_CENTERED_INNER_ROW_CLASSES =
  'flex min-h-0 w-full flex-nowrap items-center justify-center gap-3 max-sm:gap-2';

const THUMBNAIL_SIZE_MOBILE_PX = 36;
const THUMBNAIL_SIZE_DESKTOP_PX = 40;
const THUMBNAIL_GAP_MOBILE_PX = 8;
const THUMBNAIL_GAP_DESKTOP_PX = 12;
const MOBILE_BREAKPOINT_PX = 640;

/** Inner content width of the thumbnail viewport (excludes padding and mobile edge masks). */
function getThumbsViewportContentWidth(node: HTMLElement, isMobile: boolean): number {
  const style = window.getComputedStyle(node);
  const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const mobileEdgeInset = isMobile ? THUMBNAIL_STRIP_MOBILE_EDGE_BLOCK_WIDTH_PX * 2 : 0;

  return Math.max(0, node.clientWidth - paddingX - mobileEdgeInset);
}

/** Total width of a thumbnail row with gaps between items. */
function thumbnailsStripContentWidth(imageCount: number, isMobile: boolean): number {
  if (imageCount <= 0) {
    return 0;
  }

  const thumbSize = isMobile ? THUMBNAIL_SIZE_MOBILE_PX : THUMBNAIL_SIZE_DESKTOP_PX;
  const gap = isMobile ? THUMBNAIL_GAP_MOBILE_PX : THUMBNAIL_GAP_DESKTOP_PX;

  return imageCount * thumbSize + (imageCount - 1) * gap;
}

/** How many thumbnail slots fit in the measured viewport. */
function countVisibleThumbnailSlots(containerWidth: number, isMobile: boolean): number {
  const thumbSize = isMobile ? THUMBNAIL_SIZE_MOBILE_PX : THUMBNAIL_SIZE_DESKTOP_PX;
  const gap = isMobile ? THUMBNAIL_GAP_MOBILE_PX : THUMBNAIL_GAP_DESKTOP_PX;

  if (containerWidth <= 0) {
    return THUMBNAILS_PER_VIEW;
  }

  return Math.max(1, Math.floor((containerWidth + gap) / (thumbSize + gap)));
}

/** Slides the thumbnail window so the active image stays visible when navigating. */
function resolveThumbnailStartIndex(
  imageIndex: number,
  startIndex: number,
  slotsPerView: number,
  totalImages: number,
): number | null {
  if (totalImages <= slotsPerView) {
    return null;
  }

  if (imageIndex < startIndex) {
    return imageIndex;
  }

  if (imageIndex >= startIndex + slotsPerView) {
    return imageIndex - slotsPerView + 1;
  }

  return null;
}

export function ProductImageGallery({
  images,
  heroImageSrc,
  activeThumbnailIndex,
  product,
  language,
  currentImageIndex,
  onImageIndexChange,
  thumbnailStartIndex,
  onThumbnailStartIndexChange,
  customizeOverlayHtml,
  customizeOverlayPosition = 'bottom',
  showCustomizeHeroPreview,
  customizeHeroPreviewHtml,
  showCustomizePackPreview = false,
  customizePackPreviewHtml = null,
}: ProductImageGalleryProps) {
  const thumbsViewportRef = useRef<HTMLDivElement>(null);
  const [measuredVisibleSlots, setMeasuredVisibleSlots] = useState(THUMBNAILS_PER_VIEW);
  const [thumbnailsStripOverflows, setThumbnailsStripOverflows] = useState(false);
  const [galleryThumbnailStepPx, setGalleryThumbnailStepPx] = useState(
    THUMBNAIL_SIZE_MOBILE_PX + THUMBNAIL_GAP_MOBILE_PX,
  );
  const isMobileGallery = useMobileGalleryViewport();

  const slotsPerView = Math.min(THUMBNAILS_PER_VIEW, measuredVisibleSlots);
  const usesThumbnailWindow = images.length > slotsPerView;
  const usesCompactThumbnailStrip = images.length <= THUMBNAILS_PER_VIEW;
  const usesVisibleThumbnailWindow =
    usesThumbnailWindow && (!isMobileGallery || thumbnailsStripOverflows);
  const usesWindowedThumbnailLayout = isMobileGallery && usesVisibleThumbnailWindow;
  const compactThumbsViewportClassName = usesWindowedThumbnailLayout
    ? THUMBNAIL_STRIP_WINDOWED_THUMBS_CLASSES
    : THUMBNAIL_STRIP_COMPACT_THUMBS_CLASSES;
  const compactThumbsInnerRowClassName = usesWindowedThumbnailLayout
    ? THUMBNAIL_STRIP_WINDOWED_INNER_ROW_CLASSES
    : THUMBNAIL_STRIP_CENTERED_INNER_ROW_CLASSES;

  useLayoutEffect(() => {
    const node = thumbsViewportRef.current;
    if (!node) {
      return;
    }

    const updateVisibleSlots = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT_PX;
      const contentWidth = getThumbsViewportContentWidth(node, isMobile);
      const visibleSlots = countVisibleThumbnailSlots(contentWidth, isMobile);
      setMeasuredVisibleSlots(Math.min(visibleSlots, THUMBNAILS_PER_VIEW));
      setGalleryThumbnailStepPx(
        isMobile
          ? THUMBNAIL_SIZE_MOBILE_PX + THUMBNAIL_GAP_MOBILE_PX
          : THUMBNAIL_SIZE_DESKTOP_PX + THUMBNAIL_GAP_DESKTOP_PX,
      );
      setThumbnailsStripOverflows(
        thumbnailsStripContentWidth(images.length, isMobile) > contentWidth,
      );
    };

    updateVisibleSlots();
    const observer = new ResizeObserver(updateVisibleSlots);
    observer.observe(node);

    return () => observer.disconnect();
  }, [usesCompactThumbnailStrip, images.length]);

  useEffect(() => {
    const nextStart = resolveThumbnailStartIndex(
      currentImageIndex,
      thumbnailStartIndex,
      slotsPerView,
      images.length,
    );

    if (nextStart !== null && nextStart !== thumbnailStartIndex) {
      onThumbnailStartIndexChange(nextStart);
    }
  }, [
    currentImageIndex,
    images.length,
    onThumbnailStartIndexChange,
    slotsPerView,
    thumbnailStartIndex,
  ]);

  useEffect(() => {
    const maxStart = Math.max(0, images.length - slotsPerView);
    if (thumbnailStartIndex > maxStart) {
      onThumbnailStartIndexChange(maxStart);
    }
  }, [images.length, onThumbnailStartIndexChange, slotsPerView, thumbnailStartIndex]);

  const hasHeroImage = heroImageSrc.length > 0;
  const resolvedHeroPreviewHtml = customizeHeroPreviewHtml ?? customizePackPreviewHtml;
  const showHeroPreviewInGallery = showCustomizeHeroPreview ?? showCustomizePackPreview;
  const hasHeroContent = showHeroPreviewInGallery || hasHeroImage;
  const canNavigateImages = images.length > 1;

  const thumbnailStripScrollClassName =
    `${THUMBNAIL_STRIP_SCROLL_BASE_CLASSES} ${THUMBNAIL_STRIP_SCROLL_CLIP_CLASSES}`;

  const navigateImageByArrow = (direction: 'previous' | 'next') => {
    if (!canNavigateImages) {
      return;
    }
    const nextIndex =
      direction === 'previous'
        ? (currentImageIndex - 1 + images.length) % images.length
        : (currentImageIndex + 1) % images.length;
    selectThumbnailByIndex(nextIndex);
  };

  /** Sets main image to this gallery index and keeps the thumbnail strip window aligned. */
  const selectThumbnailByIndex = (index: number) => {
    if (index < 0 || index >= images.length) {
      return;
    }
    onImageIndexChange(index);
    const nextStart = resolveThumbnailStartIndex(index, thumbnailStartIndex, slotsPerView, images.length);
    if (nextStart !== null) {
      onThumbnailStartIndexChange(nextStart);
    }
  };

  const renderThumbnailNavButton = (
    direction: 'previous' | 'next',
    className: string,
  ) => (
    <button
      type="button"
      onClick={() => navigateImageByArrow(direction)}
      aria-label={t(
        language,
        direction === 'previous' ? 'common.ariaLabels.previousThumbnail' : 'common.ariaLabels.nextThumbnail',
      )}
      disabled={!canNavigateImages}
      className={className}
    >
      <svg className={THUMBNAIL_NAV_ICON_CLASSES} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.2}
          d={direction === 'previous' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}
        />
      </svg>
    </button>
  );

  const renderGalleryThumbnail = (image: string, imageIndex: number) => {
    const isActive = activeThumbnailIndex !== null && imageIndex === activeThumbnailIndex;

    return (
      <button
        key={`${image}-${imageIndex}`}
        type="button"
        onClick={() => selectThumbnailByIndex(imageIndex)}
        className={`group relative flex shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 overflow-visible rounded-[4px] bg-white transition-opacity ${
          isActive ? 'opacity-100' : 'opacity-75 hover:opacity-100'
        }`}
      >
        <div className={`relative overflow-hidden ${THUMBNAIL_IMAGE_BOX_SIZE_CLASSES}`}>
          <img src={image} alt="" draggable={false} className={GALLERY_IMAGE_FIT_CLASSES} />
        </div>
        <span
          aria-hidden
          className={`${THUMBNAIL_ACTIVE_INDICATOR_CLASSES} ${
            isActive ? 'w-full bg-[#122a26]' : 'w-2/3 bg-[#d9d9d9]'
          }`}
        />
      </button>
    );
  };

  const renderWindowedThumbnailSlots = () =>
    Array.from({ length: slotsPerView }, (_, slotIndex) => {
      const imageIndex = thumbnailStartIndex + slotIndex;

      if (imageIndex >= images.length) {
        return (
          <div key={`thumb-slot-empty-${slotIndex}`} aria-hidden className={THUMBNAIL_EMPTY_SLOT_CLASS}>
            <div className={THUMBNAIL_IMAGE_BOX_SIZE_CLASSES} />
            <span className={`${THUMBNAIL_ACTIVE_INDICATOR_CLASSES} w-full opacity-0`} />
          </div>
        );
      }

      return renderGalleryThumbnail(images[imageIndex], imageIndex);
    });

  const renderThumbnailStripItems = () => {
    if (usesWindowedThumbnailLayout) {
      return (
        <MobileGalleryThumbnailTrack
          startIndex={thumbnailStartIndex}
          thumbStepPx={galleryThumbnailStepPx}
        >
          {images.map((image, imageIndex) => renderGalleryThumbnail(image, imageIndex))}
        </MobileGalleryThumbnailTrack>
      );
    }

    return usesVisibleThumbnailWindow
      ? renderWindowedThumbnailSlots()
      : images.map((image, imageIndex) => renderGalleryThumbnail(image, imageIndex));
  };

  const renderMobileThumbnailEdgeBlocks = () => (
    <>
      <span aria-hidden className={THUMBNAIL_STRIP_MOBILE_EDGE_BLOCK_PREVIOUS_CLASSES} />
      <span aria-hidden className={THUMBNAIL_STRIP_MOBILE_EDGE_BLOCK_NEXT_CLASSES} />
    </>
  );

  const renderDefaultThumbnailStrip = () =>
    usesCompactThumbnailStrip ? (
      <div className={THUMBNAIL_STRIP_COMPACT_ROW_CLASSES}>
        {renderMobileThumbnailEdgeBlocks()}
        {canNavigateImages ? (
          <>
            {renderThumbnailNavButton('previous', THUMBNAIL_STRIP_COMPACT_PREVIOUS_CLASSES)}
            {renderThumbnailNavButton('next', THUMBNAIL_STRIP_COMPACT_NEXT_CLASSES)}
          </>
        ) : null}
        <div ref={thumbsViewportRef} className={compactThumbsViewportClassName}>
          <div className={compactThumbsInnerRowClassName}>{renderThumbnailStripItems()}</div>
        </div>
      </div>
    ) : (
      <div className="relative z-20 w-full min-w-0 shrink-0">
        {renderMobileThumbnailEdgeBlocks()}
        {canNavigateImages ? (
          <>
            {renderThumbnailNavButton('previous', THUMBNAIL_STRIP_COMPACT_PREVIOUS_CLASSES)}
            {renderThumbnailNavButton('next', THUMBNAIL_STRIP_COMPACT_NEXT_CLASSES)}
          </>
        ) : null}
        <div ref={thumbsViewportRef} className={thumbnailStripScrollClassName}>
          <div
            className={
              usesWindowedThumbnailLayout
                ? THUMBNAIL_STRIP_WINDOWED_INNER_ROW_CLASSES
                : 'flex min-h-0 w-full flex-nowrap items-center justify-center gap-3 max-sm:gap-2'
            }
          >
            {renderThumbnailStripItems()}
          </div>
        </div>
      </div>
    );

  const renderCustomizeHeroPreview = () => (
    <div
      className={`relative mx-auto flex w-full max-w-full items-center justify-center overflow-visible ${HERO_IMAGE_BOX_SIZE_CLASSES}`}
    >
      <img
        src={CUSTOMIZE_HERO_PREVIEW_ASSETS.productBadgeSrc}
        alt=""
        decoding="async"
        draggable={false}
        aria-hidden
        className="pointer-events-none absolute z-20 h-auto max-w-[95px] object-contain"
        style={{
          top: `${CUSTOMIZE_HERO_PREVIEW_3D_TOP_RATIO * 100}%`,
          right: `${CUSTOMIZE_HERO_PREVIEW_3D_RIGHT_RATIO * 100}%`,
          width: `${CUSTOMIZE_HERO_PREVIEW_3D_WIDTH_RATIO * 100}%`,
        }}
      />
      <CustomizeHeroPreview overlayHtml={resolvedHeroPreviewHtml ?? ''} />
    </div>
  );

  const renderProductHeroImage = () => {
    if (!hasHeroImage) {
      return (
        <div className="flex w-full items-center justify-center text-[#9d9d9d]">
          {t(language, 'common.messages.noImage')}
        </div>
      );
    }

    if (isMobileGallery && images.length > 1) {
      return (
        <MobileGalleryHeroSlider
          images={images}
          currentIndex={currentImageIndex}
          alt={product.title}
          boxSizeClasses={HERO_IMAGE_BOX_SIZE_CLASSES}
          fitClasses={GALLERY_IMAGE_FIT_CLASSES}
          onNavigate={navigateImageByArrow}
          overlay={
            customizeOverlayHtml ? (
              <CustomizeProductOverlay
                html={customizeOverlayHtml}
                position={customizeOverlayPosition}
              />
            ) : undefined
          }
        />
      );
    }

    return (
      <div className={`relative mx-auto w-full max-w-full ${HERO_IMAGE_BOX_SIZE_CLASSES}`}>
        <img
          src={heroImageSrc}
          alt={product.title}
          decoding="async"
          fetchPriority="high"
          draggable={false}
          className={`transition-transform duration-300 ease-out max-sm:group-hover:scale-100 sm:group-hover:scale-[1.03] ${GALLERY_IMAGE_FIT_CLASSES}`}
        />
        {customizeOverlayHtml ? (
          <CustomizeProductOverlay html={customizeOverlayHtml} position={customizeOverlayPosition} />
        ) : null}
      </div>
    );
  };

  return (
    <div className={`overflow-visible ${GALLERY_TOP_OFFSET_CLASSES}`}>
      <div className="relative z-0 mx-auto w-full max-w-[520px] overflow-visible rounded-[20px] bg-white px-3 pb-4 pt-3 shadow-none transition-shadow duration-200 has-[.product-hero:hover]:z-10 sm:max-w-[540px] sm:overflow-x-clip sm:overflow-y-visible sm:rounded-[24px] sm:px-5 sm:pb-5 sm:pt-4 sm:shadow-[0_1px_0_rgba(18,42,38,0.04)] sm:has-[.product-hero:hover]:shadow-[0_12px_32px_rgba(18,42,38,0.12)] lg:max-w-[580px]">
        <div className={`flex flex-col items-center overflow-visible ${GALLERY_SECTION_GAP_CLASSES}`}>
          <div
            className={`flex w-full justify-center ${
              hasHeroContent
                ? `product-hero group relative z-10 ${
                    showHeroPreviewInGallery ? '' : HERO_PULL_ABOVE_CARD
                  }`
                : 'min-h-[240px] items-center sm:min-h-[260px]'
            }`}
          >
            {showHeroPreviewInGallery ? renderCustomizeHeroPreview() : renderProductHeroImage()}
          </div>

          {images.length > 0 ? renderDefaultThumbnailStrip() : null}
        </div>
      </div>
    </div>
  );
}
