'use client';

import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Card } from '@shop/ui';

import { AdminSidebar } from '../components/AdminSidebar';
import { HomeHeroSlideEditor } from './components/HomeHeroSlideEditor';
import { useAuth } from '@/lib/auth/AuthContext';
import { apiClient } from '@/lib/api-client';
import { HOME_HERO_DEFAULT_SLIDES } from '@/lib/constants/home-hero.constants';
import { useTranslation } from '@/lib/i18n-client';
import { processImageFile } from '@/lib/services/utils/image-utils';
import type { HomeHeroSlide } from '@/lib/types/home-hero.types';

const UPLOAD_IMAGES_ENDPOINT = '/api/v1/admin/home-hero/upload-images';

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
  const [expandedSlideIndex, setExpandedSlideIndex] = useState<number | null>(null);
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
    setExpandedSlideIndex(null);
  };

  const removeSlideAt = (index: number) => {
    setSlides((s) => s.filter((_, i) => i !== index));
    setExpandedSlideIndex((prev) => {
      if (prev === null) return null;
      if (prev === index) return null;
      if (prev > index) return prev - 1;
      return prev;
    });
  };

  const toggleSlideExpanded = (index: number) => {
    setExpandedSlideIndex((prev) => (prev === index ? null : index));
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

              <div className="space-y-4">
                {slides.map((slide, index) => (
                  <HomeHeroSlideEditor
                    key={index}
                    slide={slide}
                    index={index}
                    isExpanded={expandedSlideIndex === index}
                    slidesCount={slides.length}
                    isUploading={uploadingIndex === index}
                    onToggle={() => toggleSlideExpanded(index)}
                    onRemove={() => removeSlideAt(index)}
                    onUpdate={(patch) => updateSlide(index, patch)}
                    onImageFile={(e) => void handleImageFile(index, e)}
                  />
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
