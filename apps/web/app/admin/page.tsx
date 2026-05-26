'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth/AuthContext';
import { useTranslation } from '../../lib/i18n-client';
import { AdminSidebar } from './components/AdminSidebar';
import { useAdminMobileHubRedirect } from './hooks/useAdminMobileHubRedirect';
import { StatsGrid } from './components/StatsGrid';
import { RecentOrdersCard } from './components/RecentOrdersCard';
import { TopProductsCard } from './components/TopProductsCard';
import { UserActivityCard } from './components/UserActivityCard';
import { useAdminDashboard } from './hooks/useAdminDashboard';
import { ADMIN_CENTERED_LOADING_CLASS, ADMIN_PAGE_SHELL_CLASS } from './constants/adminShell.constants';

export default function AdminPanel() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const {
    stats,
    recentOrders,
    topProducts,
    userActivity,
    statsLoading,
    recentOrdersLoading,
    topProductsLoading,
    userActivityLoading,
  } = useAdminDashboard({
    isLoggedIn,
    isAdmin,
    isLoading,
  });

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        console.log('❌ [ADMIN] User not logged in, redirecting to login...');
        router.push('/login');
        return;
      }
      if (!isAdmin) {
        console.log('❌ [ADMIN] User is not admin, redirecting to home...');
        router.push('/');
        return;
      }
    }
  }, [isLoggedIn, isAdmin, isLoading, router]);

  const [currentPath, setCurrentPath] = useState(pathname || '/supersudo');

  useEffect(() => {
    if (pathname) {
      setCurrentPath(pathname);
    }
  }, [pathname]);

  useAdminMobileHubRedirect({ enabled: !isLoading && isLoggedIn && isAdmin });

  if (isLoading) {
    return (
      <div className={ADMIN_CENTERED_LOADING_CLASS}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">{t('admin.common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  return (
    <div className={ADMIN_PAGE_SHELL_CLASS}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="hidden lg:contents">
            <AdminSidebar currentPath={currentPath} router={router} t={t} />
          </div>

          <div className="hidden min-w-0 flex-1 lg:block">
            <StatsGrid stats={stats} statsLoading={statsLoading} />

            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <RecentOrdersCard recentOrders={recentOrders} recentOrdersLoading={recentOrdersLoading} />
              <TopProductsCard topProducts={topProducts} topProductsLoading={topProductsLoading} />
            </div>

            <UserActivityCard userActivity={userActivity} userActivityLoading={userActivityLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
