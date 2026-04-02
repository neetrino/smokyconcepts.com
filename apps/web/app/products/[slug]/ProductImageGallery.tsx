'use client';

import { useEffect } from 'react';
import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import { THUMBNAILS_PER_VIEW } from './constants';
import type { Product } from './types';

interface ProductImageGalleryProps {
  images: string[];
  product: Product;
  language: LanguageCode;
  currentImageIndex: number;
  onImageIndexChange: (index: number) => void;
  thumbnailStartIndex: number;
  onThumbnailStartIndexChange: (index: number) => void;
}

/**
 * Pulls the hero block above the white card top edge (same idea as HomePageContent cover cards).
 * Must pair with outer wrapper top padding so parents do not clip the overlap.
 */
const HERO_PULL_ABOVE_CARD = '-mt-28 sm:-mt-32 lg:-mt-40';

/** Max rendered height for the hero product image (Tailwind arbitrary values). */
const MAIN_IMAGE_MAX_HEIGHT_CLASSES = 'max-h-[420px] sm:max-h-[480px] lg:max-h-[650px]';

/** Nudge only the hero `<img>` upward (thumbnails / card layout unchanged). */
const HERO_IMAGE_SHIFT_UP = '-translate-y-2 sm:-translate-y-3 lg:-translate-y-4';

/** Pull thumbnail row + arrows closer to the main image (reduces vertical gap). */
const THUMBNAIL_ROW_OFFSET_UP = '-mt-16 sm:-mt-18 lg:-mt-24';

export function ProductImageGallery({
  images,
  product,
  language,
  currentImageIndex,
  onImageIndexChange,
  thumbnailStartIndex,
  onThumbnailStartIndexChange,
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
  const canGoBackward = thumbnailStartIndex > 0;
  const canGoForward = thumbnailStartIndex < images.length - THUMBNAILS_PER_VIEW;

  const shiftThumbnails = (direction: 'previous' | 'next') => {
    if (direction === 'previous') {
      onThumbnailStartIndexChange(Math.max(0, thumbnailStartIndex - 1));
      return;
    }

    onThumbnailStartIndexChange(
      Math.min(Math.max(images.length - THUMBNAILS_PER_VIEW, 0), thumbnailStartIndex + 1)
    );
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
    <div className="overflow-visible pt-28 sm:pt-32 lg:pt-36">
      <div className="relative z-0 overflow-visible rounded-[20px] bg-white px-3 pb-2 pt-0 shadow-[0_1px_0_rgba(18,42,38,0.04)] transition-shadow duration-200 has-[.product-hero:hover]:z-10 has-[.product-hero:hover]:shadow-[0_12px_32px_rgba(18,42,38,0.12)] sm:rounded-[24px] sm:px-5 sm:pb-3">
        <div className="flex flex-col items-center overflow-visible">
          <div
            className={`flex w-full justify-center overflow-visible ${
              images.length > 0
                ? `product-hero group relative z-10 ${HERO_PULL_ABOVE_CARD}`
                : 'min-h-[200px] items-center sm:min-h-[220px]'
            }`}
          >
            {images.length > 0 ? (
              <img
                src={images[currentImageIndex]}
                alt={product.title}
                decoding="async"
                draggable={false}
                className={`relative block h-auto w-auto max-w-full origin-bottom object-contain object-top transition-transform duration-300 ease-out ${HERO_IMAGE_SHIFT_UP} group-hover:scale-110 group-hover:drop-shadow-[0_12px_24px_rgba(18,42,38,0.18)] ${MAIN_IMAGE_MAX_HEIGHT_CLASSES}`}
              />
            ) : (
              <div className="flex w-full items-center justify-center text-[#9d9d9d]">
                {t(language, 'common.messages.noImage')}
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div
              className={`relative z-20 mt-0 flex w-full items-center gap-2 sm:gap-3 ${THUMBNAIL_ROW_OFFSET_UP}`}
            >
              <button
                type="button"
                onClick={() => shiftThumbnails('previous')}
                aria-label={t(language, 'common.ariaLabels.previousThumbnail')}
                disabled={!canGoBackward}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[#122a26] transition-opacity disabled:cursor-not-allowed disabled:opacity-30 sm:h-16 sm:w-16"
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <div className="min-h-0 min-w-0 flex-1 overflow-hidden overscroll-x-contain">
                <div className="flex min-h-0 w-full flex-nowrap items-stretch gap-2 sm:gap-2.5">
                  {visibleThumbnails.map((image, index) => {
                    const actualIndex = thumbnailStartIndex + index;
                    const isActive = actualIndex === currentImageIndex;

                    return (
                      <button
                        key={`${image}-${actualIndex}`}
                        type="button"
                        onClick={() => selectThumbnailByIndex(actualIndex)}
                        className={`group relative flex min-h-[76px] min-w-0 flex-1 cursor-pointer flex-col items-center justify-center rounded-[6px] bg-white py-0.5 transition-opacity sm:min-h-[90px] ${
                          isActive ? 'opacity-100' : 'opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={image}
                          alt=""
                          draggable={false}
                          className="block max-h-[68px] w-full max-w-full object-contain sm:max-h-[82px]"
                        />
                        <span
                          aria-hidden
                          className={`absolute bottom-0 left-1/2 h-0.5 max-w-[80%] -translate-x-1/2 rounded-[2px] sm:h-1 ${
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
                onClick={() => shiftThumbnails('next')}
                aria-label={t(language, 'common.ariaLabels.nextThumbnail')}
                disabled={!canGoForward}
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
