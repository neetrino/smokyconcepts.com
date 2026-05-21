import { useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useTranslation } from '../../../lib/i18n-client';

const CONFIRM_PHRASE = 'DELETE';

interface UseDeleteAccountProps {
  onError: (error: string) => void;
}

export function useDeleteAccount({ onError }: UseDeleteAccountProps) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const openDeleteModal = () => {
    setConfirmText('');
    setModalError(null);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deletingAccount) return;
    setShowDeleteModal(false);
    setConfirmText('');
    setModalError(null);
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== CONFIRM_PHRASE) return;

    setDeletingAccount(true);
    setModalError(null);
    onError('');

    try {
      await apiClient.delete('/api/v1/users/profile');
      setShowDeleteModal(false);
      logout();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const errorMessage = message || t('profile.deleteAccount.failedToDelete');
      setModalError(errorMessage);
      onError(errorMessage);
    } finally {
      setDeletingAccount(false);
    }
  };

  const isConfirmValid = confirmText === CONFIRM_PHRASE;

  return {
    showDeleteModal,
    confirmText,
    setConfirmText,
    deletingAccount,
    modalError,
    isConfirmValid,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteAccount,
  };
}
