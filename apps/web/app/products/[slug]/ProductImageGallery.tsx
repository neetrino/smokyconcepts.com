'use client';

import { useEffect } from 'react';
import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import { THUMBNAILS_PER_VIEW } from './constants';
import type { Product } from './types';
import { CustomizeProductOverlay } from './CustomizeProductOverlay';

interface ProductImageGalleryProps {
  images: string[];
  product: Product;
  language: LanguageCode;
  currentImageIndex: number;
  onImageIndexChange: (index: number) => void;
  thumbnailStartIndex: number;
  onThumbnailStartIndexChange: (index: number) => void;
  /** Sanitized customize HTML overlaid on the hero image after Apply */
  customizeOverlayHtml: string | null;
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
const MOBILE_HERO_IMAGE_HEIGHT_CLASS = 'h-[230px]';

/** Fixed hero frame — small sources scale up, large sources scale down (no crop). */
const HERO_IMAGE_BOX_SIZE_CLASSES = `${MOBILE_HERO_IMAGE_HEIGHT_CLASS} w-full max-w-full shrink-0 sm:h-[400px] lg:h-[440px]`;

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

/** Invisible slot — keeps nav arrow spacing when fewer images than {@link THUMBNAILS_PER_VIEW}. */
const THUMBNAIL_EMPTY_SLOT_CLASS =
  'pointer-events-none invisible flex shrink-0 flex-col items-center justify-center gap-0.5';

export function ProductImageGallery({
  images,
  product,
  language,
  currentImageIndex,
  onImageIndexChange,
  thumbnailStartIndex,
  onThumbnailStartIndexChange,
  customizeOverlayHtml,
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

  const canNavigateImages = images.length > 1;
  const shouldPadThumbnailStrip = images.length <= THUMBNAILS_PER_VIEW;
  const visibleThumbnailCount = shouldPadThumbnailStrip
    ? images.length
    : Math.min(THUMBNAILS_PER_VIEW, Math.max(0, images.length - thumbnailStartIndex));
  const leadingEmptyThumbnailSlots = shouldPadThumbnailStrip
    ? Math.floor((THUMBNAILS_PER_VIEW - visibleThumbnailCount) / 2)
    : 0;

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

  return (
    <div className={`overflow-visible ${GALLERY_TOP_OFFSET_CLASSES}`}>
      <div className="relative z-0 mx-auto w-full max-w-[520px] overflow-visible rounded-[20px] bg-white px-3 pb-4 pt-3 shadow-[0_1px_0_rgba(18,42,38,0.04)] transition-shadow duration-200 has-[.product-hero:hover]:z-10 has-[.product-hero:hover]:shadow-[0_12px_32px_rgba(18,42,38,0.12)] sm:max-w-[540px] sm:overflow-x-clip sm:overflow-y-visible sm:rounded-[24px] sm:px-5 sm:pb-5 sm:pt-4 lg:max-w-[580px]">
        <div className={`flex flex-col items-center overflow-visible ${GALLERY_SECTION_GAP_CLASSES}`}>
          <div
            className={`flex w-full justify-center ${
              images.length > 0
                ? `product-hero group relative z-10 ${HERO_PULL_ABOVE_CARD}`
                : 'min-h-[200px] items-center sm:min-h-[220px]'
            }`}
          >
            {images.length > 0 ? (
              <div
                className={`relative mx-auto flex w-full max-w-full items-center justify-center ${HERO_IMAGE_BOX_SIZE_CLASSES}`}
              >
                <img
                  src={images[currentImageIndex]}
                  alt={product.title}
                  decoding="async"
                  draggable={false}
                  className={`block transition-transform duration-300 ease-out max-sm:group-hover:scale-100 sm:group-hover:scale-[1.03] ${GALLERY_IMAGE_FIT_CLASSES}`}
                />
                {customizeOverlayHtml ? <CustomizeProductOverlay html={customizeOverlayHtml} /> : null}
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

          {images.length > 0 && (
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

              <div className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-visible overscroll-x-contain max-sm:w-full max-sm:flex-none">
                <div className="flex min-h-0 flex-nowrap items-center justify-center gap-3">
                  {Array.from({ length: THUMBNAILS_PER_VIEW }, (_, slotIndex) => {
                    const imageIndex = shouldPadThumbnailStrip
                      ? slotIndex - leadingEmptyThumbnailSlots
                      : thumbnailStartIndex + slotIndex;

                    if (imageIndex < 0 || imageIndex >= images.length) {
                      return (
                        <div key={`thumb-slot-empty-${slotIndex}`} aria-hidden className={THUMBNAIL_EMPTY_SLOT_CLASS}>
                          <div className={THUMBNAIL_IMAGE_BOX_SIZE_CLASSES} />
                          <span className="block h-0.5 w-full opacity-0" />
                        </div>
                      );
                    }

                    const image = images[imageIndex];
                    const isActive = imageIndex === currentImageIndex;

                    return (
                      <button
                        key={`${image}-${imageIndex}`}
                        type="button"
                        onClick={() => selectThumbnailByIndex(imageIndex)}
                        className={`group relative flex shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 overflow-visible rounded-[4px] bg-white transition-opacity ${
                          isActive ? 'opacity-100' : 'opacity-75 hover:opacity-100'
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center overflow-visible ${THUMBNAIL_IMAGE_BOX_SIZE_CLASSES}`}
                        >
                          <img
                            src={image}
                            alt=""
                            draggable={false}
                            className={`block ${GALLERY_IMAGE_FIT_CLASSES}`}
                          />
                        </div>
                        <span
                          aria-hidden
                          className={`block h-0.5 rounded-[1px] ${
                            isActive ? 'w-full bg-[#122a26]' : 'w-2/3 bg-[#d9d9d9]'
                          }`}
                        />
                      </button>
                    );
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
          )}
        </div>
      </div>
    </div>
  );
}
