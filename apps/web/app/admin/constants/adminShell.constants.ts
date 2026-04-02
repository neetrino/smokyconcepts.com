/** localStorage key for admin panel light/dark preference */
export const ADMIN_THEME_STORAGE_KEY = 'smoky-admin-theme' as const;

/** Outer wrapper for most admin pages (under AdminThemeProvider `.dark` ancestor) */
export const ADMIN_PAGE_SHELL_CLASS = 'min-h-screen bg-gray-50 py-8' as const;

/** Full-screen centered loading state */
export const ADMIN_CENTERED_LOADING_CLASS =
  'min-h-screen flex items-center justify-center' as const;
