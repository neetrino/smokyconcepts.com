'use client';

import { Suspense, useEffect, useRef, type SetStateAction } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../../lib/auth/AuthContext';
import { useTranslation } from '../../../../lib/i18n-client';
import { apiClient } from '../../../../lib/api-client';
import { PageHeader } from './components/PageHeader';
import { AddProductFormContent } from './components/AddProductFormContent';
import { useProductFormState } from './hooks/useProductFormState';
import { useProductDataLoading } from './hooks/useProductDataLoading';
import { useProductEditMode } from './hooks/useProductEditMode';
import { useVariantGeneration } from './hooks/useVariantGeneration';
import { useImageHandling } from './hooks/useImageHandling';
import { useLabelManagement } from './hooks/useLabelManagement';
import { useProductFormHandlers } from './hooks/useProductFormHandlers';
import { useProductFormCallbacks } from './hooks/useProductFormCallbacks';
import { isClothingCategory as checkIsClothingCategory, generateSlug } from './utils/productUtils';
import { buildSelectedAttributeValueIdsMap } from '@/lib/category-attributes';
import type { CategoryAttribute } from '@/lib/category-attributes';
import type { Category } from './types';

function AddProductPageContent() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const isEditMode = !!productId;
  const attributePoolSeededForProductRef = useRef<string | null>(null);

  const formState = useProductFormState();

  useProductDataLoading({
    isLoggedIn,
    isAdmin,
    isLoading,
    setCategories: formState.setCategories,
    categoriesExpanded: formState.categoriesExpanded,
    setCategoriesExpanded: formState.setCategoriesExpanded,
  });

  useProductEditMode({
    productId,
    isLoggedIn,
    isAdmin,
    setLoadingProduct: formState.setLoadingProduct,
    setFormData: (updater) => formState.setFormData((prev) => updater(prev) as typeof formState.formData),
    setUseNewCategory: formState.setUseNewCategory,
    setNewCategoryName: formState.setNewCategoryName,
    setHasVariantsToLoad: formState.setHasVariantsToLoad,
    setProductType: formState.setProductType,
    setSimpleProductData: (value) => formState.setSimpleProductData(value as SetStateAction<typeof formState.simpleProductData>),
    setGeneratedVariants: formState.setGeneratedVariants,
    setVariableProductTypeAllowed: formState.setVariableProductTypeAllowed,
  });

  useEffect(() => {
    if (!isEditMode) {
      formState.setVariableProductTypeAllowed(true);
    }
  }, [isEditMode, formState.setVariableProductTypeAllowed]);

  const { applyToAllVariants } = useVariantGeneration({
    setGeneratedVariants: formState.setGeneratedVariants,
  });

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      formState.setCategoryAttributes([]);
      return;
    }

    const loadGlobalAttributes = async () => {
      try {
        const response = await apiClient.get<{ data: CategoryAttribute[] }>(`/api/v1/admin/attributes`);
        formState.setCategoryAttributes(response.data || []);
      } catch (error: unknown) {
        console.error('❌ [ADMIN] Failed to load global attributes:', error);
        formState.setCategoryAttributes([]);
      }
    };

    void loadGlobalAttributes();
  }, [isLoggedIn, isAdmin, formState.setCategoryAttributes]);

  /** Edit mode: seed checkbox pool once from loaded variants (do not sync on every variant edit). */
  useEffect(() => {
    if (!isEditMode || !productId) {
      attributePoolSeededForProductRef.current = null;
      return;
    }
    if (formState.loadingProduct) {
      return;
    }
    if (formState.categoryAttributes.length === 0 || formState.generatedVariants.length === 0) {
      return;
    }
    if (attributePoolSeededForProductRef.current === productId) {
      return;
    }

    const derived = buildSelectedAttributeValueIdsMap(
      formState.categoryAttributes,
      formState.generatedVariants
    );
    if (Object.keys(derived).length === 0) {
      attributePoolSeededForProductRef.current = productId;
      return;
    }

    formState.setSelectedAttributeValueIds(derived);
    const enabled: Record<string, boolean> = {};
    formState.categoryAttributes.forEach((attribute) => {
      enabled[attribute.id] = Object.prototype.hasOwnProperty.call(derived, attribute.id);
    });
    formState.setEnabledAttributeIds(enabled);
    attributePoolSeededForProductRef.current = productId;
  }, [
    isEditMode,
    productId,
    formState.loadingProduct,
    formState.categoryAttributes,
    formState.generatedVariants,
    formState.setSelectedAttributeValueIds,
    formState.setEnabledAttributeIds,
  ]);

  useEffect(() => {
    if (formState.categoryAttributes.length === 0 && Object.keys(formState.selectedAttributeValueIds).length > 0) {
      formState.setSelectedAttributeValueIds({});
    }
    if (formState.categoryAttributes.length === 0 && Object.keys(formState.enabledAttributeIds).length > 0) {
      formState.setEnabledAttributeIds({});
    }
  }, [
    formState.categoryAttributes,
    formState.selectedAttributeValueIds,
    formState.enabledAttributeIds,
    formState.setSelectedAttributeValueIds,
    formState.setEnabledAttributeIds,
  ]);

  const {
    handleTitleChange,
    handleSlugBlur,
    isClothingCategory,
    handleVariantAdd,
  } = useProductFormCallbacks({
    formData: formState.formData,
    categories: formState.categories,
    generatedVariants: formState.generatedVariants,
    setFormData: (updater) => formState.setFormData((prev) => updater(prev) as typeof formState.formData),
    setGeneratedVariants: formState.setGeneratedVariants,
    setSimpleProductData: (value) => formState.setSimpleProductData(value as SetStateAction<typeof formState.simpleProductData>),
    checkIsClothingCategory,
    productId,
  });

  const {
    addImageUrl,
    removeImageUrl,
    setFeaturedImage,
    handleUploadImages,
    handleUploadVariantImage,
  } = useImageHandling({
    imageUrls: formState.formData.imageUrls,
    featuredImageIndex: formState.formData.featuredImageIndex,
    variants: formState.formData.variants,
    generatedVariants: formState.generatedVariants,
    colorImageTarget: formState.colorImageTarget,
    setImageUrls: (updater) => formState.setFormData((prev) => ({ ...prev, imageUrls: updater(prev.imageUrls) })),
    setFeaturedImageIndex: (index) => formState.setFormData((prev) => ({ ...prev, featuredImageIndex: index })),
    setMainProductImage: (image) => formState.setFormData((prev) => ({ ...prev, mainProductImage: image })),
    setVariants: (updater) => formState.setFormData((prev) => ({ ...prev, variants: updater(prev.variants) })),
    setGeneratedVariants: formState.setGeneratedVariants,
    setImageUploadLoading: formState.setImageUploadLoading,
    setImageUploadError: formState.setImageUploadError,
    setColorImageTarget: formState.setColorImageTarget,
    t,
  });

  const { addLabel, removeLabel, updateLabel } = useLabelManagement(
    formState.formData.labels,
    (updater) => formState.setFormData((prev) => ({ ...prev, labels: updater(prev.labels) }))
  );

  const handleCreateCategory = async (categoryName: string): Promise<void> => {
    const trimmedCategoryName = categoryName.trim();
    if (!trimmedCategoryName) {
      return;
    }

    const categoryResponse = await apiClient.post<{ data: Category }>('/api/v1/admin/categories', {
      title: trimmedCategoryName,
      locale: 'en',
      requiresSizes: false,
    });
    const createdCategory = categoryResponse.data;
    if (!createdCategory) {
      return;
    }

    formState.setCategories((prev) => {
      if (prev.some((category) => category.id === createdCategory.id)) {
        return prev;
      }
      return [...prev, createdCategory];
    });

    formState.setFormData((prev) => {
      const nextCategoryIds = prev.categoryIds.includes(createdCategory.id)
        ? prev.categoryIds
        : [...prev.categoryIds, createdCategory.id];

      return {
        ...prev,
        categoryIds: nextCategoryIds,
        primaryCategoryId: prev.primaryCategoryId || createdCategory.id,
      };
    });
  };

  const { handleSubmit } = useProductFormHandlers({
    formData: formState.formData,
    setFormData: (updater) => formState.setFormData((prev) => updater(prev) as typeof formState.formData),
    setLoading: formState.setLoading,
    setCategories: formState.setCategories,
    productType: formState.productType,
    simpleProductData: formState.simpleProductData,
    generatedVariants: formState.generatedVariants,
    useNewCategory: formState.useNewCategory,
    newCategoryName: formState.newCategoryName,
    isEditMode,
    productId,
    isClothingCategory,
    categoryAttributes: formState.categoryAttributes,
  });

  if (isLoading || formState.loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {formState.loadingProduct ? t('admin.products.add.loadingProduct') : t('admin.products.add.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  const handleProductTypeChange = (type: 'simple' | 'variable') => {
    if (!formState.variableProductTypeAllowed && type === 'variable') {
      return;
    }
    formState.setProductType(type);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div>
          <PageHeader isEditMode={isEditMode} />

          <AddProductFormContent
            formData={formState.formData}
            productType={formState.productType}
            simpleProductData={formState.simpleProductData}
            categories={formState.categories}
            isEditMode={isEditMode}
            loading={formState.loading}
            imageUploadLoading={formState.imageUploadLoading}
            imageUploadError={formState.imageUploadError}
            categoriesExpanded={formState.categoriesExpanded}
            useNewCategory={formState.useNewCategory}
            newCategoryName={formState.newCategoryName}
            generatedVariants={formState.generatedVariants}
            categoryAttributes={formState.categoryAttributes}
            selectedAttributeValueIds={formState.selectedAttributeValueIds}
            enabledAttributeIds={formState.enabledAttributeIds}
            onEnabledAttributeIdsChange={formState.setEnabledAttributeIds}
            hasVariantsToLoad={formState.hasVariantsToLoad}
            fileInputRef={formState.fileInputRef}
            variantImageInputRefs={formState.variantImageInputRefs}
            onTitleChange={handleTitleChange}
            onSlugChange={(e) => formState.setFormData((prev) => ({ ...prev, slug: e.target.value }))}
            onSlugBlur={handleSlugBlur}
            onDescriptionChange={(e) => formState.setFormData((prev) => ({ ...prev, descriptionHtml: e.target.value }))}
            variableProductTypeAllowed={formState.variableProductTypeAllowed}
            onProductTypeChange={handleProductTypeChange}
            onUploadImages={handleUploadImages}
            onRemoveImage={removeImageUrl}
            onSetFeaturedImage={setFeaturedImage}
            onCategoriesExpandedChange={formState.setCategoriesExpanded}
            onUseNewCategoryChange={formState.setUseNewCategory}
            onNewCategoryNameChange={formState.setNewCategoryName}
            onCategoryIdsChange={(ids) => formState.setFormData((prev) => ({ ...prev, categoryIds: ids }))}
            onPrimaryCategoryIdChange={(id) => formState.setFormData((prev) => ({ ...prev, primaryCategoryId: id }))}
            onCreateCategory={handleCreateCategory}
            onPriceChange={(value) => formState.setSimpleProductData((prev) => ({ ...prev, price: value }))}
            onCompareAtPriceChange={(value) => formState.setSimpleProductData((prev) => ({ ...prev, compareAtPrice: value }))}
            onSkuChange={(value) => formState.setSimpleProductData((prev) => ({ ...prev, sku: value }))}
            onQuantityChange={(value) => formState.setSimpleProductData((prev) => ({ ...prev, quantity: value }))}
            onVariantUpdate={formState.setGeneratedVariants}
            onVariantAdd={handleVariantAdd}
            onSelectedAttributeValueIdsChange={formState.setSelectedAttributeValueIds}
            onVariantImageUpload={(variantId, event) => handleUploadVariantImage(variantId, event)}
            onAddLabel={addLabel}
            onRemoveLabel={removeLabel}
            onUpdateLabel={(index, field, value) => updateLabel(index, field, value)}
            onFeaturedChange={(featured) => formState.setFormData((prev) => ({ ...prev, featured }))}
            onUpcomingChange={(upcoming) => formState.setFormData((prev) => ({ ...prev, upcoming }))}
            onVariantsUpdate={(updater) => formState.setFormData((prev) => ({ ...prev, variants: updater(prev.variants) }))}
            onApplyToAllVariants={(field, value) => applyToAllVariants(field, value)}
            isClothingCategory={isClothingCategory}
            generateSlug={generateSlug}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <AddProductPageContent />
    </Suspense>
  );
}
