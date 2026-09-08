'use client';

import { useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Button } from '@shop/ui';

import { useAuth } from '../../../../lib/auth/AuthContext';
import { useTranslation } from '../../../../lib/i18n-client';
import { AdminSidebar } from '../../components/AdminSidebar';
import { useVotingDetail } from '../hooks/useVotingDetail';

export default function VotingDetailPage() {
  const params = useParams();
  const votingId = typeof params?.votingId === 'string' ? params.votingId : undefined;

  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { voting, loading, fetchDetail } = useVotingDetail(votingId);

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || !isAdmin)) {
      router.push('/supersudo');
    }
  }, [isAdmin, isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn && isAdmin && votingId) {
      fetchDetail().catch(() => undefined);
    }
  }, [fetchDetail, isAdmin, isLoggedIn, votingId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
          <p className="text-gray-600">{t('admin.common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  if (!votingId) {
    return null;
  }

  if (!loading && !voting) {
    return (
      <div className="min-h-screen bg-[#efefef] pt-[3.75rem] pb-8">
        <div className="mx-auto max-w-lg px-4 text-center">
          <p className="text-gray-700">{t('admin.voting.votingNotFound')}</p>
          <Button variant="primary" className="mt-4" onClick={() => router.push('/supersudo/voting')}>
            {t('admin.voting.backToVotingList')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efefef] pt-[3.75rem] pb-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="hidden">
          <button
            type="button"
            onClick={() => router.push('/supersudo/voting')}
            className="mb-4 flex items-center text-gray-600 transition-colors duration-200 hover:text-gray-900"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('admin.voting.backToVotingList')}
          </button>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{voting?.title ?? '—'}</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <AdminSidebar currentPath={pathname || '/supersudo/voting'} t={t} />

          <div className="min-w-0 flex-1" />
        </div>
      </div>
    </div>
  );
}
