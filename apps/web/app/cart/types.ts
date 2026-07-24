/**
 * Cart item interface
 */
export interface CartItem {
  id: string;
  variant: {
    id: string;
    sku: string;
    sizeLabel?: string | null;
    /** Home Culture early-access path */
    earlyAccess?: boolean;
    /** Size catalog (PDP modal) — passed to checkout for order display */
    sizeCatalogTitle?: string | null;
    sizeCatalogVersion?: string | null;
    sizeCatalogImageUrl?: string | null;
    sizeCatalogCategoryTitle?: string | null;
    sizeCatalogCategoryPriceAmd?: number | null;
    /** PDP customize (optional) */
    customizePlain?: string | null;
    customizeHtml?: string | null;
    customSizeRequest?: {
      name: string;
      phone: string;
      email: string;
      description: string;
      imageDataUrl: string;
      imageFileName: string;
    } | null;
    stock?: number;
    product: {
      id: string;
      title: string;
      slug: string;
      image?: string | null;
      categoryLabel?: string | null;
    };
  };
  quantity: number;
  price: number;
  originalPrice?: number | null;
  total: number;
}

/**
 * Cart interface
 */
export interface Cart {
  id: string;
  items: CartItem[];
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    currency: string;
  };
  itemsCount: number;
}

/**
 * Guest cart line in localStorage (`shop_cart_guest`).
 * Full line snapshot (PDP or catalog) — `readGuestCartFromStorage` builds the cart without network.
 */
export interface GuestCartItem {
  productId: string;
  productSlug?: string;
  variantId?: string;
  quantity: number;
  title?: string;
  image?: string | null;
  price?: number;
  originalPrice?: number | null;
  stock?: number;
  sku?: string;
  sizeLabel?: string | null;
  categoryLabel?: string | null;
  sizeCatalogTitle?: string | null;
  sizeCatalogVersion?: string | null;
  sizeCatalogImageUrl?: string | null;
  sizeCatalogCategoryTitle?: string | null;
  sizeCatalogCategoryPriceAmd?: number | null;
  customizePlain?: string | null;
  customizeHtml?: string | null;
  customSizeRequest?: {
    name: string;
    phone: string;
    email: string;
    description: string;
    imageDataUrl: string;
    imageFileName: string;
  } | null;
  /** Set when adding from home Culture early-access checkout */
  earlyAccess?: boolean;
}




