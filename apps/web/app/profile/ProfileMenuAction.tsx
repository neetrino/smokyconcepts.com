import type { ReactNode } from 'react';

type ProfileMenuActionVariant = 'default' | 'danger';

interface ProfileMenuActionProps {
  label: string;
  icon: ReactNode;
  variant?: ProfileMenuActionVariant;
  isActive?: boolean;
  onClick: () => void;
}

const ICON_BOX_BASE =
  'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors';

function iconBoxClass(variant: ProfileMenuActionVariant, isActive: boolean): string {
  if (variant === 'danger') {
    return `${ICON_BOX_BASE} bg-red-50 text-red-500`;
  }

  if (isActive) {
    return `${ICON_BOX_BASE} bg-[#122a26]/10 text-[#122a26]`;
  }

  return `${ICON_BOX_BASE} bg-gray-100 text-[#414141]/70`;
}

function labelClass(variant: ProfileMenuActionVariant, isActive: boolean): string {
  if (variant === 'danger') {
    return 'text-red-500';
  }

  if (isActive) {
    return 'text-[#122a26]';
  }

  return 'text-[#414141]';
}

/**
 * Shared profile sidebar / drawer action row matching the design spec.
 */
export function ProfileMenuAction({
  label,
  icon,
  variant = 'default',
  isActive = false,
  onClick,
}: ProfileMenuActionProps) {
  const rowClass =
    variant === 'danger'
      ? 'hover:bg-red-50/60'
      : isActive
        ? 'bg-[#dcc090] text-[#122a26]'
        : 'hover:bg-[#dcc090]/12 hover:text-[#122a26]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-all ${rowClass}`}
    >
      <span className={iconBoxClass(variant, isActive)}>{icon}</span>
      <span className={`text-left ${labelClass(variant, isActive)}`}>{label}</span>
    </button>
  );
}
