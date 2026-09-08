import { Prisma } from "@prisma/client";
import { db } from "@white-shop/db";
import { logger } from "../../utils/logger";

/**
 * Field selection for product list queries.
 *
 * Narrowed to exactly what `formatProductForList` reads: the previous `include`
 * pulled every column of every published variant (including the `attributes`
 * JSON) plus unused labels, which dominated the payload of each list request.
 */
const getProductListSelect = () => ({
  id: true,
  published: true,
  featured: true,
  upcoming: true,
  discountPercent: true,
  createdAt: true,
  primaryCategoryId: true,
  categoryIds: true,
  media: true,
  translations: {
    where: { locale: "en" },
    take: 1,
    select: { slug: true, title: true },
  },
  categories: {
    select: {
      translations: {
        where: { locale: "en" },
        take: 1,
        select: { title: true },
      },
    },
  },
  variants: {
    where: { published: true },
    orderBy: [{ position: "asc" as const }, { createdAt: "asc" as const }],
    select: {
      price: true,
      stock: true,
      compareAtPrice: true,
      imageUrl: true,
      attributes: true,
    },
  },
});

export type AdminProductListRecord = Prisma.ProductGetPayload<{
  select: ReturnType<typeof getProductListSelect>;
}>;

/**
 * Base include configuration for product detail queries
 */
const getProductDetailInclude = () => ({
  translations: true,
  categories: {
    include: {
      translations: true,
    },
  },
  variants: {
    orderBy: [{ position: "asc" as const }, { createdAt: "asc" as const }],
  },
  labels: true,
});

/**
 * Execute product list query with error handling
 */
export async function executeProductListQuery(
  where: Prisma.ProductWhereInput,
  orderBy: Prisma.ProductOrderByWithRelationInput,
  skip: number,
  take: number
): Promise<{ products: AdminProductListRecord[]; total: number }> {
  const queryStartTime = Date.now();

  try {
    // Rows and count run in parallel: sequential awaits doubled the round-trip
    // latency against the remote (pooled) database on every admin list request.
    const [products, countedTotal] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take,
        orderBy,
        select: getProductListSelect(),
      }),
      db.product.count({ where }).catch((countError: unknown): null => {
        logger.warn('Count query failed, using estimated total', {
          error: countError instanceof Error ? countError.message : String(countError),
        });
        return null;
      }),
    ]);

    const total = countedTotal ?? products.length;

    const queryTime = Date.now() - queryStartTime;
    logger.debug(`Product list queries completed in ${queryTime}ms`, {
      found: products.length,
      total,
    });

    return { products, total };
  } catch (error: unknown) {
    const queryTime = Date.now() - queryStartTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorObj = error as { code?: string; meta?: unknown; stack?: string };
    logger.error(`Database query error after ${queryTime}ms`, {
      error: {
        message: errorMessage,
        code: errorObj?.code,
        meta: errorObj?.meta,
        stack: errorObj?.stack?.substring(0, 500),
      },
    });
    
    throw error;
  }
}

/**
 * Execute product detail query with error handling
 */
export async function executeProductDetailQuery(productId: string) {
  const product = await db.product.findUnique({
    where: { id: productId },
    include: getProductDetailInclude(),
  });
  return product;
}

