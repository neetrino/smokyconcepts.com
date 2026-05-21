export interface OrderItem {
  variantId: string;
  productTitle: string;
  variantTitle: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  imageUrl?: string;
  sizeCatalogVersion?: string | null;
  sizeCatalogCategoryPriceAmd?: number | null;
  customizePlain?: string;
  customizeHtml?: string;
  variantOptions?: Array<{
    attributeKey?: string;
    value?: string;
    label?: string;
    imageUrl?: string;
    colors?: string[] | unknown;
  }>;
}

export interface Order {
  id: string;
  number: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  items: OrderItem[];
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    collectionPriceAmount?: number;
    currency: string;
  };
  collectionPriceAmount?: number;
  customer?: {
    email?: string;
    phone?: string;
  };
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
  shippingMethod: string;
  trackingNumber?: string;
  timeline?: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}




