'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Input, Card } from '@shop/ui';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../lib/i18n-client';
import { Eye, EyeOff } from 'lucide-react';
import { PageLoadingCenter } from '../../components/loading/PageLoadingCenter';

function LoginPageContent() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    console.log('🔐 [LOGIN PAGE] Form submitted');

    // Validation
    if (!email.trim()) {
      setError(t('login.errors.emailRequired'));
      setIsSubmitting(false);
      return;
    }

    if (!password) {
      setError(t('login.errors.passwordRequired'));
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('📤 [LOGIN PAGE] Calling login function...');
      await login(email.trim(), password);
      console.log('✅ [LOGIN PAGE] Login successful, redirecting to:', redirectTo);
      // Redirect to the specified page or home
      router.push(redirectTo);
    } catch (err: any) {
      console.error('❌ [LOGIN PAGE] Login error:', err);
      setError(err.message || t('login.errors.loginFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      router.push(redirectTo);
    }
  }, [isLoggedIn, isLoading, redirectTo, router]);

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12 r">
      <Card className="p-8 bg-[#DCC090]/20 ">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('login.title')}</h1>
        <p className="text-gray-600 mb-8">{t('login.subtitle')}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
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
              disabled={isSubmitting || isLoading}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('login.form.password')}
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('login.form.passwordPlaceholder')}
                className="w-full pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                disabled={isSubmitting || isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isSubmitting || isLoading}
              />
              <span className="ml-2 text-sm text-gray-600">{t('login.form.rememberMe')}</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              {t('login.form.forgotPassword')}
            </Link>
          </div>
          <Button 
            variant="primary" 
            className="w-full rounded-xl bg-[#DCC090] text-gray-900 hover:bg-[#c9ad7f]"
            type="submit"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? t('login.form.submitting') : t('login.form.submit')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('login.form.noAccount')}{' '}
            <Link href="/register" className="text-[#DCC090] hover:text-[#c9ad7f] hover:underline font-medium">
              {t('login.form.signUp')}
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoadingCenter />}>
      <LoginPageContent />
    </Suspense>
  );
}

