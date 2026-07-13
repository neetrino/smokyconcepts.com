'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card } from '@shop/ui';
import { useTranslation } from '../../lib/i18n-client';
import { PageLoadingCenter } from '../../components/loading/PageLoadingCenter';
import { ResetPasswordForm } from './ResetPasswordForm';

function ResetPasswordContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';

  if (!token) {
    return (
      <Card className="p-8 bg-[#DCC090]/20">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('login.reset.title')}</h1>
        <p className="text-red-600 mb-6">{t('login.reset.errors.invalidToken')}</p>
        <Link href="/forgot-password" className="text-sm text-[#DCC090] hover:underline font-medium">
          {t('login.reset.requestNewLink')}
        </Link>
      </Card>
    );
  }

  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Suspense fallback={<PageLoadingCenter className="flex min-h-[40vh] items-center justify-center" />}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
