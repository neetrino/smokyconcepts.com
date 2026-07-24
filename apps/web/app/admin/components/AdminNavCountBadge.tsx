'use client';

interface AdminNavCountBadgeProps {
  count: number;
}

const MAX_DISPLAY_COUNT = 99;

/** Sidebar / drawer unread count pill. */
export function AdminNavCountBadge({ count }: AdminNavCountBadgeProps) {
  if (count <= 0) {
    return null;
  }

  const display = count > MAX_DISPLAY_COUNT ? `${MAX_DISPLAY_COUNT}+` : String(count);

  return (
    <span
      className="ml-auto inline-flex min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-[#c45c4a] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white"
      aria-label={display}
    >
      {display}
    </span>
  );
}
