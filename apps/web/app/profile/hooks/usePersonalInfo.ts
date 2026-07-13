import { useState, useEffect, type FormEvent } from 'react';
import { apiClient } from '../../../lib/api-client';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useTranslation } from '../../../lib/i18n-client';
import {
  isValidPhoneNumber,
  sanitizePhoneNumberInput,
} from '../../../lib/utils/phone-validation';
import type { UserProfile } from '../types';

interface PersonalInfoForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface UsePersonalInfoProps {
  profile: UserProfile | null;
  onProfileUpdate: (profile: UserProfile) => void;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export function usePersonalInfo({
  profile,
  onProfileUpdate,
  onError,
  onSuccess,
}: UsePersonalInfoProps) {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();

  const [personalInfo, setPersonalInfo] = useState<PersonalInfoForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [phoneError, setPhoneError] = useState('');
  const [savingPersonal, setSavingPersonal] = useState(false);

  useEffect(() => {
    if (profile) {
      setPersonalInfo({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
      setPhoneError('');
    }
  }, [profile]);

  const updatePersonalInfo = (next: PersonalInfoForm) => {
    const phone = sanitizePhoneNumberInput(next.phone);
    setPersonalInfo({ ...next, phone });
    if (phoneError) {
      setPhoneError('');
    }
  };

  const handleSavePersonalInfo = async (e: FormEvent) => {
    e.preventDefault();
    setSavingPersonal(true);
    onError('');
    onSuccess('');
    setPhoneError('');

    const phone = personalInfo.phone.trim();
    if (phone.length > 0 && !isValidPhoneNumber(phone)) {
      setPhoneError(t('profile.personal.invalidPhone'));
      setSavingPersonal(false);
      return;
    }

    try {
      const payload = {
        ...personalInfo,
        phone,
      };
      const updated = await apiClient.put<UserProfile>('/api/v1/users/profile', payload);
      onProfileUpdate(updated);
      onSuccess(t('profile.personal.updatedSuccess'));

      if (authUser) {
        window.dispatchEvent(new Event('auth-updated'));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      onError(errorMessage || t('profile.personal.failedToUpdate'));
    } finally {
      setSavingPersonal(false);
    }
  };

  return {
    personalInfo,
    setPersonalInfo: updatePersonalInfo,
    phoneError,
    savingPersonal,
    handleSavePersonalInfo,
  };
}
