'use client';

import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Card } from '@shop/ui';

import { AdminSidebar } from '../components/AdminSidebar';
import { useAuth } from '@/lib/auth/AuthContext';
import { apiClient } from '@/lib/api-client';
import { HOME_HERO_DEFAULT_SLIDES } from '@/lib/constants/home-hero.constants';
import { useTranslation } from '@/lib/i18n-client';
import { processImageFile } from '@/lib/services/utils/image-utils';
import type { HomeHeroSlide } from '@/lib/types/home-hero.types';

const UPLOAD_IMAGES_ENDPOINT = '/api/v1/admin/products/upload-images';

interface SettingsResponse {
  homeHero?: { slides: HomeHeroSlide[] };
}

async function uploadImagesToR2(images: string[]): Promise<string[]> {
  const res = await apiClient.post<{ urls: string[] }>(UPLOAD_IMAGES_ENDPOINT, { images });
  return res?.urls ?? [];
}

function createEmptySlide(): HomeHeroSlide {
  const base = HOME_HERO_DEFAULT_SLIDES[0];
  return {
    imageUrl: base?.imageUrl ?? '/assets/home/concepts/hero-banner.png',
    title: '',
    description: '',
    ctaLabel: base?.ctaLabel ?? 'Deep Dive',
    ctaHref: base?.ctaHref ?? '/about',
  };
}

export default function AdminHomeHeroPage() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slides, setSlides] = useState<HomeHeroSlide[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<SettingsResponse>('/api/v1/admin/settings');
      const list = data.homeHero?.slides ?? [];
      setSlides(list.length > 0 ? list : [...HOME_HERO_DEFAULT_SLIDES]);
    } catch {
      setError(t('admin.homeHero.loadError'));
      setSlides([...HOME_HERO_DEFAULT_SLIDES]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || !isAdmin)) {
      router.push('/admin');
    }
  }, [isAdmin, isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      void load();
    }
  }, [isLoggedIn, isAdmin, load]);

  const updateSlide = (index: number, patch: Partial<HomeHeroSlide>) => {
    setSlides((prev) => {
      const next = [...prev];
      const cur = next[index];
      if (!cur) return prev;
      next[index] = { ...cur, ...patch };
      return next;
    });
  };

  const handleImageFile = async (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingIndex(index);
    setError(null);
    try {
      const base64 = await processImageFile(file, { maxSizeMB: 2, maxWidthOrHeight: 1920 });
      const urls = await uploadImagesToR2([base64]);
      if (urls[0]) {
        updateSlide(index, { imageUrl: urls[0] });
      }
    } catch {
      setError(t('admin.homeHero.uploadError'));
    } finally {
      setUploadingIndex(null);
      if (event.target) event.target.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await apiClient.put('/api/v1/admin/settings', {
        homeHero: { slides },
      });
      alert(t('admin.homeHero.saved'));
    } catch (err: unknown) {
      const detail =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(detail ?? t('admin.homeHero.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSlides([...HOME_HERO_DEFAULT_SLIDES]);
  };

  if (isLoading || loading) {
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

  return (
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="mb-4 flex items-center text-gray-600 transition-colors duration-200 hover:text-gray-900"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('admin.homeHero.back')}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.homeHero.title')}</h1>
          <p className="mt-2 text-sm text-gray-600">{t('admin.homeHero.subtitle')}</p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <AdminSidebar currentPath={pathname ?? '/admin/home-hero'} router={router} t={t} />

          <div className="min-w-0 flex-1">
            {error ? (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            ) : null}

            <Card className="p-6">
              <div className="mb-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSlides((s) => [...s, createEmptySlide()])}
                >
                  {t('admin.homeHero.addSlide')}
                </Button>
                <Button type="button" variant="secondary" onClick={resetToDefaults}>
                  {t('admin.homeHero.resetDefaults')}
                </Button>
              </div>

              <div className="space-y-8">
                {slides.map((slide, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {t('admin.homeHero.slideLabel').replace('{n}', String(index + 1))}
                      </h2>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setSlides((s) => s.filter((_, i) => i !== index))}
                        disabled={slides.length <= 1}
                      >
                        {t('admin.homeHero.removeSlide')}
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          {t('admin.homeHero.imageUrl')}
                        </label>
                        <input
                          type="text"
                          value={slide.imageUrl}
                          onChange={(e) => updateSlide(index, { imageUrl: e.target.value })}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="mt-2">
                          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => void handleImageFile(index, e)}
                              disabled={uploadingIndex === index}
                            />
                            {uploadingIndex === index ? t('admin.homeHero.uploading') : t('admin.homeHero.uploadFile')}
                          </label>
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          {t('admin.homeHero.titleField')}
                        </label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => updateSlide(index, { title: e.target.value })}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          {t('admin.homeHero.description')}
                        </label>
                        <textarea
                          value={slide.description}
                          onChange={(e) => updateSlide(index, { description: e.target.value })}
                          rows={3}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          {t('admin.homeHero.ctaLabel')}
                        </label>
                        <input
                          type="text"
                          value={slide.ctaLabel}
                          onChange={(e) => updateSlide(index, { ctaLabel: e.target.value })}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          {t('admin.homeHero.ctaHref')}
                        </label>
                        <input
                          type="text"
                          value={slide.ctaHref}
                          onChange={(e) => updateSlide(index, { ctaHref: e.target.value })}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" variant="primary" onClick={() => void handleSave()} disabled={saving}>
                  {saving ? t('admin.common.saving') : t('admin.homeHero.save')}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
