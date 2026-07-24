'use client';

import { useRouter, usePathname } from 'next/navigation';
import { AdminMenuDrawer } from '../../../../components/AdminMenuDrawer';
import { getAdminMenuTABS } from '../../admin-menu.config';
import {
  adminNavContainerClass,
  adminNavIconClass,
  adminNavItemActiveClass,
  adminNavItemInactiveClass,
} from '../../constants/adminMenuThemeClasses';
import {
  ADMIN_FIXED_SIDEBAR_CLASS,
  ADMIN_FIXED_SIDEBAR_SPACER_CLASS,
} from '../../constants/adminShell.constants';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { getAdminSidebarNavIndentClass } from '../../utils/adminMenuIndent';

interface AdminSidebarProps {
  t: (key: string) => string;
}

export function AdminSidebar({ t }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useAdminTheme();
  const adminTabs = getAdminMenuTABS(t);

  return (
    <>
      <div className="lg:hidden mb-6">
        <AdminMenuDrawer tabs={adminTabs} currentPath={pathname || '/supersudo/analytics'} />
      </div>
      <aside className={ADMIN_FIXED_SIDEBAR_CLASS}>
        <nav className={adminNavContainerClass(theme)}>
          {adminTabs.map((tab) => {
            const isActive =
              pathname === tab.path ||
              (tab.path === '/supersudo' && pathname === '/supersudo') ||
              (tab.path !== '/supersudo' && pathname?.startsWith(tab.path));
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  router.push(tab.path);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${getAdminSidebarNavIndentClass(
                  tab
                )} ${isActive ? adminNavItemActiveClass(theme) : adminNavItemInactiveClass(theme)}`}
              >
                <span className={adminNavIconClass(isActive, theme)}>{tab.icon}</span>
                <span className="text-left">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <div className={ADMIN_FIXED_SIDEBAR_SPACER_CLASS} aria-hidden="true" />
    </>
  );
}
