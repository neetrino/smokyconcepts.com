import Link from 'next/link';
import { Suspense } from 'react';
import { Button } from '../../components/ui/buttons';
import { apiClient } from '../../lib/api-client';
import { getStoredLanguage } from '../../lib/language';
import { t } from '../../lib/i18n';
import { PriceFilter } from '../../components/PriceFilter';
import { ProductsHeader } from '../../components/ProductsHeader';
import { ProductsDiscoveryBar } from '../../components/ProductsDiscoveryBar';
import { ProductsGrid } from '../../components/ProductsGrid';
import { CategoryNavigation } from '../../components/CategoryNavigation';
import { MobileFiltersDrawer } from '../../components/MobileFiltersDrawer';
import { MOBILE_FILTERS_EVENT } from '../../lib/events';

export const revalidate = 60;

const PAGE_CONTAINER = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
// Container for filters section to align with Header logo (same Y-axis)
// Header logo uses: pl-2 sm:pl-4 md:pl-6 lg:pl-8

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  originalPrice?: number | null;
  compareAtPrice: number | null;
  image: string | null;
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
  minPrice?: string,
  maxPrice?: string,
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
    if (minPrice?.trim()) params.minPrice = minPrice.trim();
    if (maxPrice?.trim()) params.maxPrice = maxPrice.trim();

    const queryString = new URLSearchParams(params).toString();

    // Fallback chain: NEXT_PUBLIC_APP_URL -> VERCEL_URL -> localhost (for local dev)
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

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

/**
 * PAGE
 */
export default async function ProductsPage({ searchParams }: any) {
  const params = searchParams ? await searchParams : {};
  const page = parseInt(params?.page || "1", 10);
  const limitParam = params?.limit?.toString().trim();
  const parsedLimit = limitParam && !Number.isNaN(parseInt(limitParam, 10))
    ? parseInt(limitParam, 10)
    : null;
  // Default to 9999 (all) if no limit specified, or use the parsed limit
  // If limit is >= 1000, treat as "all" (show all products)
  const perPage = parsedLimit 
    ? (parsedLimit >= 1000 ? 9999 : parsedLimit)
    : 9999;

  const productsData = await getProducts(
    page,
    params?.search,
    params?.category,
    params?.minPrice,
    params?.maxPrice,
    perPage
  );

  // ------------------------------------
  // 🔧 FIX: normalize products 
  // add missing inStock, missing image fields 
  // ------------------------------------
  const normalizedProducts: Product[] = productsData.data.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: p.price,
    originalPrice: p.originalPrice ?? null,
    compareAtPrice: p.compareAtPrice ?? p.originalPrice ?? null,
    image: p.image ?? null,
    inStock: p.inStock ?? true,
    categories: Array.isArray(p.categories) ? p.categories : [],
    skus: Array.isArray(p.skus) ? p.skus : [],
    brand: p.brand ?? null,
    labels: p.labels ?? []
  }));

  // PAGINATION
  const buildPaginationUrl = (num: number) => {
    const q = new URLSearchParams();
    q.set("page", num.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (k !== "page" && v && typeof v === "string") q.set(k, v);
    });
    return `/products?${q.toString()}`;
  };

  // Get language for translations
  const language = getStoredLanguage();

  return (
    <div className="w-full overflow-x-hidden max-w-full">
      {/* Category Navigation - Full Width */}
      <CategoryNavigation />
      
      {/* Products Header - With Container */}
      <div className={PAGE_CONTAINER}>
        <ProductsHeader
          total={productsData.meta.total}
          perPage={productsData.meta.limit}
        />
      </div>

      <ProductsDiscoveryBar products={normalizedProducts} />

      <div className="max-w-7xl mx-auto pl-2 sm:pl-4 md:pl-6 lg:pl-8 pr-4 sm:pr-6 lg:pr-8 flex flex-col lg:flex-row gap-8">
        <aside className="w-64 hidden lg:block bg-gray-50 rounded-xl flex-shrink-0">
          <div className="sticky top-4 p-4 space-y-6">
            <Suspense fallback={<div>{t(language, 'common.messages.loadingFilters')}</div>}>
              <PriceFilter currentMinPrice={params?.minPrice} currentMaxPrice={params?.maxPrice} category={params?.category} search={params?.search} />
            </Suspense>
          </div>
        </aside>

        <div className="flex-1 min-w-0 w-full lg:w-auto py-4 overflow-x-hidden">

          {normalizedProducts.length > 0 ? (
            <>
              <ProductsGrid products={normalizedProducts} sortBy={params?.sort || "default"} />

              {productsData.meta.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {page > 1 && <Link href={buildPaginationUrl(page - 1)}><Button variant="goldOutline">{t(language, 'common.pagination.previous')}</Button></Link>}
                  <span>{t(language, 'common.pagination.pageOf').replace('{page}', page.toString()).replace('{totalPages}', productsData.meta.totalPages.toString())}</span>
                  {page < productsData.meta.totalPages && <Link href={buildPaginationUrl(page + 1)}><Button variant="goldOutline">{t(language, 'common.pagination.next')}</Button></Link>}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{t(language, 'common.messages.noProductsFound')}</p>
            </div>
          )}

        </div>
      </div>
      
      {/* Mobile Filters Drawer */}
      <MobileFiltersDrawer openEventName={MOBILE_FILTERS_EVENT}>
        <div className="p-4 space-y-6">
          <Suspense fallback={<div>{t(language, 'common.messages.loadingFilters')}</div>}>
            <PriceFilter currentMinPrice={params?.minPrice} currentMaxPrice={params?.maxPrice} category={params?.category} search={params?.search} />
          </Suspense>
        </div>
      </MobileFiltersDrawer>
    </div>
  );
}


