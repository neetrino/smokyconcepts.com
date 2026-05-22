export interface UpcomingApiProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string | null;
  images?: string[];
  inStock?: boolean;
  skus?: string[];
  categories?: Array<{ id: string; slug: string; title: string }>;
  brand?: { id: string; name: string } | null;
  originalPrice?: number | null;
  defaultVariantId?: string | null;
  defaultVariantStock?: number;
  defaultSku?: string;
}

export interface UpcomingProductsResponse {
  data: UpcomingApiProduct[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
}
