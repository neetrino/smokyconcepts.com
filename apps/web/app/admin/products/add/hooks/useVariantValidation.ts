import type { Variant, GeneratedVariant } from '../types';
import { buildAutoSkuBaseFromSlug, buildAutoSkuForVariantIndex } from '../utils/autoSku';
import type { ProductFormFieldId } from '../constants/productFormFieldIds.constants';
import { getProductPricingValidationFailure } from '../utils/validateProductPricingFields';

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
  setSubmitErrorFieldId: (fieldId: ProductFormFieldId | null) => void;
}

function failValidation(
  setLoading: (loading: boolean) => void,
  setSubmitErrorKey: (key: string | null) => void,
  setSubmitErrorFieldId: (fieldId: ProductFormFieldId | null) => void,
  errorKey: string,
  fieldId: ProductFormFieldId | null = null
): false {
  setLoading(false);
  setSubmitErrorKey(errorKey);
  setSubmitErrorFieldId(fieldId);
  return false;
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
  setSubmitErrorFieldId,
}: UseVariantValidationProps) {
  const validateVariants = (): boolean => {
    if (productType === 'variable' && variants.length === 0) {
      if (generatedVariants.length === 0) {
        return failValidation(setLoading, setSubmitErrorKey, setSubmitErrorFieldId, 'variableSubmitNeedVariants');
      }

      const defaultPricingFailure = getProductPricingValidationFailure(
        simpleProductData.price,
        simpleProductData.quantity,
        'variableDefault'
      );
      if (defaultPricingFailure) {
        return failValidation(
          setLoading,
          setSubmitErrorKey,
          setSubmitErrorFieldId,
          defaultPricingFailure.errorKey,
          defaultPricingFailure.fieldId
        );
      }

      const skuSet = new Set<string>();
      for (let i = 0; i < generatedVariants.length; i++) {
        const gv = generatedVariants[i];
        const sku = (gv.sku || '').trim() || buildAutoSkuForVariantIndex(productSlug, i);
        if (!sku) {
          return failValidation(setLoading, setSubmitErrorKey, setSubmitErrorFieldId, 'variableSubmitVariantRowInvalid');
        }
        if (skuSet.has(sku)) {
          return failValidation(
            setLoading,
            setSubmitErrorKey,
            setSubmitErrorFieldId,
            'variableSubmitDuplicateVariantSku'
          );
        }
        skuSet.add(sku);

        const variantPriceText = String(gv.price || '').trim();
        const variantPriceValue = variantPriceText !== '' ? parseFloat(variantPriceText) : NaN;
        if (!Number.isFinite(variantPriceValue) || variantPriceValue <= 0) {
          return failValidation(setLoading, setSubmitErrorKey, setSubmitErrorFieldId, 'variableSubmitVariantRowInvalid');
        }
      }
      return true;
    }

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
            } else if (colorData.indexOf(colorDataItem) === 0) {
              const variantPriceValue = parseFloat(variant.price || '0');
              if (!variant.price || isNaN(variantPriceValue) || variantPriceValue <= 0) {
                setLoading(false);
                return false;
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
            } else if (
              !colorDataItem.stock ||
              typeof colorDataItem.stock !== 'string' ||
              colorDataItem.stock.trim() === '' ||
              parseInt(colorDataItem.stock) < 0
            ) {
              setLoading(false);
              return false;
            }
          }
        }
      }
    }

    if (productType === 'simple') {
      const pricingFailure = getProductPricingValidationFailure(
        simpleProductData.price,
        simpleProductData.quantity,
        'simple'
      );
      if (pricingFailure) {
        return failValidation(
          setLoading,
          setSubmitErrorKey,
          setSubmitErrorFieldId,
          pricingFailure.errorKey,
          pricingFailure.fieldId
        );
      }

      const simpleSkuEffective =
        simpleProductData.sku.trim() || buildAutoSkuBaseFromSlug(productSlug);
      if (!simpleSkuEffective) {
        setLoading(false);
        return false;
      }
    }

    return true;
  };

  return { validateVariants };
}
