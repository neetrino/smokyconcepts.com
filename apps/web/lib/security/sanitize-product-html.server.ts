import { sanitizeRichHtml } from './sanitize-rich-html.server';

export interface ProductRichHtmlFields {
  descriptionHtml?: string | null;
  productDetailsHtml?: string | null;
  shippingHtml?: string | null;
}

export function sanitizeProductRichHtmlFields(
  fields: ProductRichHtmlFields,
): ProductRichHtmlFields {
  return {
    descriptionHtml: sanitizeRichHtml(fields.descriptionHtml),
    productDetailsHtml: sanitizeRichHtml(fields.productDetailsHtml),
    shippingHtml: sanitizeRichHtml(fields.shippingHtml),
  };
}
