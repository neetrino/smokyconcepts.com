'use client';

import { useMemo, useRef, useState, type SetStateAction } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTranslation } from '@/lib/i18n-client';
import { apiClient } from '@/lib/api-client';
import { useProductFormState } from './useProductFormState';
import { useProductDataLoading } from './useProductDataLoading';
import { useProductEditMode } from './useProductEditMode';
import { useVariantGeneration } from './useVariantGeneration';
import { useImageHandling } from './useImageHandling';
import { useLabelManagement } from './useLabelManagement';
import { useProductFormHandlers } from './useProductFormHandlers';
import { useProductFormCallbacks } from './useProductFormCallbacks';
import { useAutoSkuSyncForNewProduct } from './useAutoSkuSyncForNewProduct';
import { useAddProductPageEffects } from './useAddProductPageEffects';
import { isClothingCategory as checkIsClothingCategory, generateSlug } from '../utils/productUtils';
import { buildCategoryAttributesWithSizeCatalog } from '../utils/buildCategoryAttributesWithSizeCatalog';
import type { SizeCatalogCategoryDto } from '@/lib/types/size-catalog';
import type { Category } from '../types';

export function useAddProductPage() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const isEditMode = !!productId;
  const attributePoolSeededForProductRef = useRef<string | null>(null);
  const variableChosenWithEmptyRowsRef = useRef(!isEditMode);

  const formState = useProductFormState();
  const [sizeCatalogCategories, setSizeCatalogCategories] = useState<SizeCatalogCategoryDto[]>([]);
  const categoryAttributesForVariants = useMemo(
    () => buildCategoryAttributesWithSizeCatalog(formState.categoryAttributes, sizeCatalogCategories),
    [formState.categoryAttributes, sizeCatalogCategories]
  );

  useProductDataLoading({
    isLoggedIn,
    isAdmin,
    isLoading,
    setCategories: formState.setCategories,
    categoriesExpanded: formState.categoriesExpanded,
    setCategoriesExpanded: formState.setCategoriesExpanded,
  });

  useAutoSkuSyncForNewProduct({
    isEditMode,
    loadingProduct: formState.loadingProduct,
    slug: formState.formData.slug,
    simpleProductSku: formState.simpleProductData.sku,
    setSimpleProductData: formState.setSimpleProductData,
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

  useAddProductPageEffects({
    isLoggedIn,
    isAdmin,
    isEditMode,
    productId,
    formState,
    categoryAttributesForVariants,
    setSizeCatalogCategories,
    attributePoolSeededForProductRef,
    variableChosenWithEmptyRowsRef,
  });

  const { applyToAllVariants } = useVariantGeneration({
    setGeneratedVariants: formState.setGeneratedVariants,
  });

  const {
    handleTitleChange,
    handleSlugChange,
    handleSlugBlur,
    isClothingCategory,
    handleVariantAdd,
  } = useProductFormCallbacks({
    slug: formState.formData.slug,
    formData: formState.formData,
    categories: formState.categories,
    generatedVariants: formState.generatedVariants,
    setFormData: (updater) => formState.setFormData((prev) => updater(prev) as typeof formState.formData),
    setGeneratedVariants: formState.setGeneratedVariants,
    setSimpleProductData: (value) => formState.setSimpleProductData(value as SetStateAction<typeof formState.simpleProductData>),
    checkIsClothingCategory,
    productId,
    isEditMode,
  });

  const {
    removeImageUrl,
    setFeaturedImage,
    handleUploadImageFiles,
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
    categoryAttributes: categoryAttributesForVariants,
    setSubmitErrorKey: formState.setSubmitErrorKey,
    setSubmitErrorFieldId: formState.setSubmitErrorFieldId,
  });

  const handleProductTypeChange = (type: 'simple' | 'variable') => {
    if (!formState.variableProductTypeAllowed && type === 'variable') {
      return;
    }
    formState.setSubmitErrorKey(null);
    formState.setSubmitErrorFieldId(null);
    if (type === 'variable') {
      variableChosenWithEmptyRowsRef.current = true;
    } else {
      variableChosenWithEmptyRowsRef.current = false;
    }
    formState.setProductType(type);
  };

  const showPageLoading = isLoading || formState.loadingProduct;
  const canRenderForm = isLoggedIn && isAdmin;

  return {
    t,
    isEditMode,
    formState,
    categoryAttributesForVariants,
    showPageLoading,
    canRenderForm,
    handleTitleChange,
    handleSlugChange,
    handleSlugBlur,
    isClothingCategory,
    handleVariantAdd,
    removeImageUrl,
    setFeaturedImage,
    handleUploadImageFiles,
    handleUploadImages,
    handleUploadVariantImage,
    addLabel,
    removeLabel,
    updateLabel,
    handleCreateCategory,
    handleSubmit,
    handleProductTypeChange,
    applyToAllVariants,
    generateSlug,
  };
}
