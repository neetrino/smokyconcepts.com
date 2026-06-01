/** DOM targets for admin product form validation scroll + highlight. */
export const PRODUCT_FORM_FIELD = {
  PRICE: 'product-price',
  QUANTITY: 'product-quantity',
} as const;

export type ProductFormFieldId = (typeof PRODUCT_FORM_FIELD)[keyof typeof PRODUCT_FORM_FIELD];

/** Offset for fixed admin header when scrolling invalid pricing inputs into view. */
export const PRODUCT_FORM_FIELD_SCROLL_MARGIN_CLASS = 'scroll-mt-24 scroll-mb-8' as const;
