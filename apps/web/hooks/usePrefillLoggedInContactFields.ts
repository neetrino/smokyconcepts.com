'use client';

import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { sanitizeContactPhoneInput } from '@/lib/utils/contact-phone-input';

export type ContactIdentityFields = {
  name: string;
  email: string;
  phone: string;
};

function buildDisplayName(
  firstName?: string | null,
  lastName?: string | null,
): string {
  return [firstName?.trim(), lastName?.trim()].filter(Boolean).join(' ');
}

/**
 * Prefills empty name / email / phone fields from the logged-in user profile.
 */
export function usePrefillLoggedInContactFields<T extends ContactIdentityFields>(
  setFormData: Dispatch<SetStateAction<T>>,
): void {
  const { user, isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !isLoggedIn || !user) {
      return;
    }

    const name = buildDisplayName(user.firstName, user.lastName);
    const email = user.email?.trim() ?? '';
    const phone = user.phone ? sanitizeContactPhoneInput(user.phone) : '';

    if (!name && !email && !phone) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      name: prev.name.trim() ? prev.name : name,
      email: prev.email.trim() ? prev.email : email,
      phone: prev.phone.trim() ? prev.phone : phone,
    }));
  }, [
    isLoading,
    isLoggedIn,
    user?.id,
    user?.email,
    user?.phone,
    user?.firstName,
    user?.lastName,
    setFormData,
  ]);
}
