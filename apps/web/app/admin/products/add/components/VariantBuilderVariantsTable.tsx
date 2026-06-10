'use client';

import type { ChangeEvent, RefObject } from 'react';
import { Button, Input } from '@shop/ui';
import { useTranslation } from '../../../../../lib/i18n-client';
import { ADMIN_PRODUCT_INPUT_CURRENCY, CURRENCIES } from '../../../../../lib/currency';
import type { GeneratedVariant } from '../types';
import type { CategoryAttribute } from '@/lib/category-attributes';
import { ADMIN_RASTER_IMAGE_FILE_ACCEPT } from '@/lib/services/utils/heic-browser-convert';
import { VariantRowAttributeSelectors } from './VariantRowAttributeSelectors';
import { SHOW_COMPARE_AT_PRICE_FIELD } from '../constants/compareAtPriceVisibility.constants';
import {
  getGeneratedVariantImages,
  getGeneratedVariantMainImageIndex,
} from '../utils/generatedVariantImages';

export interface VariantBuilderVariantsTableProps {
  generatedVariants: GeneratedVariant[];
  hasAttributeDrivenVariants: boolean;
  attributesInUse: CategoryAttribute[];
  attributeCombinationError: string | null;
  imageUploadLoading: boolean;
  slug: string;
  title: string;
  variantImageInputRefs: RefObject<Record<string, HTMLInputElement | null>>;
  onVariantUpdate: (updater: (prev: GeneratedVariant[]) => GeneratedVariant[]) => void;
  onVariantAdd: () => void;
  onApplyToAll: (field: 'price' | 'compareAtPrice' | 'stock' | 'sku', value: string) => void;
  onVariantImageUpload: (variantId: string, event: ChangeEvent<HTMLInputElement>) => void;
  onVariantAttributeValuesChange: (variantId: string, attributeId: string, valueIds: string[]) => void;
  getVariantOptionLabel: (variant: GeneratedVariant) => string;
  generateSlug: (title: string) => string;
}

export function VariantBuilderVariantsTable({
  generatedVariants,
  hasAttributeDrivenVariants,
  attributesInUse,
  attributeCombinationError,
  imageUploadLoading,
  slug,
  title,
  variantImageInputRefs,
  onVariantUpdate,
  onVariantAdd,
  onApplyToAll,
  onVariantImageUpload,
  onVariantAttributeValuesChange,
  getVariantOptionLabel,
  generateSlug,
}: VariantBuilderVariantsTableProps) {
  const { t } = useTranslation();

  const removeVariantImage = (variant: GeneratedVariant, imageIndex: number) => {
    onVariantUpdate((prev) =>
      prev.map((v) => {
        if (v.id !== variant.id) {
          return v;
        }
        const nextImages = getGeneratedVariantImages(v).filter((_, index) => index !== imageIndex);
        const previousMainIndex = getGeneratedVariantMainImageIndex(v);
        const nextMainImageIndex =
          nextImages.length === 0
            ? 0
            : imageIndex < previousMainIndex
              ? previousMainIndex - 1
              : Math.min(previousMainIndex, nextImages.length - 1);
        return {
          ...v,
          images: nextImages,
          mainImageIndex: nextMainImageIndex,
          image: nextImages[nextMainImageIndex] ?? null,
        };
      })
    );
    if (variantImageInputRefs.current?.[variant.id]) {
      variantImageInputRefs.current[variant.id]!.value = '';
    }
  };

  const setVariantMainImage = (variantId: string, imageIndex: number) => {
    onVariantUpdate((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) {
          return v;
        }
        const images = getGeneratedVariantImages(v);
        const mainImage = images[imageIndex] ?? null;
        return {
          ...v,
          images,
          mainImageIndex: imageIndex,
          image: mainImage,
        };
      })
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('admin.products.add.generatedVariants')} ({generatedVariants.length.toString()})
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const price = prompt(t('admin.products.add.enterDefaultPrice'));
              if (price !== null) onApplyToAll('price', price);
            }}
          >
            {t('admin.products.add.applyPriceToAll')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const stock = prompt(t('admin.products.add.enterDefaultStock'));
              if (stock !== null) onApplyToAll('stock', stock);
            }}
          >
            Apply Quantity to All
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const skuPrefix = prompt(t('admin.products.add.enterSkuPrefix'));
              if (skuPrefix !== null) {
                const baseSlug = skuPrefix || slug || generateSlug(title) || 'PROD';
                onVariantUpdate((prev) =>
                  prev.map((variant, index) => ({
                    ...variant,
                    sku: `${baseSlug.toUpperCase()}-${index + 1}`,
                  }))
                );
              }
            }}
          >
            {t('admin.products.add.applySkuToAll')}
          </Button>
        </div>
      </div>

      {attributeCombinationError ? (
        <p className="mb-2 text-sm text-red-600" role="alert">
          {attributeCombinationError}
        </p>
      ) : null}
      <div className="border border-gray-300 rounded-lg overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.products.add.attributes')}
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.products.add.price')}
              </th>
              {SHOW_COMPARE_AT_PRICE_FIELD ? (
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.products.add.compareAtPrice')}
                </th>
              ) : null}
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.products.add.quantity')}
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.products.add.sku')}
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.products.add.displayVariant')}
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.products.add.image')}
              </th>
              <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.products.add.deleteVariant')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {generatedVariants.length === 0 ? (
              <tr>
                <td
                  colSpan={SHOW_COMPARE_AT_PRICE_FIELD ? 8 : 7}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  {t('admin.products.add.noVariants')}
                </td>
              </tr>
            ) : null}
            {generatedVariants.map((variant) => (
              <tr key={variant.id} className="hover:bg-gray-50">
                <td className="px-2 py-2 align-top">
                  {hasAttributeDrivenVariants ? (
                    attributesInUse.length > 0 ? (
                      <VariantRowAttributeSelectors
                        variant={variant}
                        categoryAttributes={attributesInUse}
                        onAttributeValuesChange={(attributeId, valueIds) =>
                          onVariantAttributeValuesChange(variant.id, attributeId, valueIds)
                        }
                        labels={{
                          allBadge: t('admin.products.add.allValuesBadge'),
                          selectAll: t('admin.products.add.selectAllAttributeValues'),
                          done: t('admin.products.add.selectValuesDone'),
                          cancel: t('admin.products.add.selectValuesCancel'),
                        }}
                      />
                    ) : (
                      <p className="max-w-[200px] text-xs text-amber-700">
                        {t('admin.products.add.enableAttributesFirst')}
                      </p>
                    )
                  ) : (
                    <div className="min-w-[220px] text-xs text-gray-700">
                      {getVariantOptionLabel(variant) || t('admin.products.add.defaultColor')}
                    </div>
                  )}
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={variant.price}
                      onChange={(e) => {
                        onVariantUpdate((prev) =>
                          prev.map((v) => (v.id === variant.id ? { ...v, price: e.target.value } : v))
                        );
                      }}
                      placeholder={t('admin.products.add.pricePlaceholder')}
                      className="w-20 text-xs"
                      min="0"
                      step="0.01"
                    />
                    <span className="text-xs text-gray-500">{CURRENCIES[ADMIN_PRODUCT_INPUT_CURRENCY].symbol}</span>
                  </div>
                </td>
                {SHOW_COMPARE_AT_PRICE_FIELD ? (
                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={variant.compareAtPrice}
                        onChange={(e) => {
                          onVariantUpdate((prev) =>
                            prev.map((v) =>
                              v.id === variant.id ? { ...v, compareAtPrice: e.target.value } : v
                            )
                          );
                        }}
                        placeholder={t('admin.products.add.pricePlaceholder')}
                        className="w-20 text-xs"
                        min="0"
                        step="0.01"
                      />
                      <span className="text-xs text-gray-500">{CURRENCIES[ADMIN_PRODUCT_INPUT_CURRENCY].symbol}</span>
                    </div>
                  </td>
                ) : null}
                <td className="px-2 py-2 whitespace-nowrap">
                  <Input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => {
                      onVariantUpdate((prev) =>
                        prev.map((v) => (v.id === variant.id ? { ...v, stock: e.target.value } : v))
                      );
                    }}
                    placeholder={t('admin.products.add.quantityPlaceholder')}
                    className="w-16 text-xs"
                    min="0"
                  />
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <Input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => {
                      onVariantUpdate((prev) =>
                        prev.map((v) => (v.id === variant.id ? { ...v, sku: e.target.value } : v))
                      );
                    }}
                    placeholder={t('admin.products.add.autoGenerated')}
                    className="w-24 text-xs"
                  />
                </td>
                <td className="px-2 py-2 whitespace-nowrap align-middle">
                  <label className="inline-flex cursor-pointer items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={variant.isDisplayVariant}
                      onChange={() => {
                        onVariantUpdate((prev) =>
                          prev.map((v) => ({
                            ...v,
                            isDisplayVariant: v.id === variant.id,
                          }))
                        );
                      }}
                      className="h-4 w-4 rounded border-[#dcc090]/40 text-[#122a26] focus:ring-[#dcc090]"
                      aria-label={t('admin.products.add.displayVariant')}
                    />
                    <span className="text-xs text-gray-600">{t('admin.products.add.displayVariantShort')}</span>
                  </label>
                </td>
                <td className="px-2 py-2">
                  <div className="flex max-w-[220px] flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      {getGeneratedVariantImages(variant).map((image, imageIndex) => {
                        const isMain = imageIndex === getGeneratedVariantMainImageIndex(variant);
                        return (
                          <div key={`${image}-${imageIndex}`} className="relative inline-block">
                            <img
                              src={image}
                              alt="Variant"
                              className={`h-12 w-12 rounded-md border object-cover ${
                                isMain ? 'border-[#122a26] ring-2 ring-[#dcc090]' : 'border-gray-300'
                              }`}
                            />
                            <label className="absolute left-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded bg-white/90 shadow-sm">
                              <input
                                type="checkbox"
                                checked={isMain}
                                onChange={() => setVariantMainImage(variant.id, imageIndex)}
                                className="h-3 w-3 rounded border-gray-300 text-[#122a26] focus:ring-[#dcc090]"
                                aria-label="Set as main variant image"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => removeVariantImage(variant, imageIndex)}
                              className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
                              title={t('admin.products.add.removeImage')}
                            >
                              <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => variantImageInputRefs.current?.[variant.id]?.click()}
                      disabled={imageUploadLoading}
                      className="flex w-fit items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {imageUploadLoading ? t('admin.products.add.uploading') : t('admin.products.add.uploadImage')}
                    </button>
                    <input
                      ref={(el) => {
                        if (variantImageInputRefs.current) {
                          variantImageInputRefs.current[variant.id] = el;
                        }
                      }}
                      type="file"
                      multiple
                      accept={ADMIN_RASTER_IMAGE_FILE_ACCEPT}
                      onChange={(e) => onVariantImageUpload(variant.id, e)}
                      className="hidden"
                    />
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-right align-middle">
                  <button
                    type="button"
                    onClick={() => {
                      const wasDisplay = variant.isDisplayVariant;
                      onVariantUpdate((prev) => {
                        const next = prev.filter((v) => v.id !== variant.id);
                        if (wasDisplay && next.length > 0) {
                          return next.map((v, index) => ({
                            ...v,
                            isDisplayVariant: index === 0,
                          }));
                        }
                        return next;
                      });
                      if (variantImageInputRefs.current) {
                        delete variantImageInputRefs.current[variant.id];
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-md border border-red-200 bg-white p-1.5 text-red-600 hover:bg-red-50"
                    title={t('admin.products.add.deleteVariant')}
                    aria-label={t('admin.products.add.deleteVariant')}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="button" variant="outline" onClick={onVariantAdd}>
          {t('admin.products.add.addVariant') || 'Add variant'}
        </Button>
      </div>
    </div>
  );
}
