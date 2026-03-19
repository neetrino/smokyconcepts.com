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
}: CultureVotingCardProps) {
  const imageNudgeClassName = imageNudgeDown ? 'translate-y-4' : '';
  return (
    <article className="relative z-10 w-full max-w-[15rem] overflow-visible rounded-3xl bg-white p-4 lg:max-w-none">
      <div className={`relative z-10 -mt-24 mb-2 h-72 overflow-visible rounded-2xl ${imageNudgeClassName}`.trim()}>
        <img src={imageUrl} alt={title} className="h-full w-full object-cover" loading="lazy" />
      </div>

      <div className="mt-4 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-[1.6rem] font-extrabold leading-none text-[#414141] line-clamp-2">{title}</h3>
          <p className="mt-2 text-xs font-medium text-[#9d9d9d]">
            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onToggleLike(id, likedByCurrentUser)}
          disabled={pending}
          className={`shrink-0 inline-flex items-center justify-center rounded-lg p-1.5 transition-colors ${
            likedByCurrentUser ? 'text-red-500' : 'text-[#dcc090] hover:bg-[#dcc090]/10'
          } ${pending ? 'cursor-not-allowed opacity-60' : ''}`}
          aria-pressed={likedByCurrentUser}
          aria-label={likedByCurrentUser ? `Remove like from ${title}` : `Like ${title}`}
        >
          <HeartIcon filled={likedByCurrentUser} />
        </button>
      </div>
    </article>
  );
}
