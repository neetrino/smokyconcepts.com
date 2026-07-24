'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button, Input, Card } from '@shop/ui';
import { useTranslation } from '../../lib/i18n-client';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError(t('login.forgot.errors.emailRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = (await response.json()) as {
        message?: string;
        detail?: string;
      };

      if (!response.ok) {
        setError(data.detail || t('login.forgot.errors.requestFailed'));
        return;
      }

      setSuccess(t('login.forgot.success'));
      setEmail('');
    } catch {
      setError(t('login.forgot.errors.requestFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="p-8 bg-[#DCC090]/20">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('login.forgot.title')}
        </h1>
        <p className="text-gray-600 mb-8">{t('login.forgot.subtitle')}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('login.form.email')}
            </label>
            <Input
              id="email"
              type="email"
              placeholder={t('login.form.emailPlaceholder')}
              className="w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <Button
            variant="primary"
            className="w-full rounded-xl bg-[#DCC090] text-gray-900 hover:bg-[#c9ad7f]"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('login.forgot.submitting') : t('login.forgot.submit')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-[#DCC090] hover:text-[#c9ad7f] hover:underline font-medium">
            {t('login.forgot.backToLogin')}
          </Link>
        </div>
      </Card>
    </div>
  );
}
