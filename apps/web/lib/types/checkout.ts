/**
 * Checkout types for orders service
 */

export interface CheckoutData {
  items?: Array<{
    variantId: string;
    productId: string;
    quantity: number;
    /** Size catalog pick from PDP (optional) */
    sizeCatalogTitle?: string;
    sizeCatalogVersion?: string;
    sizeCatalogImageUrl?: string;
    /** Collection title (e.g. Ultra Slims) — used to resolve customize price server-side */
    sizeCatalogCategoryTitle?: string;
    sizeCatalogCategoryPriceAmd?: number;
    /** PDP text customize (optional; sanitized server-side) */
    customizePlain?: string;
    customizeHtml?: string;
    /** PDP fallback custom size request (optional) */
    customSizeRequest?: {
      name: string;
      phone: string;
      email: string;
      description: string;
      imageDataUrl: string;
      imageFileName?: string;
    };
    /** Home Culture early-access line (validated server-side against voting productSlug) */
    earlyAccess?: boolean;
  }>;
  email: string;
  phone: string;
  shippingMethod?: string;
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    address?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    countryCode?: string;
    phone?: string;
  };
  shippingAmount?: number;
  /** Optional checkout coupon (re-validated server-side; normalized in DB) */
  couponCode?: string;
  paymentMethod?: string;
  billingAddress?: {
    firstName?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    countryCode?: string;
    phone?: string;
  };
}




