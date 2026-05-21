'use client';

import { Suspense, useEffect, useMemo, useRef, useState, type SetStateAction } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../../lib/auth/AuthContext';
import { useTranslation } from '../../../../lib/i18n-client';
import { apiClient } from '../../../../lib/api-client';
import { AddProductFormContent } from './components/AddProductFormContent';
import { useProductFormState } from './hooks/useProductFormState';
import { useProductDataLoading } from './hooks/useProductDataLoading';
import { useProductEditMode } from './hooks/useProductEditMode';
import { useVariantGeneration } from './hooks/useVariantGeneration';
import { useImageHandling } from './hooks/useImageHandling';
import { useLabelManagement } from './hooks/useLabelManagement';
import { useProductFormHandlers } from './hooks/useProductFormHandlers';
import { useProductFormCallbacks } from './hooks/useProductFormCallbacks';
import { useAutoSkuSyncForNewProduct } from './hooks/useAutoSkuSyncForNewProduct';
import { isClothingCategory as checkIsClothingCategory, generateSlug } from './utils/productUtils';
import { AdminShell } from '../../components/AdminShell';
import { buildSelectedAttributeValueIdsMap } from '@/lib/category-attributes';
import type { CategoryAttribute } from '@/lib/category-attributes';
import type { SizeCatalogCategoryDto } from '@/lib/types/size-catalog';
import type { Category } from './types';

const DYNAMIC_SIZE_ATTRIBUTE_ID = '__dynamic_size_catalog_attribute__';
const DYNAMIC_SIZE_VERSION_ATTRIBUTE_ID = '__dynamic_size_catalog_version_attribute__';
const DYNAMIC_SIZE_ATTRIBUTE_KEY = 'size';
const DYNAMIC_SIZE_VERSION_ATTRIBUTE_KEY = 'size_version';
const DYNAMIC_SIZE_ATTRIBUTE_TITLE = 'Sizes';
const DYNAMIC_SIZE_VERSION_ATTRIBUTE_TITLE = 'Version';

function normalizeCatalogToken(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

function buildCategoryAttributesWithSizeCatalog(
  categoryAttributes: CategoryAttribute[],
  sizeCatalogCategories: SizeCatalogCategoryDto[]
): CategoryAttribute[] {
  const baseAttributes = categoryAttributes.filter(
    (attribute) =>
      attribute.key !== DYNAMIC_SIZE_ATTRIBUTE_KEY &&
      attribute.key !== DYNAMIC_SIZE_VERSION_ATTRIBUTE_KEY
  );
  if (sizeCatalogCategories.length === 0) {
    return baseAttributes;
  }

  const collectionMap = new Map<
    string,
    {
      title: string;
      token: string;
      previewImageUrl: string | null;
      versions: Set<string>;
    }
  >();

  sizeCatalogCategories.forEach((category) => {
    const title = category.title.trim();
    if (!title) {
      return;
    }
    const normalizedTitle = title.toLowerCase();
    const token = normalizeCatalogToken(title);
    const current = collectionMap.get(normalizedTitle) ?? {
      title,
      token,
      previewImageUrl: null,
      versions: new Set<string>(),
    };

    if (!current.previewImageUrl) {
      const firstImage = category.items.find((item) => item.imageUrl)?.imageUrl ?? null;
      current.previewImageUrl = firstImage;
    }

    category.items.forEach((item) => {
      const version = item.version.trim();
      if (version) {
        current.versions.add(version);
      }
    });

    collectionMap.set(normalizedTitle, current);
  });

  const collections = Array.from(collectionMap.values()).sort((a, b) => a.title.localeCompare(b.title));
  if (collections.length === 0) {
    return baseAttributes;
  }

  const sizeAttribute: CategoryAttribute = {
    id: DYNAMIC_SIZE_ATTRIBUTE_ID,
    key: DYNAMIC_SIZE_ATTRIBUTE_KEY,
    title: DYNAMIC_SIZE_ATTRIBUTE_TITLE,
    values: collections.map((collection) => ({
      id: `size-catalog-collection:${collection.token}`,
      value: collection.title,
      label: collection.title,
      colors: [],
      imageUrl: collection.previewImageUrl,
    })),
  };

  const versionAttribute: CategoryAttribute = {
    id: DYNAMIC_SIZE_VERSION_ATTRIBUTE_ID,
    key: DYNAMIC_SIZE_VERSION_ATTRIBUTE_KEY,
    title: DYNAMIC_SIZE_VERSION_ATTRIBUTE_TITLE,
    values: collections.flatMap((collection) =>
      Array.from(collection.versions)
        .sort((a, b) => a.localeCompare(b))
        .map((version) => ({
          id: `size-catalog-version:${collection.token}:${normalizeCatalogToken(version)}`,
          value: version,
          label: version,
          colors: [],
          imageUrl: null,
        }))
    ),
  };

  return [...baseAttributes, sizeAttribute, versionAttribute];
}

function AddProductPageContent() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const isEditMode = !!productId;
  const attributePoolSeededForProductRef = useRef<string | null>(null);
  /** True after user picks Variable while rows are still empty — skips auto-revert to Simple (edit mode). */
  const variableChosenWithEmptyRowsRef = useRef(false);

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

  useEffect(() => {
    if (!isEditMode) {
      formState.setVariableProductTypeAllowed(true);
    }
  }, [isEditMode, formState.setVariableProductTypeAllowed]);

  useEffect(() => {
    variableChosenWithEmptyRowsRef.current = false;
  }, [productId]);

  useEffect(() => {
    if (formState.generatedVariants.length > 0) {
      variableChosenWithEmptyRowsRef.current = false;
    }
  }, [formState.generatedVariants.length]);

  /**
   * Edit: variable product with zero rows → Simple (e.g. last row deleted).
   * Skip when the user just chose Variable from Simple (empty rows until they click Add variant).
   */
  useEffect(() => {
    if (!isEditMode || !productId || formState.loadingProduct) {
      return;
    }
    if (formState.productType !== 'variable') {
      return;
    }
    if (formState.generatedVariants.length > 0) {
      return;
    }
    if (variableChosenWithEmptyRowsRef.current) {
      return;
    }
    formState.setProductType('simple');
    formState.setVariableProductTypeAllowed(true);
  }, [
    isEditMode,
    productId,
    formState.loadingProduct,
    formState.productType,
    formState.generatedVariants.length,
    formState.setProductType,
    formState.setVariableProductTypeAllowed,
  ]);

  useEffect(() => {
    if (formState.submitErrorKey !== 'variableSubmitNeedVariants') {
      return;
    }
    if (formState.generatedVariants.length === 0) {
      return;
    }
    formState.setSubmitErrorKey(null);
  }, [
    formState.submitErrorKey,
    formState.generatedVariants.length,
    formState.setSubmitErrorKey,
  ]);

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

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      setSizeCatalogCategories([]);
      return;
    }

    const loadSizeCatalogCategories = async () => {
      try {
        const response = await apiClient.get<{ data: SizeCatalogCategoryDto[] }>(
          '/api/v1/admin/size-catalog/categories'
        );
        setSizeCatalogCategories(Array.isArray(response.data) ? response.data : []);
      } catch (error: unknown) {
        console.error('❌ [ADMIN] Failed to load size catalog categories:', error);
        setSizeCatalogCategories([]);
      }
    };

    void loadSizeCatalogCategories();
  }, [isLoggedIn, isAdmin]);

  /** Edit mode: seed checkbox pool once from loaded variants (do not sync on every variant edit). */
  useEffect(() => {
    if (!isEditMode || !productId) {
      attributePoolSeededForProductRef.current = null;
      return;
    }
    if (formState.loadingProduct) {
      return;
    }
    if (categoryAttributesForVariants.length === 0 || formState.generatedVariants.length === 0) {
      return;
    }
    if (attributePoolSeededForProductRef.current === productId) {
      return;
    }

    const derived = buildSelectedAttributeValueIdsMap(
      categoryAttributesForVariants,
      formState.generatedVariants
    );
    if (Object.keys(derived).length === 0) {
      attributePoolSeededForProductRef.current = productId;
      return;
    }

    formState.setSelectedAttributeValueIds(derived);
    const enabled: Record<string, boolean> = {};
    categoryAttributesForVariants.forEach((attribute) => {
      enabled[attribute.id] = Object.prototype.hasOwnProperty.call(derived, attribute.id);
    });
    formState.setEnabledAttributeIds(enabled);
    attributePoolSeededForProductRef.current = productId;
  }, [
    isEditMode,
    productId,
    formState.loadingProduct,
    categoryAttributesForVariants,
    formState.generatedVariants,
    formState.setSelectedAttributeValueIds,
    formState.setEnabledAttributeIds,
  ]);

  useEffect(() => {
    if (
      categoryAttributesForVariants.length === 0 &&
      Object.keys(formState.selectedAttributeValueIds).length > 0
    ) {
      formState.setSelectedAttributeValueIds({});
    }
    if (
      categoryAttributesForVariants.length === 0 &&
      Object.keys(formState.enabledAttributeIds).length > 0
    ) {
      formState.setEnabledAttributeIds({});
    }
  }, [
    categoryAttributesForVariants,
    formState.selectedAttributeValueIds,
    formState.enabledAttributeIds,
    formState.setSelectedAttributeValueIds,
    formState.setEnabledAttributeIds,
  ]);

  useEffect(() => {
    const allowedValueIds = new Set(
      categoryAttributesForVariants.flatMap((attribute) => attribute.values.map((value) => value.id))
    );
    if (allowedValueIds.size === 0) {
      return;
    }

    formState.setGeneratedVariants((prev) => {
      let hasChanges = false;
      const nextVariants = prev.map((variant) => {
        const nextSelectedValueIds = variant.selectedValueIds.filter((valueId) => allowedValueIds.has(valueId));
        if (nextSelectedValueIds.length === variant.selectedValueIds.length) {
          return variant;
        }
        hasChanges = true;
        return { ...variant, selectedValueIds: nextSelectedValueIds };
      });
      return hasChanges ? nextVariants : prev;
    });

    formState.setSelectedAttributeValueIds((prev) => {
      let hasChanges = false;
      const next: Record<string, string[]> = {};

      Object.entries(prev).forEach(([attributeId, valueIds]) => {
        const filtered = valueIds.filter((valueId) => allowedValueIds.has(valueId));
        if (filtered.length > 0) {
          next[attributeId] = filtered;
        }
        if (filtered.length !== valueIds.length) {
          hasChanges = true;
        }
      });

      return hasChanges ? next : prev;
    });
  }, [categoryAttributesForVariants, formState.setGeneratedVariants, formState.setSelectedAttributeValueIds]);

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
    addImageUrl,
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
    formState.setSubmitErrorKey(null);
    if (type === 'variable') {
      variableChosenWithEmptyRowsRef.current = true;
    } else {
      variableChosenWithEmptyRowsRef.current = false;
    }
    formState.setProductType(type);
  };

  return (
    <div className="min-h-screen bg-[#efefef] pt-[3.75rem] pb-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <AdminShell>
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
            categoryAttributes={categoryAttributesForVariants}
            selectedAttributeValueIds={formState.selectedAttributeValueIds}
            enabledAttributeIds={formState.enabledAttributeIds}
            onEnabledAttributeIdsChange={formState.setEnabledAttributeIds}
            hasVariantsToLoad={formState.hasVariantsToLoad}
            fileInputRef={formState.fileInputRef}
            variantImageInputRefs={formState.variantImageInputRefs}
            onTitleChange={handleTitleChange}
            onSlugChange={handleSlugChange}
            onSlugBlur={handleSlugBlur}
            onDescriptionChange={(e) => formState.setFormData((prev) => ({ ...prev, descriptionHtml: e.target.value }))}
            onProductDetailsChange={(e) =>
              formState.setFormData((prev) => ({ ...prev, productDetailsHtml: e.target.value }))
            }
            onShippingChange={(e) => formState.setFormData((prev) => ({ ...prev, shippingHtml: e.target.value }))}
            variableProductTypeAllowed={formState.variableProductTypeAllowed}
            onProductTypeChange={handleProductTypeChange}
            onUploadImages={handleUploadImages}
            onUploadImageFiles={handleUploadImageFiles}
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
            submitErrorKey={formState.submitErrorKey}
          />
        </AdminShell>
      </div>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#efefef] flex items-center justify-center">
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
