'use client';

import type { ChangeEvent } from 'react';
import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';

export interface CustomOrderDraft {
  name: string;
  phone: string;
  email: string;
  description: string;
  imageDataUrl: string;
  imageFileName: string;
}

export const EMPTY_CUSTOM_ORDER_DRAFT: CustomOrderDraft = {
  name: '',
  phone: '',
  email: '',
  description: '',
  imageDataUrl: '',
  imageFileName: '',
};

function CustomOrderInputField({
  label,
  type,
  value,
  autoComplete,
  onChange,
}: {
  label: string;
  type: 'text' | 'tel' | 'email';
  value: string;
  autoComplete: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-montserrat text-[14px] font-medium leading-[22px] text-[#414141] sm:text-[15px]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="block h-7 w-full border-0 border-b border-[#dcc090] bg-transparent font-montserrat text-[14px] font-medium text-[#414141] outline-none sm:text-[15px]"
        autoComplete={autoComplete}
      />
    </label>
  );
}

function CustomOrderUpload({
  language,
  imageFileName,
  isUploading,
  onUpload,
}: {
  language: LanguageCode;
  imageFileName: string;
  isUploading: boolean;
  onUpload: (file: File) => void;
}) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    event.currentTarget.value = '';
  };

  return (
    <div className="mt-8 flex items-start gap-3">
      <label
        className={`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#dcc090] font-montserrat text-[24px] leading-none text-[#122a26] ${
          isUploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-[#d3b67f]'
        }`}
        aria-label={t(language, 'product.size_catalog_custom_order_upload_button')}
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="sr-only"
          disabled={isUploading}
          onChange={handleFileChange}
        />
        +
      </label>
      <div>
        <p className="font-montserrat text-[14px] font-medium leading-[20px] text-[#414141] sm:text-[15px] sm:leading-[22px]">
          {t(language, 'product.size_catalog_custom_order_upload')}
        </p>
        <p className="mt-0.5 font-montserrat text-[12px] font-medium leading-none text-[#9d9d9d]">
          {t(language, 'product.size_catalog_custom_order_upload_formats')}
        </p>
        {isUploading ? (
          <p className="mt-2 font-montserrat text-[12px] font-medium text-[#414141]">
            {t(language, 'product.size_catalog_custom_order_uploading')}
          </p>
        ) : null}
        {imageFileName ? (
          <p className="mt-2 font-montserrat text-[12px] font-medium text-[#414141]">{imageFileName}</p>
        ) : null}
      </div>
    </div>
  );
}

export function CustomizeSizeOrderFallback({
  language,
  draft,
  onDraftChange,
  onUploadImage,
  onSubmit,
  isUploadingImage,
  isSubmitting,
  submitError,
  canSubmit,
}: {
  language: LanguageCode;
  draft: CustomOrderDraft;
  onDraftChange: (field: keyof CustomOrderDraft, value: string) => void;
  onUploadImage: (file: File) => void;
  onSubmit: (draft: CustomOrderDraft) => void;
  isUploadingImage: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  canSubmit: boolean;
}) {
  return (
    <div className="max-w-[978px]">
      <p className="font-montserrat text-[14px] font-medium leading-[22px] text-[#414141] sm:text-[15px] sm:leading-[24px]">
        {t(language, 'product.size_catalog_custom_order_message')}
      </p>

      <div className="mt-8 flex max-w-[454px] flex-col gap-6">
        <CustomOrderInputField
          label={t(language, 'product.size_catalog_custom_order_name')}
          type="text"
          value={draft.name}
          autoComplete="name"
          onChange={(value) => onDraftChange('name', value)}
        />
        <CustomOrderInputField
          label={t(language, 'product.size_catalog_custom_order_phone')}
          type="tel"
          value={draft.phone}
          autoComplete="tel"
          onChange={(value) => onDraftChange('phone', value)}
        />
        <CustomOrderInputField
          label={t(language, 'product.size_catalog_custom_order_email')}
          type="email"
          value={draft.email}
          autoComplete="email"
          onChange={(value) => onDraftChange('email', value)}
        />
        <CustomOrderInputField
          label={t(language, 'product.size_catalog_custom_order_description')}
          type="text"
          value={draft.description}
          autoComplete="off"
          onChange={(value) => onDraftChange('description', value)}
        />
      </div>

      <CustomOrderUpload
        language={language}
        imageFileName={draft.imageFileName}
        isUploading={isUploadingImage}
        onUpload={onUploadImage}
      />

      <button
        type="button"
        onClick={() => onSubmit(draft)}
        disabled={!canSubmit || isSubmitting || isUploadingImage}
        className={`mt-8 h-11 min-w-[166px] rounded-[8px] px-6 font-montserrat text-[14px] font-semibold uppercase tracking-[0.18em] sm:text-[15px] ${
          canSubmit && !isSubmitting && !isUploadingImage
            ? 'bg-[#dcc090] text-[#122a26] hover:bg-[#d3b67f]'
            : 'bg-[#d2d2d2] text-[#9d9d9d]'
        }`}
        aria-label={t(language, 'product.size_catalog_custom_order_cta_aria')}
      >
        {isSubmitting
          ? t(language, 'product.size_catalog_custom_order_submitting')
          : t(language, 'product.size_catalog_custom_order_cta')}
      </button>
      {submitError ? (
        <p className="mt-3 max-w-[454px] font-montserrat text-[13px] font-medium text-red-600">{submitError}</p>
      ) : null}
    </div>
  );
}
