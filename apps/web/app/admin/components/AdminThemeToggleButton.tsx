'use client';

import {
  adminThemeToggleButtonDrawerClass,
  adminThemeToggleButtonSidebarClass,
  adminThemeToggleFocusRingClass,
} from '@/app/admin/constants/adminMenuThemeClasses';
import { useAdminTheme } from '@/app/admin/context/AdminThemeContext';
import { useTranslation } from '@/lib/i18n-client';

const LAMP_ICON_CLASS = 'h-5 w-5' as const;

function LampIcon() {
  return (
    <svg
      className={LAMP_ICON_CLASS}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  );
}

type AdminThemeToggleButtonProps = {
  variant?: 'sidebar' | 'drawer';
};

/** Toggles admin menu light/dark appearance; preference is stored in localStorage. */
export function AdminThemeToggleButton({ variant = 'sidebar' }: AdminThemeToggleButtonProps) {
  const { theme, toggleTheme } = useAdminTheme();
  const { t } = useTranslation();
  const label =
    theme === 'dark'
      ? t('admin.common.themeSwitchToLight')
      : t('admin.common.themeSwitchToDark');

  const base =
    'inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

  const variantClass =
    variant === 'drawer'
      ? adminThemeToggleButtonDrawerClass(theme)
      : adminThemeToggleButtonSidebarClass(theme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`${base} ${adminThemeToggleFocusRingClass(theme)} ${variantClass}`}
      aria-label={label}
      title={label}
    >
      <span className="mx-auto inline-flex">
        <LampIcon />
      </span>
    </button>
  );
}
