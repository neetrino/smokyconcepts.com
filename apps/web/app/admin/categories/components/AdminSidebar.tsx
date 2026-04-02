'use client';

import { useRouter, usePathname } from 'next/navigation';
import { AdminMenuDrawer } from '../../../../components/AdminMenuDrawer';
import { getAdminMenuTABS } from '../../admin-menu.config';
import {
  adminNavContainerClass,
  adminNavDividerClass,
  adminNavIconClass,
  adminNavItemActiveClass,
  adminNavItemInactiveClass,
} from '../../constants/adminMenuThemeClasses';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { AdminThemeToggleButton } from '../../components/AdminThemeToggleButton';

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
        <AdminMenuDrawer tabs={adminTabs} currentPath={pathname || '/admin/categories'} />
      </div>
      <aside className="hidden lg:block lg:w-64 flex-shrink-0">
        <nav className={adminNavContainerClass(theme)}>
          {adminTabs.map((tab) => {
            const isActive =
              pathname === tab.path ||
              (tab.path === '/admin' && pathname === '/admin') ||
              (tab.path !== '/admin' && pathname?.startsWith(tab.path));
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  router.push(tab.path);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
                  tab.isSubCategory ? 'pl-12' : ''
                } ${isActive ? adminNavItemActiveClass(theme) : adminNavItemInactiveClass(theme)}`}
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
    </>
  );
}
