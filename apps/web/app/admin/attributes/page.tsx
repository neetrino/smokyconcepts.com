'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth/AuthContext';
import { Card } from '@shop/ui';
import { useTranslation } from '../../../lib/i18n-client';
import { AdminSidebar } from '../categories/components/AdminSidebar';
import { CategoryAttributesEditor } from './components/CategoryAttributesEditor';

export default function AdminAttributesPage() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn || !isAdmin) {
        router.push('/admin');
      }
    }
  }, [isLoggedIn, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('admin.common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.attributes.title')}</h1>
          <p className="mt-2 text-sm text-gray-600">{t('admin.attributes.subtitlePage')}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <AdminSidebar t={t} />

          <div className="flex-1 min-w-0">
            <Card className="p-6">
              <CategoryAttributesEditor />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
