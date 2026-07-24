'use client';

import { useRouter } from 'next/navigation';
import { AdminMenuDrawer } from '../../../../components/AdminMenuDrawer';
import { getAdminMenuTABS } from '../../admin-menu.config';
import {
  adminNavContainerClass,
  adminNavDividerClass,
  adminNavIconClass,
  adminNavItemActiveClass,
  adminNavItemInactiveClass,
} from '../../constants/adminMenuThemeClasses';
import {
  ADMIN_FIXED_SIDEBAR_CLASS,
  ADMIN_FIXED_SIDEBAR_SPACER_CLASS,
} from '../../constants/adminShell.constants';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { AdminThemeToggleButton } from '../../components/AdminThemeToggleButton';
import { getAdminSidebarNavIndentClass } from '../../utils/adminMenuIndent';

interface AdminSidebarProps {
  currentPath: string;
  router: ReturnType<typeof useRouter>;
  t: ReturnType<typeof import('../../../../lib/i18n-client').useTranslation>['t'];
}

export function AdminSidebar({ currentPath, router, t }: AdminSidebarProps) {
  const { theme } = useAdminTheme();
  const adminTabs = getAdminMenuTABS(t);

  return (
    <>
      <div className="lg:hidden mb-6">
        <AdminMenuDrawer tabs={adminTabs} currentPath={currentPath} />
      </div>
      <aside className={ADMIN_FIXED_SIDEBAR_CLASS}>
        <nav className={adminNavContainerClass(theme)}>
          {adminTabs.map((tab) => {
            const isActive =
              currentPath === tab.path ||
              (tab.path === '/supersudo' && currentPath === '/supersudo') ||
              (tab.path !== '/supersudo' && currentPath.startsWith(tab.path));
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
          <div className={adminNavDividerClass(theme)}>
            <AdminThemeToggleButton variant="sidebar" />
          </div>
        </nav>
      </aside>
      <div className={ADMIN_FIXED_SIDEBAR_SPACER_CLASS} aria-hidden="true" />
    </>
  );
}
