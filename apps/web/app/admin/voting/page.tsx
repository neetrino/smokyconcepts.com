'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Card, Input } from '@shop/ui';

import { showToast } from '../../../components/Toast';
import { apiClient } from '../../../lib/api-client';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useTranslation } from '../../../lib/i18n-client';
import { logger } from '../../../lib/utils/logger';
import { AdminSidebar } from '../components/AdminSidebar';

import { VotingFormModal } from './components/VotingFormModal';
import { useVotingActions } from './hooks/useVotingActions';
import { useVotingList } from './hooks/useVotingList';
import type { VotingItem } from './types';

export default function VotingPage() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { votings, loading, fetchVotings } = useVotingList();
  const [newVotingTitle, setNewVotingTitle] = useState('');
  const [savingVoting, setSavingVoting] = useState(false);
  const [busyVotingId, setBusyVotingId] = useState<string | null>(null);
  const [expandedVotingId, setExpandedVotingId] = useState<string | null>(null);
  const [selectedVotingId, setSelectedVotingId] = useState<string | null>(null);
  const {
    showAddModal,
    showEditModal,
    formData,
    saving,
    setShowAddModal,
    setShowEditModal,
    setFormData,
    resetForm,
    handleAddItem,
    handleEditItem,
    handleUpdateItem,
    handleDeleteItem,
  } = useVotingActions();

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || !isAdmin)) {
      router.push('/supersudo');
    }
  }, [isAdmin, isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchVotings().catch(() => undefined);
    }
  }, [fetchVotings, isAdmin, isLoggedIn]);

  const handleCreateVoting = useCallback(async () => {
    const title = newVotingTitle.trim();
    if (!title) {
      showToast(t('admin.voting.votingNameRequired'), 'warning');
      return;
    }

    setSavingVoting(true);

    try {
      await apiClient.post<{ data: { id: string } }>('/api/v1/admin/voting', {
        title,
      });
      setNewVotingTitle('');
      await fetchVotings();
      showToast(t('admin.voting.votingCreatedSuccess'), 'success');
    } catch (error: unknown) {
      logger.error('Error creating voting', { error });
      const message =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { detail?: string } }).data?.detail
          : t('admin.voting.errorCreatingVoting');
      showToast(message || t('admin.voting.errorCreatingVoting'), 'error');
    } finally {
      setSavingVoting(false);
    }
  }, [fetchVotings, newVotingTitle, t]);

  const togglePublished = useCallback(
    async (id: string, published: boolean) => {
      setBusyVotingId(id);

      try {
        await apiClient.patch(`/api/v1/admin/voting/${id}`, { published });
        await fetchVotings();
        showToast(t('admin.voting.publishStateUpdated'), 'success');
      } catch (error: unknown) {
        logger.error('Error updating voting publish state', { error });
        const message =
          error && typeof error === 'object' && 'data' in error
            ? (error as { data?: { detail?: string } }).data?.detail
            : t('admin.voting.errorUpdatingVoting');
        showToast(message || t('admin.voting.errorUpdatingVoting'), 'error');
      } finally {
        setBusyVotingId(null);
      }
    },
    [fetchVotings, t],
  );

  const deleteVoting = useCallback(
    async (id: string, name: string) => {
      if (!confirm(t('admin.voting.votingDeleteConfirm').replace('{name}', name))) {
        return;
      }

      setBusyVotingId(id);

      try {
        await apiClient.delete(`/api/v1/admin/voting/${id}`);
        await fetchVotings();
        showToast(t('admin.voting.votingDeletedSuccess'), 'success');
      } catch (error: unknown) {
        logger.error('Error deleting voting', { error });
        const message =
          error && typeof error === 'object' && 'data' in error
            ? (error as { data?: { detail?: string } }).data?.detail
            : t('admin.voting.errorDeletingVoting');
        showToast(message || t('admin.voting.errorDeletingVoting'), 'error');
      } finally {
        setBusyVotingId(null);
      }
    },
    [fetchVotings, t],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#122a26]" />
          <p className="text-[#414141]/70">{t('admin.common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#efefef] pt-[3.75rem] pb-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <AdminSidebar currentPath={pathname || '/supersudo/voting'} t={t} />

          <div className="min-w-0 flex-1 space-y-6">
            <Card className="border-[#dcc090]/30 bg-white/90 p-4 shadow-[0_8px_30px_rgba(18,42,38,0.06)] sm:p-6">
              <h2 className="text-lg font-semibold text-[#122a26]">{t('admin.voting.newVotingSection')}</h2>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-[#414141]/75">
                    {t('admin.voting.votingNameField')}
                  </label>
                  <Input
                    value={newVotingTitle}
                    onChange={(e) => setNewVotingTitle(e.target.value)}
                    placeholder={t('admin.voting.votingNamePlaceholder')}
                    disabled={savingVoting}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void handleCreateVoting();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => void handleCreateVoting()}
                  disabled={savingVoting || !newVotingTitle.trim()}
                >
                  {savingVoting ? t('admin.voting.creatingVoting') : t('admin.voting.createVoting')}
                </Button>
              </div>
            </Card>

            <Card className="border-[#dcc090]/30 bg-white/90 p-6 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
              {loading ? (
                <div className="py-10 text-center text-sm text-[#414141]/60">{t('admin.voting.loadingVotings')}</div>
              ) : votings.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-[#414141]/60">{t('admin.voting.noVotings')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {votings.map((voting) => {
                    const disabled = busyVotingId === voting.id;
                    const isExpanded = expandedVotingId === voting.id;

                    return (
                      <article key={voting.id} className="rounded-2xl border border-[#dcc090]/30 bg-white/80 shadow-sm transition-colors hover:border-[#dcc090]">
                        <button
                          type="button"
                          className="flex w-full items-start justify-between gap-3 p-4 text-left sm:p-5"
                          onClick={() => setExpandedVotingId((prev) => (prev === voting.id ? null : voting.id))}
                        >
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 rounded-xl border border-[#dcc090]/30 bg-[#dcc090]/15 p-1.5 text-[#122a26]">
                              <svg
                                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </span>
                            <div>
                              <h2 className="text-2xl font-semibold text-[#122a26]">{voting.title}</h2>
                              <p className="mt-1 text-sm text-[#414141]/60">
                                {voting.itemCount} {t('admin.voting.choicesLabel')} · {voting.totalLikes}{' '}
                                {t('admin.voting.likesLabel')}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              voting.published ? 'bg-[#122a26] text-[#dcc090]' : 'bg-[#dcc090]/35 text-[#122a26]'
                            }`}
                          >
                            {voting.published ? t('admin.voting.statusLive') : t('admin.voting.statusDraft')}
                          </span>
                        </button>

                        {isExpanded ? (
                          <div className="border-t border-[#dcc090]/25 p-4 sm:p-5">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                              {voting.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="overflow-hidden rounded-2xl border border-[#dcc090]/30 bg-white/80 p-4"
                                >
                                  <div className="h-28 overflow-hidden rounded-xl bg-[#dcc090]/15">
                                    <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                                  </div>
                                  <p className="mt-3 text-lg font-semibold text-[#122a26]">{item.title}</p>
                                  <p className="text-sm text-[#414141]/60">
                                    {item.likeCount} {t('admin.voting.likesLabel')}
                                  </p>
                                  <div className="mt-3 flex gap-2">
                                    <Button
                                      variant="ghost"
                                      className="flex-1"
                                      onClick={() =>
                                        handleEditItem({
                                          id: item.id,
                                          votingId: voting.id,
                                          title: item.title,
                                          imageUrl: item.imageUrl,
                                          galleryUrls: item.galleryUrls ?? [],
                                          productSlug: item.productSlug ?? null,
                                          likeCount: item.likeCount,
                                          topLiked: false,
                                          createdAt: '',
                                          updatedAt: '',
                                        } satisfies VotingItem)
                                      }
                                    >
                                      {t('admin.common.edit')}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                                      onClick={() =>
                                        handleDeleteItem(
                                          {
                                            id: item.id,
                                            votingId: voting.id,
                                            title: item.title,
                                            imageUrl: item.imageUrl,
                                            galleryUrls: item.galleryUrls ?? [],
                                            productSlug: item.productSlug ?? null,
                                            likeCount: item.likeCount,
                                            topLiked: false,
                                            createdAt: '',
                                            updatedAt: '',
                                          } satisfies VotingItem,
                                          fetchVotings,
                                        )
                                      }
                                    >
                                      {t('admin.common.delete')}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#dcc090]/25 pt-4">
                              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#414141]/75">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-[#dcc090]/40 text-[#122a26] focus:ring-[#dcc090]"
                                  checked={voting.published}
                                  disabled={disabled}
                                  onChange={() => togglePublished(voting.id, !voting.published)}
                                />
                                <span>{t('admin.voting.showOnHome')}</span>
                              </label>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="primary"
                                  className="min-w-[8rem]"
                                  onClick={() => {
                                    resetForm();
                                    setSelectedVotingId(voting.id);
                                    setShowAddModal(true);
                                  }}
                                  disabled={disabled}
                                >
                                  {t('admin.voting.addChoice')}
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => deleteVoting(voting.id, voting.title)}
                                  disabled={disabled}
                                >
                                  {t('admin.common.delete')}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <VotingFormModal
        isOpen={showAddModal}
        mode="create"
        formData={formData}
        saving={saving}
        onClose={() => {
          setShowAddModal(false);
          setSelectedVotingId(null);
          resetForm();
        }}
        onFormDataChange={setFormData}
        onSubmit={async () => {
          if (!selectedVotingId) {
            return;
          }
          await handleAddItem(selectedVotingId, fetchVotings);
        }}
      />

      <VotingFormModal
        isOpen={showEditModal}
        mode="edit"
        formData={formData}
        saving={saving}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        onFormDataChange={setFormData}
        onSubmit={() => handleUpdateItem(fetchVotings)}
      />
    </div>
  );
}
