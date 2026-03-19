/**
 * Update product data interface
 */
export interface UpdateProductData {
  title?: string;
  slug?: string;
  subtitle?: string;
  descriptionHtml?: string;
  primaryCategoryId?: string;
  categoryIds?: string[];
  published?: boolean;
  featured?: boolean;
  upcoming?: boolean;
  locale?: string;
  media?: unknown[];
  labels?: Array<{
    id?: string;
    type: string;
    value: string;
    position: string;
    color?: string | null;
  }>;
  variants?: Array<{
    id?: string;
    price: string | number;
    compareAtPrice?: string | number;
    stock: string | number;
    sku?: string;
    imageUrl?: string;
    published?: boolean;
  }>;
}




