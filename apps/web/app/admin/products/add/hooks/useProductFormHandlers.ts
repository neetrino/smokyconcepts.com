import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Category, Variant, GeneratedVariant, ProductLabel } from '../types';
import { useBrandAndCategoryCreation } from './useBrandAndCategoryCreation';
import { useVariantValidation } from './useVariantValidation';
import { processImagesForSubmit } from './useImageProcessingForSubmit';
import { createAndSubmitPayload } from './useProductPayloadCreation';
import { buildVariantAttributePayload } from '@/lib/category-attributes';
import type { CategoryAttribute } from '@/lib/category-attributes';
import { buildDisplayVariantAttributes } from '@/lib/default-pricing-variant';
import { initializeCurrencyRates, normalizeAdminProductPriceInput } from '@/lib/currency';
import type { ProductFormFieldId } from '../constants/productFormFieldIds.constants';
import { orderGeneratedVariantImagesForSubmit } from '../utils/generatedVariantImages';

interface VariantSubmitPayload {
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku: string;
  imageUrl?: string;
  attributes?: Array<{ attributeKey: string; value: string }>;
  published: boolean;
}

interface UseProductFormHandlersProps {
  formData: {
    title: string;
    slug: string;
    descriptionHtml: string;
    productDetailsHtml: string;
    shippingHtml: string;
    primaryCategoryId: string;
    categoryIds: string[];
    sizeCatalogCategoryId: string;
    sizeCatalogCategoryTitle: string;
    published: boolean;
    featured: boolean;
    upcoming: boolean;
    imageUrls: string[];
    featuredImageIndex: number;
    mainProductImage: string;
    variants: Variant[];
    labels: ProductLabel[];
  };
  setFormData: (updater: (prev: unknown) => unknown) => void;
  setLoading: (loading: boolean) => void;
  setCategories: (updater: (prev: Category[]) => Category[]) => void;
  generatedVariants: GeneratedVariant[];
  useNewCategory: boolean;
  newCategoryName: string;
  isEditMode: boolean;
  productId: string | null;
  isClothingCategory: () => boolean;
  categoryAttributes: CategoryAttribute[];
  setSubmitErrorKey: (key: string | null) => void;
  setSubmitErrorFieldId: (fieldId: ProductFormFieldId | null) => void;
}

export function useProductFormHandlers({
  formData,
  setLoading,
  setCategories,
  generatedVariants,
  useNewCategory,
  newCategoryName,
  isEditMode,
  productId,
  isClothingCategory,
  categoryAttributes,
  setSubmitErrorKey,
  setSubmitErrorFieldId,
}: UseProductFormHandlersProps) {
  const router = useRouter();

  const { createBrandAndCategory } = useBrandAndCategoryCreation({
    formData,
    useNewCategory,
    newCategoryName,
    setCategories,
    setLoading,
  });

  const { validateVariants } = useVariantValidation({
    variants: formData.variants,
    generatedVariants,
    productSlug: formData.slug,
    isClothingCategory,
    setLoading,
    setSubmitErrorKey,
    setSubmitErrorFieldId,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitErrorKey(null);
    setSubmitErrorFieldId(null);
    setLoading(true);

    try {
      await initializeCurrencyRates();

      const brandCategoryResult = await createBrandAndCategory();
      if (brandCategoryResult.error) {
        return;
      }
      const { finalPrimaryCategoryId, creationMessages } = brandCategoryResult;

      const currentFormData = formData;

      if (!validateVariants()) {
        return;
      }

      const variants: VariantSubmitPayload[] = [];
      const variantSkuSet = new Set<string>();

      generatedVariants.forEach((genVariant, variantIndex) => {
        const variantPriceText = String(genVariant.price || '').trim();
        const variantPriceRaw = variantPriceText !== '' ? parseFloat(variantPriceText) : NaN;
        const variantPriceStored = Number.isFinite(variantPriceRaw)
          ? normalizeAdminProductPriceInput(variantPriceRaw)
          : 0;

        const variantCompareAtPriceText = String(genVariant.compareAtPrice || '').trim();
        const variantCompareAtPriceRaw =
          variantCompareAtPriceText !== '' ? parseFloat(variantCompareAtPriceText) : NaN;
        const variantCompareAtPriceStored = Number.isFinite(variantCompareAtPriceRaw)
          ? normalizeAdminProductPriceInput(variantCompareAtPriceRaw)
          : undefined;

        const finalSku =
          genVariant.sku && genVariant.sku.trim() !== ''
            ? genVariant.sku.trim()
            : `${currentFormData.slug || 'PROD'}-${Date.now()}-${variantIndex + 1}`;

        let uniqueSku = finalSku;
        let skuCounter = 1;
        while (variantSkuSet.has(uniqueSku)) {
          uniqueSku = `${finalSku}-${skuCounter}`;
          skuCounter++;
        }
        variantSkuSet.add(uniqueSku);
        const variantImages = orderGeneratedVariantImagesForSubmit(genVariant);

        const attributePayload =
          genVariant.selectedValueIds.length > 0
            ? buildVariantAttributePayload(genVariant.selectedValueIds, categoryAttributes)
            : [];

        const attributes = genVariant.isDisplayVariant
          ? [
              ...attributePayload,
              ...buildDisplayVariantAttributes({
                categoryId: currentFormData.sizeCatalogCategoryId,
                categoryTitle: currentFormData.sizeCatalogCategoryTitle,
              }),
            ]
          : attributePayload;

        variants.push({
          price: variantPriceStored,
          compareAtPrice: variantCompareAtPriceStored,
          stock: parseInt(genVariant.stock || '0', 10) || 0,
          sku: uniqueSku,
          imageUrl: variantImages.length > 0 ? variantImages.join(',') : undefined,
          attributes: attributes.length > 0 ? attributes : undefined,
          published: true,
        });
      });

      const finalSkuSet = new Set<string>();
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        if (!variant.sku || variant.sku.trim() === '') {
          const baseSlug = currentFormData.slug || 'PROD';
          variant.sku = `${baseSlug.toUpperCase()}-${Date.now()}-${i + 1}`;
        } else {
          variant.sku = variant.sku.trim();
        }

        let finalSku = variant.sku;
        let skuCounter = 1;
        while (finalSkuSet.has(finalSku)) {
          const baseSlug = currentFormData.slug || 'PROD';
          finalSku = `${baseSlug.toUpperCase()}-${Date.now()}-${i + 1}-${skuCounter}-${Math.random().toString(36).slice(2, 6)}`;
          skuCounter++;
        }
        variant.sku = finalSku;
        finalSkuSet.add(finalSku);
      }

      const displayVariant = generatedVariants.find((variant) => variant.isDisplayVariant);
      const displayImageUrl = displayVariant?.image?.trim() || '';

      const { finalMedia, mainImage, processedVariants } = processImagesForSubmit({
        imageUrls: displayImageUrl ? [displayImageUrl] : [],
        featuredImageIndex: 0,
        mainProductImage: displayImageUrl,
        variants,
      });
      const finalVariants = processedVariants.length > 0 ? processedVariants : variants;

      await createAndSubmitPayload({
        formData: currentFormData,
        finalPrimaryCategoryId,
        variants: finalVariants,
        attributeIds: [],
        finalMedia,
        mainImage,
        isEditMode,
        productId,
        creationMessages,
        setLoading,
        router,
      });
    } catch (err: unknown) {
      console.error('❌ [ADMIN] Error saving product:', err);
    } finally {
      setLoading(false);
    }
  };

  return { handleSubmit };
}
