'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  adminDrawerChevronClass,
  adminDrawerCloseButtonClass,
  adminDrawerHeaderRowClass,
  adminDrawerListClass,
  adminDrawerPanelClass,
  adminDrawerRowActiveClass,
  adminDrawerRowIconClass,
  adminDrawerRowInactiveClass,
  adminDrawerTriggerClass,
} from '@/app/admin/constants/adminMenuThemeClasses';
import { useAdminTheme } from '@/app/admin/context/AdminThemeContext';
import { getAdminDrawerNavIndentClass } from '@/app/admin/utils/adminMenuIndent';

export interface AdminMenuItem {
  id: string;
  label: string;
  path: string;
  icon?: ReactNode;
  isSubCategory?: boolean;
  /** Indented further under a sub-category (e.g. Sizes under Attributes). */
  isNestedSubCategory?: boolean;
  /** ID of the parent menu item this belongs to (for collapsible groups). */
  parentId?: string;
}

interface AdminMenuDrawerProps {
  tabs: AdminMenuItem[];
  currentPath: string;
}

export function AdminMenuDrawer({ tabs, currentPath }: AdminMenuDrawerProps) {
  const router = useRouter();
  const { theme } = useAdminTheme();
  const [open, setOpen] = useState(false);

  const parentIds = new Set(tabs.filter((tab) => tab.parentId).map((tab) => tab.parentId!));

  const getInitialExpanded = () => {
    const expanded = new Set<string>();
    tabs.forEach((tab) => {
      if (tab.parentId && currentPath.startsWith(tab.path)) {
        expanded.add(tab.parentId);
      }
    });
    return expanded;
  };

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(getInitialExpanded);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
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
          onClick={() => setOpen(false)}
        >
          <div
            className={adminDrawerPanelClass(theme)}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={adminDrawerHeaderRowClass(theme)}>
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="inline-flex items-center pl-2"
                aria-label="Go to home page"
              >
                <img
                  src="/assets/home/Logo%20Full.webp"
                  alt="Home"
                  className="h-7 w-auto max-w-[120px] object-contain"
                />
              </Link>
              <div className="flex flex-shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
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
                // Hide children when parent is collapsed
                if (tab.parentId && !expandedGroups.has(tab.parentId)) return null;

                const isActive =
                  currentPath === tab.path ||
                  (tab.path === '/' && currentPath === '/') ||
                  (tab.path === '/supersudo' && currentPath === '/supersudo') ||
                  (tab.path !== '/' && tab.path !== '/supersudo' && currentPath.startsWith(tab.path));

                const isParent = parentIds.has(tab.id);
                const isExpanded = expandedGroups.has(tab.id);

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      if (isParent) {
                        toggleGroup(tab.id);
                        return;
                      }
                      handleNavigate(tab.path);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium ${getAdminDrawerNavIndentClass(tab)} ${isActive ? adminDrawerRowActiveClass(theme) : adminDrawerRowInactiveClass(theme)}`}
                  >
                    <span className="flex items-center gap-3">
                      {tab.icon ? (
                        <span className={adminDrawerRowIconClass(isActive, theme)}>{tab.icon}</span>
                      ) : null}
                      {tab.label}
                    </span>
                    {isParent ? (
                      <svg
                        className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} ${adminDrawerChevronClass(isActive, theme)}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    ) : (
                      <svg
                        className={adminDrawerChevronClass(isActive, theme)}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
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
