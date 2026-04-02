'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ADMIN_THEME_STORAGE_KEY } from '@/app/admin/constants/adminShell.constants';
import type { AdminTheme } from '@/app/admin/types/admin-theme.types';

export type { AdminTheme };

type AdminThemeContextValue = {
  theme: AdminTheme;
  setTheme: (next: AdminTheme) => void;
  toggleTheme: () => void;
};

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>('light');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        setThemeState(stored);
      }
    } catch {
      // storage unavailable
    }
  }, []);

  const setTheme = useCallback((next: AdminTheme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(ADMIN_THEME_STORAGE_KEY, next);
    } catch {
      // storage unavailable
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: AdminTheme = prev === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(ADMIN_THEME_STORAGE_KEY, next);
      } catch {
        // storage unavailable
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
}

export function useAdminTheme(): AdminThemeContextValue {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider');
  }
  return ctx;
}
