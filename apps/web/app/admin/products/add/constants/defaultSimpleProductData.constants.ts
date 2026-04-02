/**
 * Initial defaults for the simple product pricing block (price, SKU, quantity).
 * Variable products also use default price in the "Default pricing" strip when API sends no value.
 */
export const DEFAULT_SIMPLE_PRODUCT_PRICE = '1';
export const DEFAULT_SIMPLE_PRODUCT_COMPARE_AT_PRICE = '';
export const DEFAULT_SIMPLE_PRODUCT_SKU = 'SKU';
export const DEFAULT_SIMPLE_PRODUCT_QUANTITY = '0';

export const DEFAULT_SIMPLE_PRODUCT_DATA = {
  price: DEFAULT_SIMPLE_PRODUCT_PRICE,
  compareAtPrice: DEFAULT_SIMPLE_PRODUCT_COMPARE_AT_PRICE,
  sku: DEFAULT_SIMPLE_PRODUCT_SKU,
  quantity: DEFAULT_SIMPLE_PRODUCT_QUANTITY,
} as const;
