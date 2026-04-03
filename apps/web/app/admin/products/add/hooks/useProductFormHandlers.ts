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

interface UseProductFormHandlersProps {
  formData: {
    title: string;
    slug: string;
    descriptionHtml: string;
    primaryCategoryId: string;
    categoryIds: string[];
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
  productType: 'simple' | 'variable';
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
}

export function useProductFormHandlers({
  formData,
  setFormData,
  setLoading,
  setCategories,
  productType,
  simpleProductData,
  generatedVariants,
  useNewCategory,
  newCategoryName,
  isEditMode,
  productId,
  isClothingCategory,
  categoryAttributes,
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
    productType,
    variants: formData.variants,
    generatedVariants,
    simpleProductData,
    isClothingCategory,
    setLoading,
  });


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('📝 [ADMIN] Submitting product form:', formData);

      const brandCategoryResult = await createBrandAndCategory();
      if (brandCategoryResult.error) {
        return;
      }
      const { finalPrimaryCategoryId, creationMessages } = brandCategoryResult;

      const currentFormData = formData;

      // Validate: variable product must have at least one variant
      if (productType === 'variable' && generatedVariants.length === 0) {
        setLoading(false);
        return;
      }
      if (!validateVariants()) {
        return;
      }

      const variants: any[] = [];
      const variantSkuSet = new Set<string>();

      if (productType === 'simple') {
        const priceRub = parseFloat(simpleProductData.price);
        const compareAtPriceRub = simpleProductData.compareAtPrice && simpleProductData.compareAtPrice.trim() !== ''
          ? parseFloat(simpleProductData.compareAtPrice)
          : undefined;
        const simpleVariant: any = {
          price: priceRub,
          stock: parseInt(simpleProductData.quantity) || 0,
          sku: simpleProductData.sku.trim(),
          published: true,
        };
        if (compareAtPriceRub) {
          simpleVariant.compareAtPrice = compareAtPriceRub;
        }
        variants.push(simpleVariant);
        variantSkuSet.add(simpleProductData.sku.trim());
      } else {
        // Variable: one API variant per generatedVariant (no attributes/options)
        const defaultVariantPriceText = String(simpleProductData.price || '').trim();
        const defaultVariantPrice = defaultVariantPriceText !== '' ? parseFloat(defaultVariantPriceText) : NaN;
        const defaultVariantCompareAtPriceText = String(simpleProductData.compareAtPrice || '').trim();
        const defaultVariantCompareAtPrice =
          defaultVariantCompareAtPriceText !== '' ? parseFloat(defaultVariantCompareAtPriceText) : NaN;

        const defaultVariantCompareAtPriceRub = Number.isFinite(defaultVariantCompareAtPrice)
          ? defaultVariantCompareAtPrice
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
          price: Number.isFinite(defaultVariantPrice) ? defaultVariantPrice : 0,
          compareAtPrice: defaultVariantCompareAtPriceRub,
          stock: defaultVariantStock,
          sku: defaultVariantSku,
          attributes: buildDefaultPricingAttributes(),
          published: true,
        });
        variantSkuSet.add(defaultVariantSku);

        generatedVariants.forEach((genVariant, variantIndex) => {
          const variantPriceText = String(genVariant.price || '').trim();
          const variantPriceRaw = variantPriceText !== '' ? parseFloat(variantPriceText) : NaN;
          const variantPriceRub = Number.isFinite(variantPriceRaw) ? variantPriceRaw : 0;

          const variantCompareAtPriceText = String(genVariant.compareAtPrice || '').trim();
          const variantCompareAtPriceRaw =
            variantCompareAtPriceText !== ''
              ? parseFloat(variantCompareAtPriceText)
              : NaN;
          const variantCompareAtPriceRub = Number.isFinite(variantCompareAtPriceRaw)
            ? variantCompareAtPriceRaw
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
          variants.push({
            price: variantPriceRub,
            compareAtPrice: variantCompareAtPriceRub,
            stock: parseInt(genVariant.stock || '0') || 0,
            sku: uniqueSku,
            imageUrl: genVariant.image || undefined,
            attributes:
              genVariant.selectedValueIds.length > 0
                ? buildVariantAttributePayload(genVariant.selectedValueIds, categoryAttributes)
                : undefined,
            published: true,
          });
        });
      }

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
