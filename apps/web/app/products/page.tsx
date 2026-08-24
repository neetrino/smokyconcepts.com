import { CATALOG_PRODUCTS_FETCH_LIMIT } from '@/lib/constants/products-catalog.constants';
import { productsService } from '@/lib/services/products.service';
import { logger } from '@/lib/utils/logger';
import { getStoredLanguage } from '../../lib/language';
import { ProductsCatalogView } from './components/ProductsCatalogView';
import {
  isClientSideCollectionFilterValue,
  normalizeCatalogColorLabels,
} from './components/catalogProductLabels';

export const revalidate = 60;

const DEFAULT_PRODUCTS_PAGE_LIMIT = 24;

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  originalPrice?: number | null;
  compareAtPrice: number | null;
  image: string | null;
  images?: string[];
  variantImages?: Array<{
    variantId: string;
    images: string[];
    sizeLabels: string[];
    sizeCatalogCategoryId: string | null;
    sizeCatalogCategoryTitle: string | null;
    price: number;
    originalPrice: number | null;
    stock: number;
    sku: string;
  }>;
  inStock: boolean;
  categories: Array<{
    id: string;
    slug: string;
    title: string;
  }>;
  skus: string[];
  brand?: { id: string; name: string } | null;
  labels?: Array<{
    id: string;
    type: 'text' | 'percentage';
    value: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    color: string | null;
  }>;
  colors?: string[];
  discountPercent?: number | null;
  defaultVariantId?: string | null;
  defaultVariantStock?: number;
  defaultSku?: string;
  sizeLabel?: string | null;
  sizeLabels?: string[];
  sizeCatalogCategoryIds?: string[];
  sizeCatalogCategoryTitles?: string[];
}

interface ProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const EMPTY_PRODUCTS_RESPONSE: ProductsResponse = {
  data: [],
  meta: { total: 0, page: 1, limit: DEFAULT_PRODUCTS_PAGE_LIMIT, totalPages: 0 },
};

function isProductsResponse(value: unknown): value is ProductsResponse {
  if (typeof value !== 'object' || value === null || !('data' in value)) {
    return false;
  }
  return Array.isArray(value.data);
}

/**
 * Load catalog products in-process. Do not HTTP-fetch this app's own API —
 * NEXT_PUBLIC_APP_URL often points at production and 404s locally.
 */
async function getProducts(
  page: number = 1,
  search?: string,
  category?: string,
  limit: number = DEFAULT_PRODUCTS_PAGE_LIMIT
): Promise<ProductsResponse> {
  try {
    const result = await productsService.findAll({
      page,
      limit,
      lang: getStoredLanguage(),
      search: search?.trim() || undefined,
      category: category?.trim() || undefined,
    });

    return isProductsResponse(result) ? result : EMPTY_PRODUCTS_RESPONSE;
  } catch (error) {
    logger.error('Failed to load catalog products', { error });
    return EMPTY_PRODUCTS_RESPONSE;
  }
}

interface ProductsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Products landing page rendered in the Figma catalog layout.
 */
export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = (searchParams ? await searchParams : {}) ?? {};
  const categoryParam = typeof params.category === 'string' ? params.category : undefined;
  const apiCategoryFilter =
    categoryParam && !isClientSideCollectionFilterValue(categoryParam) ? categoryParam : undefined;

  const productsData = await getProducts(
    1,
    typeof params.search === 'string' ? params.search : undefined,
    apiCategoryFilter,
    CATALOG_PRODUCTS_FETCH_LIMIT
  );

  const normalizedProducts: Product[] = productsData.data.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: p.price,
    originalPrice: p.originalPrice ?? null,
    compareAtPrice: p.compareAtPrice ?? p.originalPrice ?? null,
    image: p.image ?? null,
    images: Array.isArray(p.images) ? p.images : [],
    variantImages: Array.isArray(p.variantImages) ? p.variantImages : [],
    inStock: p.inStock ?? true,
    categories: Array.isArray(p.categories) ? p.categories : [],
    skus: Array.isArray(p.skus) ? p.skus : [],
    brand: p.brand ?? null,
    labels: p.labels ?? [],
    colors: normalizeCatalogColorLabels(p.colors),
    discountPercent: p.discountPercent ?? null,
    defaultVariantId: p.defaultVariantId ?? null,
    defaultVariantStock: p.defaultVariantStock ?? 0,
    defaultSku: p.defaultSku ?? '',
    sizeLabel: typeof p.sizeLabel === 'string' ? p.sizeLabel : null,
    sizeLabels: Array.isArray(p.sizeLabels) ? p.sizeLabels.filter((s): s is string => typeof s === 'string') : undefined,
    sizeCatalogCategoryIds: Array.isArray(p.sizeCatalogCategoryIds)
      ? p.sizeCatalogCategoryIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
      : undefined,
    sizeCatalogCategoryTitles: Array.isArray(p.sizeCatalogCategoryTitles)
      ? p.sizeCatalogCategoryTitles.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
      : undefined,
  }));

  return (
    <ProductsCatalogView products={normalizedProducts} />
  );
}


