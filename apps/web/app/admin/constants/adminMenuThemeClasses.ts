import type { AdminTheme } from '@/app/admin/types/admin-theme.types';

/** Desktop sidebar nav container */
export function adminNavContainerClass(theme: AdminTheme): string {
  const base = 'rounded-lg p-2 space-y-1 border';
  return theme === 'dark'
    ? `${base} bg-gray-900 border-gray-700`
    : `${base} bg-white border-gray-200`;
}

export function adminNavItemActiveClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'bg-gray-100 text-gray-900'
    : 'bg-gray-900 text-white';
}

export function adminNavItemInactiveClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';
}

export function adminNavIconClass(isActive: boolean, theme: AdminTheme): string {
  const base = 'flex-shrink-0';
  if (isActive) {
    return `${base} ${theme === 'dark' ? 'text-gray-900' : 'text-white'}`;
  }
  return `${base} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`;
}

export function adminNavDividerClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'pt-2 mt-1 border-t border-gray-700'
    : 'pt-2 mt-1 border-t border-gray-200';
}

/** Mobile menu trigger */
export function adminDrawerTriggerClass(theme: AdminTheme): string {
  const base =
    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-wide shadow-sm';
  return theme === 'dark'
    ? `${base} border-gray-600 bg-gray-900 text-gray-100`
    : `${base} border-gray-200 bg-white text-gray-800`;
}

export function adminDrawerPanelClass(theme: AdminTheme): string {
  const base =
    'h-full min-h-screen w-1/2 min-w-[16rem] max-w-full flex flex-col shadow-2xl';
  return theme === 'dark' ? `${base} bg-gray-900` : `${base} bg-white`;
}

export function adminDrawerHeaderRowClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'flex items-center justify-between gap-2 border-b border-gray-700 px-5 py-4'
    : 'flex items-center justify-between gap-2 border-b border-gray-200 px-5 py-4';
}

export function adminDrawerTitleClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'text-lg font-semibold text-gray-100'
    : 'text-lg font-semibold text-gray-900';
}

export function adminDrawerCloseButtonClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'h-10 w-10 rounded-full border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-gray-100'
    : 'h-10 w-10 rounded-full border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900';
}

export function adminDrawerListClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'flex-1 overflow-y-auto divide-y divide-gray-800'
    : 'flex-1 overflow-y-auto divide-y divide-gray-100';
}

export function adminDrawerRowActiveClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'bg-gray-100 text-gray-900'
    : 'bg-gray-900 text-white';
}

export function adminDrawerRowInactiveClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'text-gray-300 hover:bg-gray-800'
    : 'text-gray-700 hover:bg-gray-50';
}

export function adminDrawerRowIconClass(isActive: boolean, theme: AdminTheme): string {
  if (isActive) {
    return theme === 'dark' ? 'text-gray-900' : 'text-white';
  }
  return theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
}

export function adminDrawerChevronClass(isActive: boolean, theme: AdminTheme): string {
  const base = 'w-4 h-4';
  if (isActive) {
    return `${base} ${theme === 'dark' ? 'text-gray-900' : 'text-white'}`;
  }
  return `${base} ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`;
}

export function adminThemeToggleButtonSidebarClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'w-full border border-gray-600 bg-gray-800/80 px-3 py-2.5 text-amber-200 hover:bg-gray-800'
    : 'w-full border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-800 hover:bg-gray-100';
}

export function adminThemeToggleButtonDrawerClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'h-10 w-10 border border-gray-600 bg-gray-800 text-amber-200 hover:bg-gray-700'
    : 'h-10 w-10 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50';
}

export function adminThemeToggleFocusRingClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'focus-visible:outline-gray-100'
    : 'focus-visible:outline-gray-900';
}
