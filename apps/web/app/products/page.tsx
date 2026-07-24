import { getStoredLanguage } from '../../lib/language';
import { ProductsCatalogView } from './components/ProductsCatalogView';
import { isClientSideCollectionFilterValue } from './components/catalogProductLabels';

export const revalidate = 60;

function normalizeBaseUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl) return '';

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
}

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  originalPrice?: number | null;
  compareAtPrice: number | null;
  image: string | null;
  images?: string[];
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

/**
 * Fetch products (PRODUCTION SAFE)
 */
async function getProducts(
  page: number = 1,
  search?: string,
  category?: string,
  limit: number = 24
): Promise<ProductsResponse> {
  try {
    const language = getStoredLanguage();
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
      lang: language,
    };

    if (search?.trim()) params.search = search.trim();
    if (category?.trim()) params.category = category.trim();

    const queryString = new URLSearchParams(params).toString();

    // Fallback chain: NEXT_PUBLIC_APP_URL -> VERCEL_URL -> localhost (for local dev)
    const configuredBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    const vercelBaseUrl = normalizeBaseUrl(process.env.VERCEL_URL);
    const baseUrl = configuredBaseUrl || vercelBaseUrl || 'http://localhost:3000';

    const targetUrl = `${baseUrl}/api/v1/products?${queryString}`;
    console.log("🌐 [PRODUCTS] Fetch products", { targetUrl, baseUrl });

    const res = await fetch(targetUrl, {
      next: { revalidate: 60, tags: ["products"] },
    });

    if (!res.ok) throw new Error(`API failed: ${res.status}`);

    const response = await res.json();
    if (!response.data || !Array.isArray(response.data)) {
      return {
        data: [],
        meta: { total: 0, page: 1, limit: 24, totalPages: 0 }
      };
    }

    return response;

  } catch (e) {
    console.error("❌ PRODUCT ERROR", e);
    return {
      data: [],
      meta: { total: 0, page: 1, limit: 24, totalPages: 0 }
    };
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
    9999
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
    inStock: p.inStock ?? true,
    categories: Array.isArray(p.categories) ? p.categories : [],
    skus: Array.isArray(p.skus) ? p.skus : [],
    brand: p.brand ?? null,
    labels: p.labels ?? [],
    colors: Array.isArray(p.colors) ? p.colors : [],
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


