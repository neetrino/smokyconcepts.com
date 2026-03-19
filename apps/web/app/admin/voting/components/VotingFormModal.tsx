'use client';

import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';

import { Button, Input } from '@shop/ui';

import { apiClient } from '@/lib/api-client';
import { processImageFile } from '@/lib/services/utils/image-utils';
import { useTranslation } from '@/lib/i18n-client';

import type { VotingFormData } from '../types';

const UPLOAD_IMAGES_ENDPOINT = '/api/v1/admin/products/upload-images';

function getOutputFileType(file: File): string {
  if (file.type === 'image/png') {
    return 'image/png';
  }

  if (file.type === 'image/webp') {
    return 'image/webp';
  }

  return 'image/jpeg';
}

async function uploadVotingImage(imageBase64: string): Promise<string | null> {
  const response = await apiClient.post<{ urls: string[] }>(UPLOAD_IMAGES_ENDPOINT, {
    images: [imageBase64],
  });

  return response?.urls?.[0] ?? null;
}

interface VotingFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  formData: VotingFormData;
  saving: boolean;
  onClose: () => void;
  onFormDataChange: (data: VotingFormData) => void;
  onSubmit: () => Promise<void>;
}

export function VotingFormModal({
  isOpen,
  mode,
  formData,
  saving,
  onClose,
  onFormDataChange,
  onSubmit,
}: VotingFormModalProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError(t('admin.voting.imageInvalidType'));
      event.target.value = '';
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const base64 = await processImageFile(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: getOutputFileType(file),
        initialQuality: 0.8,
      });

      if (!base64) {
        setUploadError(t('admin.voting.imageUploadFailed'));
        return;
      }

      const imageUrl = await uploadVotingImage(base64);

      if (!imageUrl) {
        setUploadError(t('admin.voting.imageUploadFailed'));
        return;
      }

      onFormDataChange({
        ...formData,
        imageUrl,
      });
    } catch {
      setUploadError(t('admin.voting.imageUploadFailed'));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  if (!isOpen) {
    return null;
  }

  const isCreateMode = mode === 'create';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          {isCreateMode ? t('admin.voting.addItem') : t('admin.voting.editItem')}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('admin.voting.titleField')} *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(event) =>
                onFormDataChange({
                  ...formData,
                  title: event.target.value,
                })
              }
              placeholder={t('admin.voting.titlePlaceholder')}
              className="w-full"
              disabled={saving || uploading}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('admin.voting.imageField')} *
            </label>
            <Input
              type="text"
              value={formData.imageUrl}
              onChange={(event) =>
                onFormDataChange({
                  ...formData,
                  imageUrl: event.target.value,
                })
              }
              placeholder={t('admin.voting.imagePlaceholder')}
              className="w-full"
              disabled={saving || uploading}
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
              disabled={saving || uploading}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={saving || uploading}
            >
              {uploading ? t('admin.voting.uploadingImage') : t('admin.voting.uploadImage')}
            </Button>
            {formData.imageUrl ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  onFormDataChange({
                    ...formData,
                    imageUrl: '',
                  })
                }
                disabled={saving || uploading}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                {t('admin.voting.removeImage')}
              </Button>
            ) : null}
          </div>

          {uploadError ? <p className="text-sm text-red-600">{uploadError}</p> : null}

          {formData.imageUrl ? (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-3">
              <img
                src={formData.imageUrl}
                alt={t('admin.voting.imagePreviewAlt')}
                className="h-40 w-full object-cover"
              />
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={saving || uploading}
            className="flex-1"
          >
            {saving
              ? isCreateMode
                ? t('admin.voting.creating')
                : t('admin.voting.updating')
              : isCreateMode
                ? t('admin.voting.createItem')
                : t('admin.voting.updateItem')}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={saving || uploading}>
            {t('admin.common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}
