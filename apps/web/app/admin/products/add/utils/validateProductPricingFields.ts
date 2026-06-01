import {
  PRODUCT_FORM_FIELD,
  type ProductFormFieldId,
} from '../constants/productFormFieldIds.constants';

export type ProductPricingSubmitErrorKey =
  | 'simpleSubmitPriceRequired'
  | 'simpleSubmitQuantityRequired'
  | 'variableSubmitDefaultPriceInvalid'
  | 'variableSubmitDefaultQuantityRequired';

export interface ProductPricingValidationFailure {
  errorKey: ProductPricingSubmitErrorKey;
  fieldId: ProductFormFieldId;
}

export function isValidProductPrice(price: string): boolean {
  const trimmed = String(price ?? '').trim();
  if (trimmed === '') {
    return false;
  }
  const value = parseFloat(trimmed);
  return Number.isFinite(value) && value > 0;
}

export function isValidProductQuantity(quantity: string): boolean {
  const trimmed = String(quantity ?? '').trim();
  if (trimmed === '') {
    return false;
  }
  const value = parseInt(trimmed, 10);
  return Number.isFinite(value) && value >= 0;
}

export function getProductPricingValidationFailure(
  price: string,
  quantity: string,
  mode: 'simple' | 'variableDefault'
): ProductPricingValidationFailure | null {
  if (!isValidProductPrice(price)) {
    return {
      errorKey: mode === 'simple' ? 'simpleSubmitPriceRequired' : 'variableSubmitDefaultPriceInvalid',
      fieldId: PRODUCT_FORM_FIELD.PRICE,
    };
  }

  if (!isValidProductQuantity(quantity)) {
    return {
      errorKey:
        mode === 'simple' ? 'simpleSubmitQuantityRequired' : 'variableSubmitDefaultQuantityRequired',
      fieldId: PRODUCT_FORM_FIELD.QUANTITY,
    };
  }

  return null;
}
