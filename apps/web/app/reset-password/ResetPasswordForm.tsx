'use client';

import Link from 'next/link';
import { Button, Input, Card } from '@shop/ui';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '@/lib/i18n-client';
import { useResetPasswordForm } from './useResetPasswordForm';

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  disabled,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
  disabled: boolean;
  placeholder: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          className="w-full pr-10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          disabled={disabled}
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const { t } = useTranslation();
  const form = useResetPasswordForm(token);
  const fieldsDisabled = form.isSubmitting || Boolean(form.success);

  return (
    <Card className="p-8 bg-[#DCC090]/20">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('login.reset.title')}</h1>
      <p className="text-gray-600 mb-8">{t('login.reset.subtitle')}</p>

      {form.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{form.error}</p>
        </div>
      )}
      {form.success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{form.success}</p>
        </div>
      )}

      <form onSubmit={form.handleSubmit} className="space-y-4">
        <PasswordField
          id="password"
          label={t('login.reset.newPassword')}
          value={form.password}
          onChange={form.setPassword}
          show={form.showPassword}
          onToggleShow={() => form.setShowPassword(!form.showPassword)}
          disabled={fieldsDisabled}
          placeholder={t('login.form.passwordPlaceholder')}
        />
        <PasswordField
          id="confirmPassword"
          label={t('login.reset.confirmPassword')}
          value={form.confirmPassword}
          onChange={form.setConfirmPassword}
          show={form.showConfirmPassword}
          onToggleShow={() => form.setShowConfirmPassword(!form.showConfirmPassword)}
          disabled={fieldsDisabled}
          placeholder={t('login.form.passwordPlaceholder')}
        />
        <Button
          variant="primary"
          className="w-full rounded-xl bg-[#DCC090] text-gray-900 hover:bg-[#c9ad7f]"
          type="submit"
          disabled={fieldsDisabled}
        >
          {form.isSubmitting ? t('login.reset.submitting') : t('login.reset.submit')}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-[#DCC090] hover:text-[#c9ad7f] hover:underline font-medium">
          {t('login.forgot.backToLogin')}
        </Link>
      </div>
    </Card>
  );
}
