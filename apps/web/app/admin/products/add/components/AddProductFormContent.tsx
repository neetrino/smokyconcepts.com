'use client';

import { type ChangeEvent } from 'react';
import { Card, Input } from '@shop/ui';
import { CURRENCIES } from '@/lib/currency';
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

interface AddProductFormContentProps {
  formData: {
    title: string;
    slug: string;
    descriptionHtml: string;
    categoryIds: string[];
    primaryCategoryId: string;
    imageUrls: string[];
    featuredImageIndex: number;
    labels: ProductLabel[];
    featured: boolean;
    upcoming: boolean;
    variants: Variant[];
  };
  productType: 'simple' | 'variable';
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
  onProductTypeChange: (type: 'simple' | 'variable') => void;
  onUploadImages: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
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
}

export function AddProductFormContent({
  formData,
  productType,
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
  onProductTypeChange,
  onUploadImages,
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
}: AddProductFormContentProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-6 pb-24 sm:pb-24">
      <form onSubmit={handleSubmit} className="space-y-14">
        <BasicInformation
          productType={productType}
          setProductType={onProductTypeChange}
          title={formData.title}
          slug={formData.slug}
          descriptionHtml={formData.descriptionHtml}
          onTitleChange={onTitleChange}
          onSlugChange={onSlugChange}
          onSlugBlur={onSlugBlur}
          onDescriptionChange={onDescriptionChange}
        />

        <ProductImages
          imageUrls={formData.imageUrls}
          featuredImageIndex={formData.featuredImageIndex}
          imageUploadLoading={imageUploadLoading}
          imageUploadError={imageUploadError}
          fileInputRef={fileInputRef}
          onUploadImages={onUploadImages}
          onRemoveImage={onRemoveImage}
          onSetFeaturedImage={onSetFeaturedImage}
        />

        {productType === 'variable' && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-sm font-semibold text-gray-700">
              {t('admin.products.add.defaultPricing') || 'Default Pricing'}
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600 shrink-0">
                  {t('admin.products.add.price')}
                </label>
                <Input
                  type="number"
                  value={simpleProductData.price}
                  onChange={(e) => {
                    onPriceChange(e.target.value);
                  }}
                  placeholder={t('admin.products.add.pricePlaceholder')}
                  className="w-32 text-sm"
                  min="0"
                  step="0.01"
                />
                <span className="text-sm text-gray-500">{CURRENCIES.USD.symbol}</span>
              </div>
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
                <span className="text-sm text-gray-500">{CURRENCIES.USD.symbol}</span>
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

        <FormActions loading={loading} isEditMode={isEditMode} />
      </form>
    </Card>
  );
}

