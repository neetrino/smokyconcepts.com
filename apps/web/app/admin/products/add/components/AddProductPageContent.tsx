'use client';

import { AdminShell } from '../../../components/AdminShell';
import { AddProductFormContent } from './AddProductFormContent';
import { useAddProductPage } from '../hooks/useAddProductPage';
import { PRODUCT_FORM_FIELD, type ProductFormFieldId } from '../constants/productFormFieldIds.constants';

function clearPricingFieldError(
  fieldId: ProductFormFieldId,
  submitErrorFieldId: ProductFormFieldId | null,
  setSubmitErrorKey: (key: string | null) => void,
  setSubmitErrorFieldId: (fieldId: ProductFormFieldId | null) => void
): void {
  if (submitErrorFieldId !== fieldId) {
    return;
  }
  setSubmitErrorKey(null);
  setSubmitErrorFieldId(null);
}

export function AddProductPageContent() {
  const {
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
    handleUploadImages,
    handleUploadImageFiles,
    handleUploadVariantImage,
    addLabel,
    removeLabel,
    updateLabel,
    handleCreateCategory,
    handleSubmit,
    applyToAllVariants,
    generateSlug,
  } = useAddProductPage();

  if (showPageLoading) {
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

  if (!canRenderForm) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#efefef] pt-[3.75rem] pb-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <AdminShell>
          <AddProductFormContent
            formData={formState.formData}
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
            onPriceChange={(value) => {
              formState.setSimpleProductData((prev) => ({ ...prev, price: value }));
              clearPricingFieldError(
                PRODUCT_FORM_FIELD.PRICE,
                formState.submitErrorFieldId,
                formState.setSubmitErrorKey,
                formState.setSubmitErrorFieldId
              );
            }}
            onCompareAtPriceChange={(value) => formState.setSimpleProductData((prev) => ({ ...prev, compareAtPrice: value }))}
            onSkuChange={(value) => formState.setSimpleProductData((prev) => ({ ...prev, sku: value }))}
            onQuantityChange={(value) => {
              formState.setSimpleProductData((prev) => ({ ...prev, quantity: value }));
              clearPricingFieldError(
                PRODUCT_FORM_FIELD.QUANTITY,
                formState.submitErrorFieldId,
                formState.setSubmitErrorKey,
                formState.setSubmitErrorFieldId
              );
            }}
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
            submitErrorFieldId={formState.submitErrorFieldId}
          />
        </AdminShell>
      </div>
    </div>
  );
}
