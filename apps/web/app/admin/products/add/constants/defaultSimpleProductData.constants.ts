/**
 * Initial defaults for the simple product pricing block (price, SKU, quantity).
 * Variable products also use default price in the "Default pricing" strip when API sends no value.
 */
export const DEFAULT_SIMPLE_PRODUCT_PRICE: string = '1';
export const DEFAULT_SIMPLE_PRODUCT_COMPARE_AT_PRICE: string = '';
export const DEFAULT_SIMPLE_PRODUCT_SKU: string = 'SKU';
export const DEFAULT_SIMPLE_PRODUCT_QUANTITY: string = '0';

/** Form defaults; fields are `string` (not string literals) so setter updates stay type-safe. */
export const DEFAULT_SIMPLE_PRODUCT_DATA = {
  price: DEFAULT_SIMPLE_PRODUCT_PRICE,
  compareAtPrice: DEFAULT_SIMPLE_PRODUCT_COMPARE_AT_PRICE,
  sku: DEFAULT_SIMPLE_PRODUCT_SKU,
  quantity: DEFAULT_SIMPLE_PRODUCT_QUANTITY,
};
