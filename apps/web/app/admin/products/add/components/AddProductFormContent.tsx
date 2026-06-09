'use client';

import { type ChangeEvent } from 'react';
import { Card } from '@shop/ui';
import { useTranslation } from '@/lib/i18n-client';
import type { Category, Variant, ProductLabel, GeneratedVariant } from '../types';
import type { CategoryAttribute } from '@/lib/category-attributes';
import { BasicInformation } from './BasicInformation';
import { CategoriesBrands } from './CategoriesBrands';
import { VariantBuilder } from './VariantBuilder';
import { ProductLabels } from './ProductLabels';
import { Publishing } from './Publishing';
import { FormActions } from './FormActions';
import type { ProductFormFieldId } from '../constants/productFormFieldIds.constants';

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
    labels: ProductLabel[];
    featured: boolean;
    upcoming: boolean;
    variants: Variant[];
  };
  categories: Category[];
  isEditMode: boolean;
  loading: boolean;
  imageUploadLoading: boolean;
  categoriesExpanded: boolean;
  useNewCategory: boolean;
  newCategoryName: string;
  generatedVariants: GeneratedVariant[];
  categoryAttributes: CategoryAttribute[];
  selectedAttributeValueIds: Record<string, string[]>;
  enabledAttributeIds: Record<string, boolean>;
  onEnabledAttributeIdsChange: (next: Record<string, boolean>) => void;
  hasVariantsToLoad: boolean;
  variantImageInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  onTitleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSlugChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSlugBlur?: () => void;
  onDescriptionChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onProductDetailsChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onShippingChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onCategoriesExpandedChange: (expanded: boolean) => void;
  onUseNewCategoryChange: (use: boolean) => void;
  onNewCategoryNameChange: (name: string) => void;
  onCategoryIdsChange: (ids: string[]) => void;
  onPrimaryCategoryIdChange: (id: string) => void;
  onCreateCategory: (name: string) => Promise<void>;
  onVariantUpdate: (variants: GeneratedVariant[] | ((prev: GeneratedVariant[]) => GeneratedVariant[])) => void;
  onVariantAdd: () => void;
  onSelectedAttributeValueIdsChange: (value: Record<string, string[]>) => void;
  onVariantImageUpload: (variantId: string, event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onAddLabel: () => void;
  onRemoveLabel: (index: number) => void;
  onUpdateLabel: (index: number, field: keyof ProductLabel, value: unknown) => void;
  onFeaturedChange: (featured: boolean) => void;
  onUpcomingChange: (upcoming: boolean) => void;
  onVariantsUpdate: (updater: (prev: Variant[]) => Variant[]) => void;
  onApplyToAllVariants: (field: 'price' | 'compareAtPrice' | 'stock' | 'sku', value: string) => void;
  isClothingCategory: () => boolean;
  generateSlug: (text: string) => string;
  handleSubmit: (e: React.FormEvent) => void;
  submitErrorKey: string | null;
  submitErrorFieldId?: ProductFormFieldId | null;
}

export function AddProductFormContent({
  formData,
  categories,
  isEditMode,
  loading,
  imageUploadLoading,
  categoriesExpanded,
  useNewCategory,
  newCategoryName,
  generatedVariants,
  categoryAttributes,
  selectedAttributeValueIds,
  enabledAttributeIds,
  onEnabledAttributeIdsChange,
  hasVariantsToLoad,
  variantImageInputRefs,
  onTitleChange,
  onSlugChange,
  onSlugBlur,
  onDescriptionChange,
  onProductDetailsChange,
  onShippingChange,
  onCategoriesExpandedChange,
  onUseNewCategoryChange,
  onNewCategoryNameChange,
  onCategoryIdsChange,
  onPrimaryCategoryIdChange,
  onCreateCategory,
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
}: AddProductFormContentProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-6 pb-24 sm:pb-24">
      <form onSubmit={handleSubmit} className="space-y-14">
        <BasicInformation
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
