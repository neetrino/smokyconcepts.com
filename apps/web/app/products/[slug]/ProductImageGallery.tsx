'use client';

import { useEffect } from 'react';
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
  CUSTOMIZE_HERO_THUMBNAIL_TOP_RATIO,
} from './customize-tab-preview.constants';
import { CustomizeProductOverlay, type CustomizeOverlayPosition } from './CustomizeProductOverlay';

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
 * Pulls the hero slightly above the card top while {@link GALLERY_TOP_OFFSET_CLASSES} keeps header clearance.
 */
const HERO_PULL_ABOVE_CARD = 'max-sm:-mt-7 sm:-mt-12 lg:-mt-14';

/** Mobile hero height (px) — fits typical phone viewport without clipping below the fold. */
const MOBILE_HERO_IMAGE_HEIGHT_CLASS = 'h-[270px]';

/** Fixed hero frame — small sources scale up, large sources scale down (no crop). */
const HERO_IMAGE_BOX_SIZE_CLASSES = `${MOBILE_HERO_IMAGE_HEIGHT_CLASS} w-full max-w-full shrink-0 sm:h-[440px] lg:h-[480px]`;

/** Compact thumbnail frame — fixed square, does not stretch with flex. */
const THUMBNAIL_IMAGE_BOX_SIZE_CLASSES = 'size-[36px] shrink-0 sm:size-[40px]';

/** Thumbnail strip nav control — desktop/tablet; mobile uses in-hero arrows. */
const THUMBNAIL_NAV_BUTTON_CLASSES =
  'hidden size-9 shrink-0 items-center justify-center rounded-full text-[#122a26] transition-opacity disabled:cursor-not-allowed disabled:opacity-30 max-sm:hidden sm:flex sm:size-10';

const THUMBNAIL_NAV_ICON_CLASSES = 'size-5 sm:size-6';

/** Mobile hero overlay — kept inside the white card via inset from the hero frame edges. */
const HERO_NAV_BUTTON_CLASSES =
  'absolute top-1/2 z-30 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-[#122a26]/80 transition-opacity disabled:cursor-not-allowed disabled:opacity-30 sm:hidden';

const HERO_NAV_PREVIOUS_BUTTON_CLASSES = `${HERO_NAV_BUTTON_CLASSES} left-2`;
const HERO_NAV_NEXT_BUTTON_CLASSES = `${HERO_NAV_BUTTON_CLASSES} right-2`;

/** Fills the frame: upscales small assets, downscales large ones, keeps aspect ratio. */
const GALLERY_IMAGE_FIT_CLASSES = 'size-full object-contain object-center';

/** Vertical rhythm between hero and thumbnail strip inside the card. */
const GALLERY_SECTION_GAP_CLASSES = 'gap-3 sm:gap-4';

/** Thumbnail underline — desktop only; mobile uses in-hero arrows. */
const THUMBNAIL_ACTIVE_INDICATOR_CLASSES =
  'hidden h-0.5 rounded-[1px] sm:block';

/** Thumbnail strip scroll — hide native scrollbar (avoids grey line on mobile). */
const THUMBNAIL_STRIP_SCROLL_BASE_CLASSES =
  'scrollbar-hide min-h-0 min-w-0 flex-1 overflow-y-visible overscroll-x-contain max-sm:w-full max-sm:flex-none';

/** Invisible slot — fills the scroll window when the trailing edge has fewer than {@link THUMBNAILS_PER_VIEW} images. */
const THUMBNAIL_EMPTY_SLOT_CLASS =
  'pointer-events-none invisible flex shrink-0 flex-col items-center justify-center gap-0.5';

/** Figma card aspect when customize preview is active (760×625). */
const CUSTOMIZE_GALLERY_CARD_ASPECT_CLASS = 'aspect-[760/625]';

/** Compact strip (≤ {@link THUMBNAILS_PER_VIEW} images): thumbs centered under hero; arrows overlay the row on sm+. */
const THUMBNAIL_STRIP_COMPACT_ROW_CLASSES = 'relative z-20 w-full min-w-0 shrink-0';

const THUMBNAIL_STRIP_COMPACT_THUMBS_CLASSES =
  'flex w-full items-center justify-center gap-3 max-sm:gap-2 sm:px-11';

const THUMBNAIL_STRIP_COMPACT_NAV_BUTTON_CLASSES =
  `${THUMBNAIL_NAV_BUTTON_CLASSES} absolute top-1/2 z-10 -translate-y-1/2`;

const THUMBNAIL_STRIP_COMPACT_PREVIOUS_CLASSES = `${THUMBNAIL_STRIP_COMPACT_NAV_BUTTON_CLASSES} left-0`;
const THUMBNAIL_STRIP_COMPACT_NEXT_CLASSES = `${THUMBNAIL_STRIP_COMPACT_NAV_BUTTON_CLASSES} right-0`;

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
  useEffect(() => {
    if (images.length > THUMBNAILS_PER_VIEW) {
      if (currentImageIndex < thumbnailStartIndex) {
        onThumbnailStartIndexChange(currentImageIndex);
      } else if (currentImageIndex >= thumbnailStartIndex + THUMBNAILS_PER_VIEW) {
        onThumbnailStartIndexChange(currentImageIndex - THUMBNAILS_PER_VIEW + 1);
      }
    }
  }, [currentImageIndex, images.length, thumbnailStartIndex, onThumbnailStartIndexChange]);

  const hasHeroImage = heroImageSrc.length > 0;
  const resolvedHeroPreviewHtml = customizeHeroPreviewHtml ?? customizePackPreviewHtml;
  const showHeroPreviewInGallery = showCustomizeHeroPreview ?? showCustomizePackPreview;
  const hasHeroContent = showHeroPreviewInGallery || hasHeroImage;
  const canNavigateImages = images.length > 1;
  const usesCompactThumbnailStrip = images.length <= THUMBNAILS_PER_VIEW;

  const thumbnailStripScrollClassName = `${THUMBNAIL_STRIP_SCROLL_BASE_CLASSES} overflow-x-auto`;

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
    if (images.length <= THUMBNAILS_PER_VIEW) {
      return;
    }
    if (index < thumbnailStartIndex) {
      onThumbnailStartIndexChange(index);
    } else if (index >= thumbnailStartIndex + THUMBNAILS_PER_VIEW) {
      onThumbnailStartIndexChange(index - THUMBNAILS_PER_VIEW + 1);
    }
  };

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
        <div className={`flex items-center justify-center overflow-visible ${THUMBNAIL_IMAGE_BOX_SIZE_CLASSES}`}>
          <img src={image} alt="" draggable={false} className={`block ${GALLERY_IMAGE_FIT_CLASSES}`} />
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

  const renderDefaultThumbnailStrip = () =>
    usesCompactThumbnailStrip ? (
      <div className={THUMBNAIL_STRIP_COMPACT_ROW_CLASSES}>
        {canNavigateImages ? (
          <>
            <button
              type="button"
              onClick={() => navigateImageByArrow('previous')}
              aria-label={t(language, 'common.ariaLabels.previousThumbnail')}
              className={THUMBNAIL_STRIP_COMPACT_PREVIOUS_CLASSES}
            >
              <svg className={THUMBNAIL_NAV_ICON_CLASSES} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => navigateImageByArrow('next')}
              aria-label={t(language, 'common.ariaLabels.nextThumbnail')}
              className={THUMBNAIL_STRIP_COMPACT_NEXT_CLASSES}
            >
              <svg className={THUMBNAIL_NAV_ICON_CLASSES} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        ) : null}
        <div className={THUMBNAIL_STRIP_COMPACT_THUMBS_CLASSES}>
          {images.map((image, imageIndex) => renderGalleryThumbnail(image, imageIndex))}
        </div>
      </div>
    ) : (
      <div className="relative z-20 flex w-full min-w-0 shrink-0 items-center justify-center gap-3 max-sm:gap-2">
        <button
          type="button"
          onClick={() => navigateImageByArrow('previous')}
          aria-label={t(language, 'common.ariaLabels.previousThumbnail')}
          disabled={!canNavigateImages}
          className={THUMBNAIL_NAV_BUTTON_CLASSES}
        >
          <svg className={THUMBNAIL_NAV_ICON_CLASSES} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className={thumbnailStripScrollClassName}>
          <div className="flex min-h-0 flex-nowrap items-center gap-3">
            {Array.from({ length: THUMBNAILS_PER_VIEW }, (_, slotIndex) => {
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
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigateImageByArrow('next')}
          aria-label={t(language, 'common.ariaLabels.nextThumbnail')}
          disabled={!canNavigateImages}
          className={THUMBNAIL_NAV_BUTTON_CLASSES}
        >
          <svg className={THUMBNAIL_NAV_ICON_CLASSES} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    );

  return (
    <div className={`overflow-visible ${GALLERY_TOP_OFFSET_CLASSES}`}>
      <div className="relative z-0 mx-auto w-full max-w-[520px] overflow-visible rounded-[20px] bg-white px-3 pb-4 pt-3 shadow-none transition-shadow duration-200 has-[.product-hero:hover]:z-10 sm:max-w-[540px] sm:overflow-x-clip sm:overflow-y-visible sm:rounded-[24px] sm:px-5 sm:pb-5 sm:pt-4 sm:shadow-[0_1px_0_rgba(18,42,38,0.04)] sm:has-[.product-hero:hover]:shadow-[0_12px_32px_rgba(18,42,38,0.12)] lg:max-w-[580px]">
        {showHeroPreviewInGallery ? (
          <div className={`relative w-full ${CUSTOMIZE_GALLERY_CARD_ASPECT_CLASS}`}>
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
            <div
              className={`absolute inset-x-0 bottom-0 flex flex-col items-center overflow-visible ${GALLERY_SECTION_GAP_CLASSES}`}
              style={{ top: `${CUSTOMIZE_HERO_THUMBNAIL_TOP_RATIO * 100}%` }}
            >
              {images.length > 0 ? renderDefaultThumbnailStrip() : null}
            </div>
          </div>
        ) : (
          <div className={`flex flex-col items-center overflow-visible ${GALLERY_SECTION_GAP_CLASSES}`}>
            <div
              className={`flex w-full justify-center ${
                hasHeroContent
                  ? `product-hero group relative z-10 ${HERO_PULL_ABOVE_CARD}`
                  : 'min-h-[240px] items-center sm:min-h-[260px]'
              }`}
            >
              {hasHeroImage ? (
                <div
                  className={`relative mx-auto flex w-full max-w-full items-center justify-center ${HERO_IMAGE_BOX_SIZE_CLASSES}`}
                >
                  <img
                    src={heroImageSrc}
                    alt={product.title}
                    decoding="async"
                    draggable={false}
                    className={`block transition-transform duration-300 ease-out max-sm:group-hover:scale-100 sm:group-hover:scale-[1.03] ${GALLERY_IMAGE_FIT_CLASSES}`}
                  />
                  {customizeOverlayHtml ? (
                    <CustomizeProductOverlay html={customizeOverlayHtml} position={customizeOverlayPosition} />
                  ) : null}
                  {canNavigateImages ? (
                    <>
                      <button
                        type="button"
                        onClick={() => navigateImageByArrow('previous')}
                        aria-label={t(language, 'common.ariaLabels.previousThumbnail')}
                        className={HERO_NAV_PREVIOUS_BUTTON_CLASSES}
                      >
                        <svg className={THUMBNAIL_NAV_ICON_CLASSES} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateImageByArrow('next')}
                        aria-label={t(language, 'common.ariaLabels.nextThumbnail')}
                        className={HERO_NAV_NEXT_BUTTON_CLASSES}
                      >
                        <svg className={THUMBNAIL_NAV_ICON_CLASSES} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </>
                  ) : null}
                </div>
              ) : (
                <div className="flex w-full items-center justify-center text-[#9d9d9d]">
                  {t(language, 'common.messages.noImage')}
                </div>
              )}
            </div>

            {images.length > 0 ? renderDefaultThumbnailStrip() : null}
          </div>
        )}
      </div>
    </div>
  );
}
