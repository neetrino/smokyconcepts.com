'use client';

import { type ChangeEvent } from 'react';
import { Card, Input } from '@shop/ui';
import { ADMIN_PRODUCT_INPUT_CURRENCY, CURRENCIES } from '@/lib/currency';
import { useTranslation } from '@/lib/i18n-client';
import type { Category, Variant, ProductLabel, GeneratedVariant } from '../types';
import type { CategoryAttribute } from '@/lib/category-attributes';
import { BasicInformation } from './BasicInformation';
import { ProductImages } from './ProductImages';
import { CategoriesBrands } from './CategoriesBrands';
import { SimpleProductFields } from './SimpleProductFields';
import { VariantBuilder } from './VariantBuilder';
import { ProductLabels } from './ProductLabels';
import { Publishing } from './Publishing';
import { FormActions } from './FormActions';
import { SHOW_COMPARE_AT_PRICE_FIELD } from '../constants/compareAtPriceVisibility.constants';
import { PRODUCT_FORM_FIELD, type ProductFormFieldId } from '../constants/productFormFieldIds.constants';
import { getProductFieldInputClassName } from '../utils/productFieldInputClassName';

interface AddProductFormContentProps {
  formData: {
    title: string;
    slug: string;
    descriptionHtml: string;
    productDetailsHtml: string;
    shippingHtml: string;
    categoryIds: string[];
    primaryCategoryId: string;
    sizeCatalogCategoryId: string;
    sizeCatalogCategoryTitle: string;
    imageUrls: string[];
    featuredImageIndex: number;
    labels: ProductLabel[];
    featured: boolean;
    upcoming: boolean;
    variants: Variant[];
  };
  productType: 'simple' | 'variable';
  /** When false, Variable type is hidden (edit: product has no selectable variants). */
  variableProductTypeAllowed: boolean;
  simpleProductData: {
    price: string;
    compareAtPrice: string;
    sku: string;
    quantity: string;
  };
  categories: Category[];
  isEditMode: boolean;
  loading: boolean;
  imageUploadLoading: boolean;
  imageUploadError: string | null;
  categoriesExpanded: boolean;
  useNewCategory: boolean;
  newCategoryName: string;
  generatedVariants: GeneratedVariant[];
  categoryAttributes: CategoryAttribute[];
  selectedAttributeValueIds: Record<string, string[]>;
  enabledAttributeIds: Record<string, boolean>;
  onEnabledAttributeIdsChange: (next: Record<string, boolean>) => void;
  hasVariantsToLoad: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  variantImageInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  onTitleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSlugChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSlugBlur?: () => void;
  onDescriptionChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onProductDetailsChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onShippingChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onProductTypeChange: (type: 'simple' | 'variable') => void;
  onUploadImages: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onUploadImageFiles: (files: File[]) => Promise<void>;
  onRemoveImage: (index: number) => void;
  onSetFeaturedImage: (index: number) => void;
  onCategoriesExpandedChange: (expanded: boolean) => void;
  onUseNewCategoryChange: (use: boolean) => void;
  onNewCategoryNameChange: (name: string) => void;
  onCategoryIdsChange: (ids: string[]) => void;
  onPrimaryCategoryIdChange: (id: string) => void;
  onCreateCategory: (name: string) => Promise<void>;
  onPriceChange: (value: string) => void;
  onCompareAtPriceChange: (value: string) => void;
  onSkuChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onVariantUpdate: (variants: GeneratedVariant[] | ((prev: GeneratedVariant[]) => GeneratedVariant[])) => void;
  onVariantAdd: () => void;
  onSelectedAttributeValueIdsChange: (value: Record<string, string[]>) => void;
  onVariantImageUpload: (variantId: string, event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onAddLabel: () => void;
  onRemoveLabel: (index: number) => void;
  onUpdateLabel: (index: number, field: keyof ProductLabel, value: any) => void;
  onFeaturedChange: (featured: boolean) => void;
  onUpcomingChange: (upcoming: boolean) => void;
  onVariantsUpdate: (updater: (prev: Variant[]) => Variant[]) => void;
  onApplyToAllVariants: (field: 'price' | 'compareAtPrice' | 'stock' | 'sku', value: string) => void;
  isClothingCategory: () => boolean;
  generateSlug: (text: string) => string;
  handleSubmit: (e: React.FormEvent) => void;
  /** Suffix for t('admin.products.add.<key>') when client-side validation blocks save. */
  submitErrorKey: string | null;
  submitErrorFieldId?: ProductFormFieldId | null;
}

export function AddProductFormContent({
  formData,
  productType,
  variableProductTypeAllowed,
  simpleProductData,
  categories,
  isEditMode,
  loading,
  imageUploadLoading,
  imageUploadError,
  categoriesExpanded,
  useNewCategory,
  newCategoryName,
  generatedVariants,
  categoryAttributes,
  selectedAttributeValueIds,
  enabledAttributeIds,
  onEnabledAttributeIdsChange,
  hasVariantsToLoad,
  fileInputRef,
  variantImageInputRefs,
  onTitleChange,
  onSlugChange,
  onSlugBlur,
  onDescriptionChange,
  onProductDetailsChange,
  onShippingChange,
  onProductTypeChange,
  onUploadImages,
  onUploadImageFiles,
  onRemoveImage,
  onSetFeaturedImage,
  onCategoriesExpandedChange,
  onUseNewCategoryChange,
  onNewCategoryNameChange,
  onCategoryIdsChange,
  onPrimaryCategoryIdChange,
  onCreateCategory,
  onPriceChange,
  onCompareAtPriceChange,
  onSkuChange,
  onQuantityChange,
  onVariantUpdate,
  onVariantAdd,
  onSelectedAttributeValueIdsChange,
  onVariantImageUpload,
  onAddLabel,
  onRemoveLabel,
  onUpdateLabel,
  onFeaturedChange,
  onUpcomingChange,
  onVariantsUpdate,
  onApplyToAllVariants,
  isClothingCategory,
  generateSlug,
  handleSubmit,
  submitErrorKey,
  submitErrorFieldId,
}: AddProductFormContentProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-6 pb-24 sm:pb-24">
      <form onSubmit={handleSubmit} className="space-y-14">
        <BasicInformation
          productType={productType}
          variableProductTypeAllowed={variableProductTypeAllowed}
          setProductType={onProductTypeChange}
          title={formData.title}
          slug={formData.slug}
          descriptionHtml={formData.descriptionHtml}
          productDetailsHtml={formData.productDetailsHtml}
          shippingHtml={formData.shippingHtml}
          onTitleChange={onTitleChange}
          onSlugChange={onSlugChange}
          onSlugBlur={onSlugBlur}
          onDescriptionChange={onDescriptionChange}
          onProductDetailsChange={onProductDetailsChange}
          onShippingChange={onShippingChange}
        />

        <ProductImages
          imageUrls={formData.imageUrls}
          featuredImageIndex={formData.featuredImageIndex}
          imageUploadLoading={imageUploadLoading}
          imageUploadError={imageUploadError}
          fileInputRef={fileInputRef}
          onUploadImages={onUploadImages}
          onUploadImageFiles={onUploadImageFiles}
          onRemoveImage={onRemoveImage}
          onSetFeaturedImage={onSetFeaturedImage}
        />

        {productType === 'variable' && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-sm font-semibold text-gray-700">
              {t('admin.products.add.defaultPricing') || 'Default Pricing'}
            </p>
            <div
              className={`grid gap-4 ${
                SHOW_COMPARE_AT_PRICE_FIELD ? 'grid-cols-1 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'
              }`}
            >
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600 shrink-0">
                  {t('admin.products.add.price')} *
                </label>
                <Input
                  type="number"
                  data-product-field={PRODUCT_FORM_FIELD.PRICE}
                  value={simpleProductData.price}
                  onChange={(e) => {
                    onPriceChange(e.target.value);
                  }}
                  placeholder={t('admin.products.add.pricePlaceholder')}
                  className={getProductFieldInputClassName(
                    PRODUCT_FORM_FIELD.PRICE,
                    submitErrorFieldId,
                    'w-32 text-sm'
                  )}
                  min="0"
                  step="0.01"
                  aria-invalid={submitErrorFieldId === PRODUCT_FORM_FIELD.PRICE}
                />
                <span className="text-sm text-gray-500">{CURRENCIES[ADMIN_PRODUCT_INPUT_CURRENCY].symbol}</span>
              </div>
              {SHOW_COMPARE_AT_PRICE_FIELD ? (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-600 shrink-0">
                    {t('admin.products.add.compareAtPrice')}
                  </label>
                  <Input
                    type="number"
                    value={simpleProductData.compareAtPrice}
                    onChange={(e) => {
                      onCompareAtPriceChange(e.target.value);
                    }}
                    placeholder={t('admin.products.add.pricePlaceholder')}
                    className="w-32 text-sm"
                    min="0"
                    step="0.01"
                  />
                  <span className="text-sm text-gray-500">{CURRENCIES[ADMIN_PRODUCT_INPUT_CURRENCY].symbol}</span>
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600 shrink-0">
                  {t('admin.products.add.sku')}
                </label>
                <Input
                  type="text"
                  value={simpleProductData.sku}
                  onChange={(e) => {
                    onSkuChange(e.target.value);
                  }}
                  placeholder={t('admin.products.add.autoGenerated')}
                  className="w-40 min-w-[8rem] text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600 shrink-0">
                  {t('admin.products.add.quantity')} *
                </label>
                <Input
                  type="number"
                  data-product-field={PRODUCT_FORM_FIELD.QUANTITY}
                  value={simpleProductData.quantity}
                  onChange={(e) => {
                    onQuantityChange(e.target.value);
                  }}
                  placeholder={t('admin.products.add.quantityPlaceholder')}
                  className={getProductFieldInputClassName(
                    PRODUCT_FORM_FIELD.QUANTITY,
                    submitErrorFieldId,
                    'w-28 text-sm'
                  )}
                  min="0"
                  aria-invalid={submitErrorFieldId === PRODUCT_FORM_FIELD.QUANTITY}
                />
              </div>
            </div>
          </div>
        )}

        <CategoriesBrands
          categories={categories}
          categoryIds={formData.categoryIds}
          categoriesExpanded={categoriesExpanded}
          useNewCategory={useNewCategory}
          newCategoryName={newCategoryName}
          onCategoriesExpandedChange={onCategoriesExpandedChange}
          onUseNewCategoryChange={onUseNewCategoryChange}
          onNewCategoryNameChange={onNewCategoryNameChange}
          onCategoryIdsChange={onCategoryIdsChange}
          onPrimaryCategoryIdChange={onPrimaryCategoryIdChange}
          onCreateCategory={onCreateCategory}
          isClothingCategory={isClothingCategory}
          onVariantsUpdate={onVariantsUpdate}
        />

        {productType === 'simple' && (
          <SimpleProductFields
            price={simpleProductData.price}
            compareAtPrice={simpleProductData.compareAtPrice}
            sku={simpleProductData.sku}
            quantity={simpleProductData.quantity}
            invalidFieldId={submitErrorFieldId}
            onPriceChange={onPriceChange}
            onCompareAtPriceChange={onCompareAtPriceChange}
            onSkuChange={onSkuChange}
            onQuantityChange={onQuantityChange}
          />
        )}

        {productType === 'variable' && (
          <VariantBuilder
            generatedVariants={generatedVariants}
            categoryAttributes={categoryAttributes}
            selectedAttributeValueIds={selectedAttributeValueIds}
            enabledAttributeIds={enabledAttributeIds}
            onEnabledAttributeIdsChange={onEnabledAttributeIdsChange}
            isEditMode={isEditMode}
            hasVariantsToLoad={hasVariantsToLoad}
            imageUploadLoading={imageUploadLoading}
            slug={formData.slug}
            title={formData.title}
            variantImageInputRefs={variantImageInputRefs}
            onVariantUpdate={onVariantUpdate}
            onVariantAdd={onVariantAdd}
            onSelectedAttributeValueIdsChange={onSelectedAttributeValueIdsChange}
            onApplyToAll={onApplyToAllVariants}
            onVariantImageUpload={onVariantImageUpload}
            generateSlug={generateSlug}
          />
        )}

        <ProductLabels
          labels={formData.labels}
          onAddLabel={onAddLabel}
          onRemoveLabel={onRemoveLabel}
          onUpdateLabel={onUpdateLabel}
        />

        <Publishing featured={formData.featured} onFeaturedChange={onFeaturedChange} upcoming={formData.upcoming} onUpcomingChange={onUpcomingChange} />

        {submitErrorKey ? (
          <p className="text-sm font-medium text-red-600" role="alert">
            {t(`admin.products.add.${submitErrorKey}`)}
          </p>
        ) : null}

        <FormActions loading={loading} isEditMode={isEditMode} />
      </form>
    </Card>
  );
}

