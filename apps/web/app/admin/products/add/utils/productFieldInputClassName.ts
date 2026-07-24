import {
  PRODUCT_FORM_FIELD_SCROLL_MARGIN_CLASS,
  type ProductFormFieldId,
} from '../constants/productFormFieldIds.constants';

export function getProductFieldInputClassName(
  fieldId: ProductFormFieldId,
  invalidFieldId: ProductFormFieldId | null | undefined,
  baseClassName: string
): string {
  const scrollClass = PRODUCT_FORM_FIELD_SCROLL_MARGIN_CLASS;
  if (invalidFieldId !== fieldId) {
    return `${baseClassName} ${scrollClass}`.trim();
  }
  return `${baseClassName} ${scrollClass} border-red-500 focus-visible:ring-red-500`.trim();
}
