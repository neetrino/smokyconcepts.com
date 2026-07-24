'use client';

import { useState, type FormEvent } from 'react';
import { useTranslation } from '@/lib/i18n-client';
import { PASSWORD_MIN_LENGTH } from '@/lib/security/password.constants';

export function useResetPasswordForm(token: string) {
  const { t } = useTranslation();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): string | null => {
    if (!token) {
      return t('login.reset.errors.invalidToken');
    }
    if (!password) {
      return t('login.reset.errors.passwordRequired');
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return t('login.reset.errors.passwordMinLength');
    }
    if (password !== confirmPassword) {
      return t('login.reset.errors.passwordsDoNotMatch');
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = (await response.json()) as { detail?: string };
      if (!response.ok) {
        setError(data.detail || t('login.reset.errors.resetFailed'));
        return;
      }

      setSuccess(t('login.reset.success'));
      setPassword('');
      setConfirmPassword('');
    } catch {
      setError(t('login.reset.errors.resetFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    error,
    success,
    isSubmitting,
    handleSubmit,
  };
}
