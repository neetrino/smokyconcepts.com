import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Category, Variant, GeneratedVariant } from '../types';
import { useBrandAndCategoryCreation } from './useBrandAndCategoryCreation';
import { useVariantValidation } from './useVariantValidation';
import { processImagesForSubmit } from './useImageProcessingForSubmit';
import { createAndSubmitPayload } from './useProductPayloadCreation';
import { buildVariantAttributePayload } from '@/lib/category-attributes';
import type { CategoryAttribute } from '@/lib/category-attributes';
import { buildDefaultPricingAttributes } from '@/lib/default-pricing-variant';
import { initializeCurrencyRates, normalizeAdminProductPriceInput } from '@/lib/currency';
import type { ProductFormFieldId } from '../constants/productFormFieldIds.constants';
import { orderGeneratedVariantImagesForSubmit } from '../utils/generatedVariantImages';

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
    labels: any[];
  };
  setFormData: (updater: (prev: unknown) => unknown) => void;
  setLoading: (loading: boolean) => void;
  setCategories: (updater: (prev: Category[]) => Category[]) => void;
  simpleProductData: {
    price: string;
    compareAtPrice: string;
    sku: string;
    quantity: string;
  };
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
  setFormData,
  setLoading,
  setCategories,
  simpleProductData,
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
    simpleProductData,
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
      console.log('📝 [ADMIN] Submitting product form:', formData);
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

      const variants: any[] = [];
      const variantSkuSet = new Set<string>();

      const defaultVariantPriceText = String(simpleProductData.price || '').trim();
      const defaultVariantPrice = defaultVariantPriceText !== '' ? parseFloat(defaultVariantPriceText) : NaN;
      const defaultVariantCompareAtPriceText = String(simpleProductData.compareAtPrice || '').trim();
      const defaultVariantCompareAtPrice =
        defaultVariantCompareAtPriceText !== '' ? parseFloat(defaultVariantCompareAtPriceText) : NaN;

      const defaultVariantCompareAtPriceStored = Number.isFinite(defaultVariantCompareAtPrice)
        ? normalizeAdminProductPriceInput(defaultVariantCompareAtPrice)
        : undefined;
      const defaultSkuInput = String(simpleProductData.sku || '').trim();
      const defaultVariantSku =
        defaultSkuInput !== ''
          ? defaultSkuInput
          : `${(currentFormData.slug || 'PROD').toUpperCase()}-DEFAULT`;
      const defaultStockRaw = parseInt(String(simpleProductData.quantity || '0'), 10);
      const defaultVariantStock =
        Number.isFinite(defaultStockRaw) && defaultStockRaw >= 0 ? defaultStockRaw : 0;

      variants.push({
        price: Number.isFinite(defaultVariantPrice) ? normalizeAdminProductPriceInput(defaultVariantPrice) : 0,
        compareAtPrice: defaultVariantCompareAtPriceStored,
        stock: defaultVariantStock,
        sku: defaultVariantSku,
        attributes: buildDefaultPricingAttributes({
          categoryId: currentFormData.sizeCatalogCategoryId,
          categoryTitle: currentFormData.sizeCatalogCategoryTitle,
        }),
        published: true,
      });
      variantSkuSet.add(defaultVariantSku);

      generatedVariants.forEach((genVariant, variantIndex) => {
        const variantPriceText = String(genVariant.price || '').trim();
        const variantPriceRaw = variantPriceText !== '' ? parseFloat(variantPriceText) : NaN;
        const variantPriceStored = Number.isFinite(variantPriceRaw)
          ? normalizeAdminProductPriceInput(variantPriceRaw)
          : 0;

        const variantCompareAtPriceText = String(genVariant.compareAtPrice || '').trim();
        const variantCompareAtPriceRaw =
          variantCompareAtPriceText !== ''
            ? parseFloat(variantCompareAtPriceText)
            : NaN;
        const variantCompareAtPriceStored = Number.isFinite(variantCompareAtPriceRaw)
          ? normalizeAdminProductPriceInput(variantCompareAtPriceRaw)
          : undefined;
        const finalSku = (genVariant.sku && genVariant.sku.trim() !== '')
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

        variants.push({
          price: variantPriceStored,
          compareAtPrice: variantCompareAtPriceStored,
          stock: parseInt(genVariant.stock || '0') || 0,
          sku: uniqueSku,
          imageUrl: variantImages.length > 0 ? variantImages.join(',') : undefined,
          attributes:
            genVariant.selectedValueIds.length > 0
              ? buildVariantAttributePayload(genVariant.selectedValueIds, categoryAttributes)
              : undefined,
          published: true,
        });
      });

      // Final SKU validation
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
          finalSku = `${baseSlug.toUpperCase()}-${Date.now()}-${i + 1}-${skuCounter}-${Math.random().toString(36).substr(2, 4)}`;
          skuCounter++;
        }
        variant.sku = finalSku;
        finalSkuSet.add(finalSku);
      }

      const attributeIds: string[] = [];

      // Process images
      const { finalMedia, mainImage, processedVariants } = processImagesForSubmit({
        imageUrls: currentFormData.imageUrls,
        featuredImageIndex: currentFormData.featuredImageIndex,
        mainProductImage: currentFormData.mainProductImage,
        variants: variants,
      });
      const finalVariants = processedVariants.length > 0 ? processedVariants : variants;

      await createAndSubmitPayload({
        formData: currentFormData,
        finalPrimaryCategoryId,
        variants: finalVariants,
        attributeIds,
        finalMedia,
        mainImage,
        isEditMode,
        productId,
        creationMessages,
        setLoading,
        router,
      });
    } catch (err: any) {
      console.error('❌ [ADMIN] Error saving product:', err);
    } finally {
      setLoading(false);
    }
  };

  return { handleSubmit };
}
