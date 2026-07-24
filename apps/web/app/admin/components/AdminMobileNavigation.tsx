'use client';

import { AdminMenuDrawer } from '@/components/AdminMenuDrawer';
import { getAdminMobileMenuTabs } from '@/app/admin/admin-menu.config';
import { useTranslation } from '@/lib/i18n-client';

interface AdminMobileNavigationProps {
  currentPath: string;
}

/** Mobile admin nav: orders + analytics drawer. */
export function AdminMobileNavigation({ currentPath }: AdminMobileNavigationProps) {
  const { t } = useTranslation();
  const mobileTabs = getAdminMobileMenuTabs(t);

  return <AdminMenuDrawer tabs={mobileTabs} currentPath={currentPath} showLogout />;
}
