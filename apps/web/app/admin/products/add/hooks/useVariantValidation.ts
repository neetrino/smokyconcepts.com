import type { Variant, GeneratedVariant } from '../types';
import { buildAutoSkuBaseFromSlug, buildAutoSkuForVariantIndex } from '../utils/autoSku';

interface UseVariantValidationProps {
  productType: 'simple' | 'variable';
  variants: Variant[];
  generatedVariants?: GeneratedVariant[];
  simpleProductData: {
    price: string;
    sku: string;
    quantity: string;
  };
  /** Used to resolve empty SKUs the same way as submit (slug-based). */
  productSlug: string;
  isClothingCategory: () => boolean;
  setLoading: (loading: boolean) => void;
  /** Key suffix under admin.products.add (e.g. variableSubmitNeedVariants). */
  setSubmitErrorKey: (key: string | null) => void;
}

export function useVariantValidation({
  productType,
  variants,
  generatedVariants = [],
  simpleProductData,
  productSlug,
  isClothingCategory,
  setLoading,
  setSubmitErrorKey,
}: UseVariantValidationProps) {
  const validateVariants = (): boolean => {
    // Variable product: may use formData.variants (color/size matrix) OR generatedVariants (simple list from edit/add).
    // When variants.length === 0 (e.g. edit mode loads into generatedVariants), validate generatedVariants instead.
    if (productType === 'variable' && variants.length === 0) {
      if (generatedVariants.length === 0) {
        setLoading(false);
        setSubmitErrorKey('variableSubmitNeedVariants');
        return false;
      }
      const defaultPriceText = String(simpleProductData.price || '').trim();
      const defaultPriceValue = defaultPriceText !== '' ? parseFloat(defaultPriceText) : NaN;
      if (!Number.isFinite(defaultPriceValue) || defaultPriceValue <= 0) {
        setLoading(false);
        setSubmitErrorKey('variableSubmitDefaultPriceInvalid');
        return false;
      }
      const skuSet = new Set<string>();
      for (let i = 0; i < generatedVariants.length; i++) {
        const gv = generatedVariants[i];
        const sku = (gv.sku || '').trim() || buildAutoSkuForVariantIndex(productSlug, i);
        if (!sku) {
          setLoading(false);
          setSubmitErrorKey('variableSubmitVariantRowInvalid');
          return false;
        }
        if (skuSet.has(sku)) {
          setLoading(false);
          setSubmitErrorKey('variableSubmitDuplicateVariantSku');
          return false;
        }
        skuSet.add(sku);

        const variantPriceText = String(gv.price || '').trim();
        const variantPriceValue = variantPriceText !== '' ? parseFloat(variantPriceText) : NaN;
        if (!Number.isFinite(variantPriceValue) || variantPriceValue <= 0) {
          setLoading(false);
          setSubmitErrorKey('variableSubmitVariantRowInvalid');
          return false;
        }
      }
      return true;
    }

    // Validate all variants (skip for simple products - validation is done in variant creation)
    if (productType === 'variable') {
      const skuSet = new Set<string>();
      for (const variant of variants) {
        const variantSku = variant.sku ? variant.sku.trim() : '';
        if (!variantSku || variantSku === '') {
          setLoading(false);
          return false;
        }
        
        if (skuSet.has(variantSku)) {
          setLoading(false);
          return false;
        }
        skuSet.add(variantSku);
        
        const categoryRequiresSizes = isClothingCategory();
        const colorData = variant.colors && variant.colors.length > 0 ? variant.colors : [];
        
        if (colorData.length > 0) {
          for (const colorDataItem of colorData) {
            const colorSizes = colorDataItem.sizes || [];
            const colorSizeStocks = colorDataItem.sizeStocks || {};
            
            const hasColor = colorDataItem.colorValue && colorDataItem.colorValue.trim() !== '';
            
            if (hasColor) {
              const colorPriceValue = parseFloat(colorDataItem.price || '0');
              if (!colorDataItem.price || isNaN(colorPriceValue) || colorPriceValue <= 0) {
                setLoading(false);
                return false;
              }
            } else {
              if (colorData.indexOf(colorDataItem) === 0) {
                const variantPriceValue = parseFloat(variant.price || '0');
                if (!variant.price || isNaN(variantPriceValue) || variantPriceValue <= 0) {
                  setLoading(false);
                  return false;
                }
              }
            }

            if (colorSizes.length > 0) {
              for (const size of colorSizes) {
                const stock = colorSizeStocks[size];
                if (!stock || typeof stock !== 'string' || stock.trim() === '' || parseInt(stock) < 0) {
                  setLoading(false);
                  return false;
                }
              }
            } else {
              if (!colorDataItem.stock || typeof colorDataItem.stock !== 'string' || colorDataItem.stock.trim() === '' || parseInt(colorDataItem.stock) < 0) {
                setLoading(false);
                return false;
              }
            }
          }
        }
      }
    }

    // Validate simple product fields
    if (productType === 'simple') {
      if (!simpleProductData.price || simpleProductData.price.trim() === '') {
        setLoading(false);
        return false;
      }
      const simpleSkuEffective =
        simpleProductData.sku.trim() || buildAutoSkuBaseFromSlug(productSlug);
      if (!simpleSkuEffective) {
        setLoading(false);
        return false;
      }
      if (!simpleProductData.quantity || simpleProductData.quantity.trim() === '') {
        setLoading(false);
        return false;
      }
    }

    return true;
  };

  return { validateVariants };
}



