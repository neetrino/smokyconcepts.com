'use client';

interface CultureVotingCardProps {
  id: string;
  title: string;
  imageUrl: string;
  likeCount: number;
  likedByCurrentUser: boolean;
  pending: boolean;
  onToggleLike: (itemId: string, likedByCurrentUser: boolean) => Promise<void>;
  /** Slight downward offset for the image (e.g. middle card). */
  imageNudgeDown?: boolean;
  /** Keep mobile heart icon inside the card. */
  mobileLikeInside?: boolean;
  /** Make mobile card back area slightly smaller. */
  mobileCompactBack?: boolean;
  sizeLabel?: string;
  variantLabel?: string;
  showEarlyAccess?: boolean;
  earlyAccessLabel?: string;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
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

export function CultureVotingCard({
  id,
  title,
  imageUrl,
  likeCount,
  likedByCurrentUser,
  pending,
  onToggleLike,
  imageNudgeDown = false,
  mobileLikeInside = false,
  mobileCompactBack = false,
  sizeLabel,
  variantLabel,
  showEarlyAccess = false,
  earlyAccessLabel = 'Early Access',
}: CultureVotingCardProps) {
  const imageNudgeClassName = imageNudgeDown ? 'translate-y-4' : '';
  const mobileTopPaddingClassName = mobileCompactBack ? 'pt-[8.25rem]' : 'pt-[9.25rem]';
  const mobileContentOffsetClassName = mobileCompactBack ? 'translate-y-1' : 'translate-y-0';
  const mobileTitleOffsetClassName = mobileCompactBack ? 'translate-y-1' : '';
  return (
    <article
      className={`relative z-10 mx-auto w-full max-w-[9.25rem] overflow-visible rounded-3xl bg-white p-3 ${mobileTopPaddingClassName} sm:max-w-[15rem] sm:p-4 sm:pt-4 lg:max-w-none`}
    >
      <div
        className={`absolute left-3 right-3 top-[-3.5rem] z-10 h-60 overflow-visible rounded-2xl sm:relative sm:left-auto sm:right-auto sm:top-auto sm:-mt-24 sm:mb-2 sm:h-72 ${imageNudgeClassName}`.trim()}
      >
        <img src={imageUrl} alt={title} className="h-full w-full object-cover" loading="lazy" />
      </div>

      <div className={`mt-0 ${mobileContentOffsetClassName} flex items-start justify-between gap-2 sm:mt-4 sm:translate-y-0`}>
        <div className="min-w-0 flex-1">
          <h3
            className={`min-h-[2.1rem] text-[16px] font-extrabold leading-[1.15] text-[#414141] line-clamp-2 sm:min-h-0 sm:text-xl sm:leading-none ${mobileTitleOffsetClassName}`}
          >
            {title}
          </h3>
          {sizeLabel || variantLabel ? (
            <div className="mt-0 flex items-center gap-1.5 sm:mt-2">
              {sizeLabel ? <span className="whitespace-nowrap text-xs font-medium text-[#9d9d9d]">{sizeLabel}</span> : null}
              {variantLabel ? (
                <span className="rounded-md bg-[#122a26] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  {variantLabel}
                </span>
              ) : null}
            </div>
          ) : null}
          {showEarlyAccess ? (
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="whitespace-nowrap rounded-md border border-[#dcc090] px-1.5 py-0.5 text-xs font-bold leading-none text-[#dcc090]">
                {earlyAccessLabel}
              </span>
              {mobileLikeInside ? (
                <button
                  type="button"
                  onClick={() => onToggleLike(id, likedByCurrentUser)}
                  disabled={pending}
                  className={`inline-flex items-center justify-center rounded-lg p-1 transition-colors sm:hidden ${
                    likedByCurrentUser ? 'text-red-500' : 'text-[#d9d9d9]'
                  } ${pending ? 'cursor-not-allowed opacity-60' : ''}`}
                  aria-pressed={likedByCurrentUser}
                  aria-label={likedByCurrentUser ? `Remove like from ${title}` : `Like ${title}`}
                >
                  <HeartIcon filled={likedByCurrentUser} />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => onToggleLike(id, likedByCurrentUser)}
          disabled={pending}
          className={`${mobileLikeInside ? 'hidden sm:inline-flex' : 'hidden'} shrink-0 items-center justify-center rounded-lg p-1.5 transition-colors sm:mt-0 ${
            likedByCurrentUser ? 'text-red-500' : 'text-[#dcc090] hover:bg-[#dcc090]/10'
          } ${pending ? 'cursor-not-allowed opacity-60' : ''}`}
          aria-pressed={likedByCurrentUser}
          aria-label={likedByCurrentUser ? `Remove like from ${title}` : `Like ${title}`}
        >
          <HeartIcon filled={likedByCurrentUser} />
        </button>
      </div>

      {!mobileLikeInside ? (
        <button
          type="button"
          onClick={() => onToggleLike(id, likedByCurrentUser)}
          disabled={pending}
          className={`absolute left-1/2 top-full mt-1 inline-flex -translate-x-1/2 items-center justify-center rounded-lg p-1 transition-colors ${
            likedByCurrentUser ? 'text-red-500' : 'text-[#d9d9d9]'
          } ${pending ? 'cursor-not-allowed opacity-60' : ''}`}
          aria-pressed={likedByCurrentUser}
          aria-label={likedByCurrentUser ? `Remove like from ${title}` : `Like ${title}`}
        >
          <HeartIcon filled={likedByCurrentUser} />
        </button>
      ) : null}
    </article>
  );
}
