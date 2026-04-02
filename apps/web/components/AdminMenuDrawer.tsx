'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminThemeToggleButton } from '@/app/admin/components/AdminThemeToggleButton';
import {
  adminDrawerChevronClass,
  adminDrawerCloseButtonClass,
  adminDrawerHeaderRowClass,
  adminDrawerListClass,
  adminDrawerPanelClass,
  adminDrawerRowActiveClass,
  adminDrawerRowIconClass,
  adminDrawerRowInactiveClass,
  adminDrawerTitleClass,
  adminDrawerTriggerClass,
} from '@/app/admin/constants/adminMenuThemeClasses';
import { useAdminTheme } from '@/app/admin/context/AdminThemeContext';

export interface AdminMenuItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
  isSubCategory?: boolean;
}

interface AdminMenuDrawerProps {
  tabs: AdminMenuItem[];
  currentPath: string;
}

/**
 * Renders a mobile-friendly admin hamburger menu that mirrors the desktop sidebar.
 */
export function AdminMenuDrawer({ tabs, currentPath }: AdminMenuDrawerProps) {
  const router = useRouter();
  const { theme } = useAdminTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      console.info('[AdminMenuDrawer] Locking body scroll for open drawer');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleNavigate = (path: string) => {
    console.info('[AdminMenuDrawer] Navigating to admin path', { path });
    router.push(path);
    setOpen(false);
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => {
          console.info('[AdminMenuDrawer] Toggling drawer', { open: !open });
          setOpen(true);
        }}
        className={adminDrawerTriggerClass(theme)}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6H20M4 12H16M4 18H12" />
        </svg>
        Menu
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-sm"
          onClick={() => {
            console.info('[AdminMenuDrawer] Closing drawer from backdrop');
            setOpen(false);
          }}
        >
          <div
            className={adminDrawerPanelClass(theme)}
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={adminDrawerHeaderRowClass(theme)}>
              <p className={adminDrawerTitleClass(theme)}>Admin Navigation</p>
              <div className="flex flex-shrink-0 items-center gap-2">
                <AdminThemeToggleButton variant="drawer" />
                <button
                  type="button"
                  onClick={() => {
                    console.info('[AdminMenuDrawer] Closing drawer from close button');
                    setOpen(false);
                  }}
                  className={adminDrawerCloseButtonClass(theme)}
                  aria-label="Close admin menu"
                >
                  <svg className="mx-auto h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={adminDrawerListClass(theme)}>
              {tabs.map((tab) => {
                const isActive =
                  currentPath === tab.path ||
                  (tab.path === '/admin' && currentPath === '/admin') ||
                  (tab.path !== '/admin' && currentPath.startsWith(tab.path));

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleNavigate(tab.path)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium ${
                      tab.isSubCategory ? 'pl-8' : ''
                    } ${isActive ? adminDrawerRowActiveClass(theme) : adminDrawerRowInactiveClass(theme)}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={adminDrawerRowIconClass(isActive, theme)}>{tab.icon}</span>
                      {tab.label}
                    </span>
                    <svg
                      className={adminDrawerChevronClass(isActive, theme)}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
