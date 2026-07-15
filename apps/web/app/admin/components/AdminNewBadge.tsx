'use client';

interface AdminNewBadgeProps {
  label: string;
}

/** Inline "new" marker for admin list rows (orders, messages). */
export function AdminNewBadge({ label }: AdminNewBadgeProps) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-[#c45c4a] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
      {label}
    </span>
  );
}
