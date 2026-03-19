import Link from 'next/link';

interface HomeActionButtonProps {
  href: string;
  label: string;
  variant?: 'filled' | 'outline';
  className?: string;
}

const VARIANT_CLASS_NAMES = {
  filled: 'bg-[#dcc090] text-[#122a26] hover:bg-[#d3b57c]',
  outline: 'border-2 border-[#dcc090] text-[#dcc090] hover:bg-[#dcc090]/10',
} as const;

/**
 * Shared CTA button for homepage sections.
 */
export function HomeActionButton({
  href,
  label,
  variant = 'filled',
  className = '',
}: HomeActionButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center rounded-lg px-6 text-base font-extrabold uppercase tracking-[0.2em] transition-colors sm:px-8 ${VARIANT_CLASS_NAMES[variant]} ${className}`.trim()}
    >
      {label}
    </Link>
  );
}
