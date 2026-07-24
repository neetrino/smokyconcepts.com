'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminMenuDrawer } from '../../../components/AdminMenuDrawer';
import { getAdminMenuTABS } from '../admin-menu.config';
import {
  adminNavContainerClass,
  adminNavIconClass,
  adminNavItemActiveClass,
  adminNavItemInactiveClass,
} from '../constants/adminMenuThemeClasses';
import {
  ADMIN_FIXED_SIDEBAR_CLASS,
  ADMIN_FIXED_SIDEBAR_SPACER_CLASS,
} from '../constants/adminShell.constants';
import { useAdminTheme } from '../context/AdminThemeContext';
import { getAdminSidebarNavIndentClass } from '../utils/adminMenuIndent';

interface AdminSidebarProps {
  currentPath: string;
  router: ReturnType<typeof useRouter>;
  t: ReturnType<typeof import('../../../lib/i18n-client').useTranslation>['t'];
}

export function AdminSidebar({ currentPath, router, t }: AdminSidebarProps) {
  const { theme } = useAdminTheme();
  const adminTabs = getAdminMenuTABS(t);

  // Compute which tab IDs have children
  const parentIds = new Set(adminTabs.filter((tab) => tab.parentId).map((tab) => tab.parentId!));

  // Auto-expand groups whose child paths match currentPath
  const getInitialExpanded = () => {
    const expanded = new Set<string>();
    adminTabs.forEach((tab) => {
      if (tab.parentId && currentPath.startsWith(tab.path)) {
        expanded.add(tab.parentId);
      }
    });
    return expanded;
  };

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(getInitialExpanded);

  // Keep expanded in sync when navigating
  useEffect(() => {
    adminTabs.forEach((tab) => {
      if (tab.parentId && currentPath.startsWith(tab.path)) {
        setExpandedGroups((prev) => {
          if (prev.has(tab.parentId!)) return prev;
          return new Set([...prev, tab.parentId!]);
        });
      }
    });
  }, [currentPath]);

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  return (
    <>
      <div className="lg:hidden mb-6">
        <AdminMenuDrawer tabs={adminTabs} currentPath={currentPath} />
      </div>
      <aside className={ADMIN_FIXED_SIDEBAR_CLASS}>
        <nav className={adminNavContainerClass(theme)}>
          <Link
            href="/"
            className="mb-4 inline-flex items-center rounded-md px-2 py-2 ml-2"
            aria-label="Go to home page"
          >
            <img
              src="/assets/home/Logo%20Full.webp"
              alt="Home"
              className="h-7 w-auto max-w-[120px] object-contain"
            />
          </Link>
          {adminTabs.map((tab) => {
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
                  router.push(tab.path);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${getAdminSidebarNavIndentClass(tab)} ${isActive ? adminNavItemActiveClass(theme) : adminNavItemInactiveClass(theme)}`}
              >
                {tab.icon ? (
                  <span className={adminNavIconClass(isActive, theme)}>{tab.icon}</span>
                ) : null}
                <span className="flex-1 text-left">{tab.label}</span>
                {isParent && (
                  <svg
                    className={`h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200 ${
                      isExpanded ? 'rotate-90' : ''
                    } ${isActive ? 'text-[#122a26]' : 'text-[#dcc090]/50'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
      <div className={ADMIN_FIXED_SIDEBAR_SPACER_CLASS} aria-hidden="true" />
    </>
  );
}
