'use client';

import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import { Button, Input } from '@shop/ui';
import { apiClient } from '@/lib/api-client';
import { processImageFile } from '@/lib/services/utils/image-utils';
import { useTranslation } from '../../../../lib/i18n-client';

const UPLOAD_IMAGES_ENDPOINT = '/api/v1/admin/products/upload-images';

function getOutputFileType(file: File): string {
  const fileType = file.type?.toLowerCase();

  if (fileType === 'image/png') {
    return 'image/png';
  }

  if (fileType === 'image/webp') {
    return 'image/webp';
  }

  return 'image/jpeg';
}

async function uploadCategoryImage(imageBase64: string): Promise<string | null> {
  const response = await apiClient.post<{ urls: string[] }>(UPLOAD_IMAGES_ENDPOINT, {
    images: [imageBase64],
  });

  return response?.urls?.[0] ?? null;
}

interface CategoryImageFieldProps {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function CategoryImageField({ value, disabled = false, onChange }: CategoryImageFieldProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError(t('admin.categories.imageInvalidType'));
      event.target.value = '';
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const base64 = await processImageFile(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: getOutputFileType(file),
        initialQuality: 0.8,
      });

      if (!base64) {
        setError(t('admin.categories.imageUploadFailed'));
        return;
      }

      const imageUrl = await uploadCategoryImage(base64);

      if (!imageUrl) {
        setError(t('admin.categories.imageUploadFailed'));
        return;
      }

      onChange(imageUrl);
    } catch {
      setError(t('admin.categories.imageUploadFailed'));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('admin.categories.image')}
        </label>
        <Input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t('admin.categories.imagePlaceholder')}
          className="w-full"
          disabled={disabled || uploading}
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-hidden
          onChange={handleFileUpload}
          disabled={disabled || uploading}
        />
        <Button
          type="button"
          variant="ghost"
          disabled={disabled || uploading}
          className="cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? t('admin.categories.uploadingImage') : t('admin.categories.uploadImage')}
        </Button>

        {value ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => onChange('')}
            disabled={disabled || uploading}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            {t('admin.categories.removeImage')}
          </Button>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {value ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-3">
          <img src={value} alt={t('admin.categories.imagePreviewAlt')} className="h-32 w-full object-contain" />
        </div>
      ) : null}
    </div>
  );
}
