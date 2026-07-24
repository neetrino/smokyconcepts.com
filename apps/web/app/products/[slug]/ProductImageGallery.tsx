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
const GALLERY_TOP_OFFSET_CLASSES = 'pt-12 sm:pt-14 lg:pt-16';

/**
 * Pulls the hero slightly above the card top while {@link GALLERY_TOP_OFFSET_CLASSES} keeps header clearance.
 */
const HERO_PULL_ABOVE_CARD = '-mt-10 sm:-mt-12 lg:-mt-14';

/** Fixed hero frame — small sources scale up, large sources scale down (no crop). */
const HERO_IMAGE_BOX_SIZE_CLASSES =
  'h-[340px] w-full max-w-full shrink-0 sm:h-[380px] lg:h-[420px]';

/** Fixed thumbnail frame — same fill behavior as hero. */
const THUMBNAIL_IMAGE_BOX_SIZE_CLASSES = 'h-[68px] w-full shrink-0 sm:h-[82px]';

/** Fills the frame: upscales small assets, downscales large ones, keeps aspect ratio. */
const GALLERY_IMAGE_FIT_CLASSES = 'size-full object-contain object-center';

/** Vertical rhythm between hero and thumbnail strip inside the card. */
const GALLERY_SECTION_GAP_CLASSES = 'gap-3 sm:gap-4';

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

  const visibleThumbnails = images.slice(thumbnailStartIndex, thumbnailStartIndex + THUMBNAILS_PER_VIEW);
  const canNavigateImages = images.length > 1;

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
      <div className="relative z-0 mx-auto w-full max-w-[520px] overflow-visible rounded-[20px] bg-white px-3 pb-3 pt-3 shadow-[0_1px_0_rgba(18,42,38,0.04)] transition-shadow duration-200 has-[.product-hero:hover]:z-10 has-[.product-hero:hover]:shadow-[0_12px_32px_rgba(18,42,38,0.12)] sm:max-w-[540px] sm:rounded-[24px] sm:px-5 sm:pb-4 sm:pt-4 lg:max-w-[580px]">
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
                  className={`block transition-transform duration-300 ease-out group-hover:scale-[1.03] ${GALLERY_IMAGE_FIT_CLASSES}`}
                />
                {customizeOverlayHtml ? <CustomizeProductOverlay html={customizeOverlayHtml} /> : null}
              </div>
            ) : (
              <div className="flex w-full items-center justify-center text-[#9d9d9d]">
                {t(language, 'common.messages.noImage')}
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className="relative z-20 flex w-full shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => navigateImageByArrow('previous')}
                aria-label={t(language, 'common.ariaLabels.previousThumbnail')}
                disabled={!canNavigateImages}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[#122a26] transition-opacity disabled:cursor-not-allowed disabled:opacity-30 sm:h-16 sm:w-16"
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <div className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-visible overscroll-x-contain">
                <div className="flex min-h-0 w-full flex-nowrap items-center gap-2 sm:gap-2.5">
                  {visibleThumbnails.map((image, index) => {
                    const actualIndex = thumbnailStartIndex + index;
                    const isActive = actualIndex === currentImageIndex;

                    return (
                      <button
                        key={`${image}-${actualIndex}`}
                        type="button"
                        onClick={() => selectThumbnailByIndex(actualIndex)}
                        className={`group relative flex min-h-[76px] min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 overflow-visible rounded-[6px] bg-white py-0.5 transition-opacity sm:min-h-[90px] ${
                          isActive ? 'opacity-100' : 'opacity-75 hover:opacity-100'
                        }`}
                      >
                        <div
                          className={`flex w-full items-center justify-center overflow-visible ${THUMBNAIL_IMAGE_BOX_SIZE_CLASSES}`}
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
                          className={`block h-0.5 max-w-[80%] rounded-[2px] sm:h-1 ${
                            isActive ? 'w-[70%] bg-[#122a26]' : 'w-1/2 bg-[#d9d9d9]'
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
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[#122a26] transition-opacity disabled:cursor-not-allowed disabled:opacity-30 sm:h-16 sm:w-16"
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
