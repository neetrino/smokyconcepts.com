'use client';

import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AdminShell } from '../components/AdminShell';
import {
  HomeHeroSlideEditor,
  type HomeHeroImageField,
} from './components/HomeHeroSlideEditor';
import { useAuth } from '@/lib/auth/AuthContext';
import { apiClient } from '@/lib/api-client';
import { HOME_HERO_DEFAULT_SLIDES } from '@/lib/constants/home-hero.constants';
import { useTranslation } from '@/lib/i18n-client';
import { processImageFile } from '@/lib/services/utils/image-utils';
import type { HomeHeroSlide } from '@/lib/types/home-hero.types';
import { ADMIN_PAGE_SHELL_CLASS } from '../constants/adminShell.constants';

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
  const empty = { title: '', description: '', ctaLabel: '' };
  return {
    imageUrl: base?.imageUrl ?? '/assets/home/concepts/hero-banner.webp',
    ctaHref: base?.ctaHref ?? '/about',
    copy: {
      hy: { ...empty },
      en: { ...empty },
      ru: { ...empty },
    },
  };
}

export default function AdminHomeHeroPage() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slides, setSlides] = useState<HomeHeroSlide[]>([]);
  const [uploadingTarget, setUploadingTarget] = useState<{
    index: number;
    field: HomeHeroImageField;
  } | null>(null);
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
      router.push('/supersudo');
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
      const merged = { ...cur, ...patch };
      if ('mobileImageUrl' in patch && !patch.mobileImageUrl?.trim()) {
        const { mobileImageUrl: _omit, ...withoutMobile } = merged;
        next[index] = withoutMobile;
      } else {
        next[index] = merged;
      }
      return next;
    });
  };

  const handleImageFile = async (
    index: number,
    field: HomeHeroImageField,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingTarget({ index, field });
    setError(null);
    try {
      const base64 = await processImageFile(file, { maxSizeMB: 2, maxWidthOrHeight: 1920 });
      const urls = await uploadImagesToR2([base64]);
      if (urls[0]) {
        updateSlide(index, { [field]: urls[0] });
      }
    } catch {
      setError(t('admin.homeHero.uploadError'));
    } finally {
      setUploadingTarget(null);
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
      <div className="flex min-h-screen items-center justify-center bg-[#efefef]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#122a26]" />
          <p className="text-[#414141]/70">{t('admin.common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  return (
    <div className={ADMIN_PAGE_SHELL_CLASS}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <AdminShell>
          <div className="space-y-6">
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            ) : null}

            <div className="overflow-hidden rounded-2xl border border-[#dcc090]/30 bg-white/90 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dcc090]/20 bg-[#122a26] px-6 py-4">
                <h1 className="text-base font-black uppercase tracking-[0.1em] text-[#dcc090]">
                  {t('admin.homeHero.title')}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSlides((s) => [...s, createEmptySlide()])}
                    className="rounded-lg border border-[#dcc090]/40 bg-[#dcc090]/15 px-4 py-2 text-xs font-bold text-[#dcc090] transition-all hover:bg-[#dcc090]/25 hover:border-[#dcc090]"
                  >
                    {t('admin.homeHero.addSlide')}
                  </button>
                  <button
                    type="button"
                    onClick={resetToDefaults}
                    className="rounded-lg border border-[#dcc090]/40 bg-[#dcc090]/15 px-4 py-2 text-xs font-bold text-[#dcc090] transition-all hover:bg-[#dcc090]/25 hover:border-[#dcc090]"
                  >
                    {t('admin.homeHero.resetDefaults')}
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {slides.map((slide, index) => (
                  <HomeHeroSlideEditor
                    key={index}
                    slide={slide}
                    index={index}
                    isExpanded={expandedSlideIndex === index}
                    slidesCount={slides.length}
                    isUploading={
                      uploadingTarget?.index === index && uploadingTarget.field === 'imageUrl'
                    }
                    isUploadingMobile={
                      uploadingTarget?.index === index &&
                      uploadingTarget.field === 'mobileImageUrl'
                    }
                    onToggle={() => toggleSlideExpanded(index)}
                    onRemove={() => removeSlideAt(index)}
                    onUpdate={(patch) => updateSlide(index, patch)}
                    onImageFile={(field, e) => void handleImageFile(index, field, e)}
                  />
                ))}
              </div>

              <div className="flex justify-end border-t border-[#dcc090]/20 px-6 py-4">
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className="rounded-lg bg-[#122a26] px-6 py-2.5 text-sm font-bold text-[#dcc090] shadow-[0_4px_14px_rgba(18,42,38,0.18)] transition-all hover:bg-[#18352f] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? t('admin.common.saving') : t('admin.homeHero.save')}
                </button>
              </div>
            </div>
          </div>
        </AdminShell>
      </div>
    </div>
  );
}
