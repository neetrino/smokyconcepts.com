'use client';

import type { ChangeEvent } from 'react';
import { Input } from '@shop/ui';
import { useTranslation } from '../../../../../lib/i18n-client';

interface BasicInformationProps {
  title: string;
  slug: string;
  descriptionHtml: string;
  productDetailsHtml: string;
  shippingHtml: string;
  onTitleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSlugChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSlugBlur?: () => void;
  onDescriptionChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onProductDetailsChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onShippingChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

export function BasicInformation({
  title,
  slug,
  descriptionHtml,
  productDetailsHtml,
  shippingHtml,
  onTitleChange,
  onSlugChange,
  onSlugBlur,
  onDescriptionChange,
  onProductDetailsChange,
  onShippingChange,
}: BasicInformationProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('admin.products.add.basicInformation')}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('admin.products.add.title')} *
          </label>
          <Input
            type="text"
            value={title}
            onChange={onTitleChange}
            required
            placeholder={t('admin.products.add.productTitlePlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('admin.products.add.slug')} *
          </label>
          <Input
            type="text"
            value={slug}
            onChange={onSlugChange}
            onBlur={onSlugBlur}
            required
            placeholder={t('admin.products.add.productSlugPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('admin.products.add.description')}
          </label>
          <textarea
            className="w-full px-3 py-2 border border-[#dcc090]/35 rounded-md focus:outline-none focus:ring-2 focus:ring-[#dcc090] focus:border-[#dcc090]"
            rows={6}
            value={descriptionHtml}
            onChange={onDescriptionChange}
            placeholder={t('admin.products.add.productDescriptionPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('admin.products.add.productTabHtml')}
          </label>
          <textarea
            className="w-full px-3 py-2 border border-[#dcc090]/35 rounded-md focus:outline-none focus:ring-2 focus:ring-[#dcc090] focus:border-[#dcc090] whitespace-pre-wrap"
            rows={8}
            value={productDetailsHtml}
            onChange={onProductDetailsChange}
            placeholder={t('admin.products.add.productTabHtmlPlaceholder')}
          />
          <p className="mt-1 text-xs text-gray-500">
            {t('admin.products.add.productTabHtmlHint')}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('admin.products.add.shippingHtml')}
          </label>
          <textarea
            className="w-full px-3 py-2 border border-[#dcc090]/35 rounded-md focus:outline-none focus:ring-2 focus:ring-[#dcc090] focus:border-[#dcc090]"
            rows={5}
            value={shippingHtml}
            onChange={onShippingChange}
            placeholder={t('admin.products.add.shippingHtmlPlaceholder')}
          />
        </div>
      </div>
    </div>
  );
}


