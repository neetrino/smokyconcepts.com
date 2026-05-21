'use client';

import { useEffect } from 'react';
import { Button, Card, Input } from '@shop/ui';

interface ProfileDeleteAccountProps {
  showDeleteModal: boolean;
  confirmText: string;
  setConfirmText: (value: string) => void;
  deletingAccount: boolean;
  modalError: string | null;
  isConfirmValid: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onConfirmDelete: () => void;
  t: (key: string) => string;
}

export function ProfileDeleteAccount({
  showDeleteModal,
  confirmText,
  setConfirmText,
  deletingAccount,
  modalError,
  isConfirmValid,
  onOpenModal,
  onCloseModal,
  onConfirmDelete,
  t,
}: ProfileDeleteAccountProps) {
  useEffect(() => {
    if (!showDeleteModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showDeleteModal]);

  return (
    <>
      <Card className="mt-6 border border-red-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900">{t('profile.deleteAccount.title')}</h2>
        <p className="mt-2 text-sm text-gray-600">{t('profile.deleteAccount.description')}</p>
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
            onClick={onOpenModal}
          >
            {t('profile.deleteAccount.button')}
          </Button>
        </div>
      </Card>

      {showDeleteModal ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="delete-profile-modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={deletingAccount ? undefined : onCloseModal}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 id="delete-profile-modal-title" className="text-lg font-semibold text-gray-900">
                  {t('profile.deleteAccount.modalTitle')}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{t('profile.deleteAccount.modalDescription')}</p>
              </div>

              <div className="space-y-4 px-6 py-4">
                {modalError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-sm text-red-600">{modalError}</p>
                  </div>
                ) : null}

                <Input
                  label={t('profile.deleteAccount.confirmLabel')}
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={t('profile.deleteAccount.confirmPlaceholder')}
                  autoComplete="off"
                  disabled={deletingAccount}
                />
                <p className="text-xs text-gray-500">{t('profile.deleteAccount.confirmHint')}</p>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
                <Button type="button" variant="outline" onClick={onCloseModal} disabled={deletingAccount}>
                  {t('profile.deleteAccount.cancel')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                  onClick={onConfirmDelete}
                  disabled={!isConfirmValid || deletingAccount}
                >
                  {deletingAccount
                    ? t('profile.deleteAccount.deleting')
                    : t('profile.deleteAccount.confirmButton')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
