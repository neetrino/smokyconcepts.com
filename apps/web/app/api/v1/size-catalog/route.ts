import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { adminService } from '@/lib/services/admin.service';

const SIZE_CATALOG_REVALIDATE_SECONDS = 60;

function createErrorResponse(error: unknown, url: string) {
  const problem = error as Partial<{
    type: string;
    title: string;
    status: number;
    detail: string;
    message: string;
  }>;

  return NextResponse.json(
    {
      type: problem.type || 'https://api.shop.am/problems/internal-error',
      title: problem.title || 'Internal Server Error',
      status: problem.status || 500,
      detail: problem.detail || problem.message || 'An error occurred',
      instance: url,
    },
    { status: problem.status || 500 }
  );
}

const getCachedStorefrontSizeCatalog = unstable_cache(
  async () => adminService.getStorefrontSizeCatalog(),
  ['storefront-size-catalog'],
  {
    revalidate: SIZE_CATALOG_REVALIDATE_SECONDS,
    tags: ['size-catalog'],
  }
);

/**
 * GET /api/v1/size-catalog
 * Public: size categories and items for PDP picker.
 */
export async function GET(req: NextRequest) {
  try {
    const result = await getCachedStorefrontSizeCatalog();
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': `public, s-maxage=${SIZE_CATALOG_REVALIDATE_SECONDS}, stale-while-revalidate=120`,
      },
    });
  } catch (error: unknown) {
    return createErrorResponse(error, req.url);
  }
}
