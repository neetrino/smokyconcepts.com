'use client';

import { useEffect, useMemo, useState } from 'react';

import { MAX_VOTING_GALLERY_IMAGES } from '@/lib/voting/voting-gallery';

interface CultureVotingCardProps {
  id: string;
  title: string;
  images: string[];
  likedByCurrentUser: boolean;
  pending: boolean;
  earlyAccessPending?: boolean;
  onToggleLike: (itemId: string, likedByCurrentUser: boolean) => Promise<void>;
  onEarlyAccess?: (itemId: string) => void;
  sizeLabel?: string;
  variantLabel?: string;
  variantTone?: CultureVotingVariantTone;
  showEarlyAccess?: boolean;
  earlyAccessLabel?: string;
}

type CultureVotingVariantTone = 'special' | 'classic' | 'atelier';

const VARIANT_TONE_CLASS_NAMES: Record<CultureVotingVariantTone, string> = {
  special: 'bg-[#dcc090]',
  classic: 'bg-[#122a26]',
  atelier: 'bg-[#731818]',
};

/** Mobile: white card fills grid column; desktop caps width below. */
const CULTURE_MOBILE_CARD_WIDTH_CLASS_NAME = 'w-full max-sm:max-w-none';
/** Matches `ProductsCatalogCard` / `UpcomingProductsSection` mobile card elevation. */
const CULTURE_CARD_SHADOW_CLASS_NAME = 'shadow-[0_4px_22.5px_rgba(0,0,0,0.08)]';
/** Slightly taller white surface on narrow viewports. */
const CULTURE_MOBILE_CARD_SURFACE_CLASS_NAME = 'max-sm:pb-[1.125rem]';
/** Shifts hero + text inside the white card; article background position stays fixed. */
const CULTURE_MOBILE_INNER_CONTENT_OFFSET_CLASS_NAME = 'max-sm:translate-y-4';
/** Nudges hero toward image-switch dots on narrow viewports. */
const CULTURE_MOBILE_IMAGE_FRAME_CLASS_NAME = 'max-sm:translate-y-5';
const CULTURE_MOBILE_DETAILS_OFFSET_CLASS_NAME = 'max-sm:-mt-[3.25rem]';
/** Dots, title, and category row — nudged down without moving the hero image. */
const CULTURE_MOBILE_META_BLOCK_OFFSET_CLASS_NAME = 'max-sm:mt-2';
const CULTURE_MOBILE_HERO_SCALE_CLASS_NAME = 'max-sm:scale-[1.32]';
const CULTURE_DOTS_ROW_CLASS_NAME =
  'mb-1 flex min-h-3 w-full items-center justify-center gap-1 sm:-mt-5 sm:mb-1 sm:gap-[0.3125rem]';
const CULTURE_COMPACT_EARLY_ACCESS_BUTTON_CLASS_NAME =
  'inline-flex h-[1.375rem] min-w-[2.75rem] items-center justify-center rounded-[0.4375rem] border-2 border-[#dcc090] px-1.5 text-[0.6875rem] font-extrabold leading-tight text-[#dcc090] transition-colors hover:bg-[#dcc090]/10 sm:h-auto sm:min-h-0 sm:rounded-lg sm:px-2 sm:py-1 sm:text-sm';

interface CultureVotingImageDotsProps {
  itemId: string;
  visibleDotCount: number;
  activeImageIndex: number;
  onSelect: (index: number) => void;
}

function CultureVotingImageDots({
  itemId,
  visibleDotCount,
  activeImageIndex,
  onSelect,
}: CultureVotingImageDotsProps) {
  if (visibleDotCount <= 0) {
    return <div className="min-h-3 sm:mb-2" aria-hidden />;
  }

  if (visibleDotCount === 1) {
    return (
      <div className={CULTURE_DOTS_ROW_CLASS_NAME} aria-hidden="true">
        <span className="block h-[0.25rem] w-[1.625rem] shrink-0 rounded-[0.15625rem] bg-[#122a26]" />
      </div>
    );
  }

  return (
    <div className={CULTURE_DOTS_ROW_CLASS_NAME} role="tablist" aria-label="Images">
      {Array.from({ length: visibleDotCount }).map((_, index) => {
        const isActive = index === activeImageIndex;
        return (
          <button
            key={`${itemId}-dot-${index}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(index)}
            className="relative flex h-3 w-[1.625rem] cursor-pointer items-center"
            aria-label={`Select image ${index + 1} of ${visibleDotCount}`}
          >
            <span
              className={`block h-[0.25rem] w-full rounded-[0.15625rem] transition-colors ${
                isActive ? 'bg-[#122a26]' : 'bg-[#d9d9d9]'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={1.8}
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21z"
      />
    </svg>
  );
}

function useCultureVotingCardGallery(images: string[], id: string) {
  const displayImages = useMemo(() => {
    const trimmed = images.map((u) => u.trim()).filter(Boolean);
    const unique = trimmed.filter((url, index, arr) => arr.indexOf(url) === index);
    return unique.slice(0, MAX_VOTING_GALLERY_IMAGES);
  }, [images]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const visibleDotCount = Math.min(displayImages.length, MAX_VOTING_GALLERY_IMAGES);
  const activeSrc = displayImages[activeImageIndex] ?? '';

  useEffect(() => {
    setActiveImageIndex(0);
  }, [id]);

  useEffect(() => {
    setActiveImageIndex((previous) => {
      if (displayImages.length === 0) {
        return 0;
      }
      return previous >= displayImages.length ? 0 : previous;
    });
  }, [id, displayImages.length]);

  useEffect(() => {
    setImageError(false);
  }, [activeImageIndex, id]);

  return {
    activeImageIndex,
    setActiveImageIndex,
    visibleDotCount,
    activeSrc,
    imageError,
    onHeroImageError: () => setImageError(true),
  };
}

export function CultureVotingCard({
  id,
  title,
  images,
  likedByCurrentUser,
  pending,
  earlyAccessPending = false,
  onToggleLike,
  onEarlyAccess,
  sizeLabel,
  variantLabel,
  variantTone = 'classic',
  showEarlyAccess = false,
  earlyAccessLabel = 'Early Access',
}: CultureVotingCardProps) {
  const {
    activeImageIndex,
    setActiveImageIndex,
    visibleDotCount,
    activeSrc,
    imageError,
    onHeroImageError,
  } = useCultureVotingCardGallery(images, id);

  const heartButtonClassName = `inline-flex shrink-0 items-center justify-center rounded-lg p-1.5 transition-colors sm:p-1 ${
    likedByCurrentUser
      ? 'text-[#731818] hover:bg-[#731818]/10'
      : 'text-[#CBCBCB] hover:bg-[#CBCBCB]/20'
  } ${pending ? 'cursor-not-allowed opacity-60' : ''}`;
  const variantToneClassName = VARIANT_TONE_CLASS_NAMES[variantTone];

  return (
    <article
      className={`relative z-0 mx-auto flex min-h-0 ${CULTURE_MOBILE_CARD_WIDTH_CLASS_NAME} flex-col overflow-visible rounded-[1.125rem] bg-white px-2.5 pb-2.5 pt-2 ${CULTURE_MOBILE_CARD_SURFACE_CLASS_NAME} ${CULTURE_CARD_SHADOW_CLASS_NAME} hover:z-[20] focus-within:z-[20] sm:h-full sm:max-w-[11.75rem] sm:rounded-3xl sm:px-3 sm:pt-2.5 sm:pb-5 lg:max-w-[11.6rem]`}
    >
      <div
        className={`flex min-h-0 flex-1 flex-col ${CULTURE_MOBILE_INNER_CONTENT_OFFSET_CLASS_NAME} sm:translate-y-0`}
      >
      <div className="relative z-10 mb-2 flex h-[14.75rem] shrink-0 items-end justify-center overflow-visible -mt-[5.125rem] sm:-mt-[4rem] sm:mb-1.5 sm:h-[14rem]">
        <div
          className={`relative h-[13.75rem] w-full ${CULTURE_MOBILE_IMAGE_FRAME_CLASS_NAME} sm:h-full`}
        >
          {activeSrc && !imageError ? (
            <img
              key={`${id}-${activeImageIndex}-${activeSrc}`}
              src={activeSrc}
              alt={title}
              className={`h-full w-full origin-bottom object-contain ${CULTURE_MOBILE_HERO_SCALE_CLASS_NAME} sm:translate-y-3 sm:scale-[1.44]`}
              loading="lazy"
              onError={onHeroImageError}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-[1rem] bg-[#f1f1ef] text-xs font-medium text-[#9d9d9d]">
              No image
            </div>
          )}
        </div>
      </div>

      <div
        className={`relative z-20 -mt-[2.75rem] flex min-h-0 flex-1 flex-col justify-between sm:mt-2 sm:pt-0 ${CULTURE_MOBILE_DETAILS_OFFSET_CLASS_NAME}`}
      >
        <div className={`min-w-0 ${CULTURE_MOBILE_META_BLOCK_OFFSET_CLASS_NAME}`}>
          <CultureVotingImageDots
            itemId={id}
            visibleDotCount={visibleDotCount}
            activeImageIndex={activeImageIndex}
            onSelect={setActiveImageIndex}
          />

          <h3 className="line-clamp-2 text-[0.9375rem] font-extrabold leading-tight text-[#414141] sm:text-[0.98rem] sm:leading-[1.1]">
            {title}
          </h3>

          {sizeLabel || variantLabel ? (
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {sizeLabel ? (
                  <span className="inline-flex items-center text-[0.5625rem] font-semibold leading-tight text-[#122a26] sm:text-[10px] sm:font-medium sm:text-[#9d9d9d]">
                    {sizeLabel}
                  </span>
                ) : null}
                {variantLabel ? (
                  <span
                    className={`rounded-[0.3125rem] px-[0.3125rem] py-px text-[0.5625rem] font-medium leading-tight text-white sm:rounded-md sm:px-1.5 sm:py-0.5 sm:text-[9px] sm:font-bold ${variantToneClassName}`}
                  >
                    {variantLabel}
                  </span>
                ) : null}
              </div>
              {!showEarlyAccess ? (
                <button
                  type="button"
                  onClick={() => onToggleLike(id, likedByCurrentUser)}
                  disabled={pending}
                  className={heartButtonClassName}
                  aria-pressed={likedByCurrentUser}
                  aria-label={likedByCurrentUser ? `Remove like from ${title}` : `Like ${title}`}
                >
                  <HeartIcon filled={likedByCurrentUser} />
                </button>
              ) : null}
            </div>
          ) : (
            !showEarlyAccess ? (
              <div className="mt-0.5 flex justify-end">
                <button
                  type="button"
                  onClick={() => onToggleLike(id, likedByCurrentUser)}
                  disabled={pending}
                  className={heartButtonClassName}
                  aria-pressed={likedByCurrentUser}
                  aria-label={likedByCurrentUser ? `Remove like from ${title}` : `Like ${title}`}
                >
                  <HeartIcon filled={likedByCurrentUser} />
                </button>
              </div>
            ) : null
          )}
        </div>

        {showEarlyAccess ? (
          <div className="mt-2 flex shrink-0 items-center justify-between gap-2 sm:mt-3">
            <button
              type="button"
              onClick={() => onEarlyAccess?.(id)}
              disabled={pending || earlyAccessPending}
              className={`whitespace-nowrap ${CULTURE_COMPACT_EARLY_ACCESS_BUTTON_CLASS_NAME} ${
                pending || earlyAccessPending ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
              }`}
              aria-label={earlyAccessLabel}
            >
              {earlyAccessLabel}
            </button>
            <button
              type="button"
              onClick={() => onToggleLike(id, likedByCurrentUser)}
              disabled={pending}
              className={heartButtonClassName}
              aria-pressed={likedByCurrentUser}
              aria-label={likedByCurrentUser ? `Remove like from ${title}` : `Like ${title}`}
            >
              <HeartIcon filled={likedByCurrentUser} />
            </button>
          </div>
        ) : null}
      </div>
      </div>
    </article>
  );
}
