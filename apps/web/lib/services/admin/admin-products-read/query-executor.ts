import { Prisma } from "@prisma/client";
import { db } from "@white-shop/db";
import { logger } from "../../utils/logger";

/**
 * Base include configuration for product list queries
 */
const getProductListInclude = () => ({
  translations: {
    where: { locale: "en" },
    take: 1,
  },
  categories: {
    include: {
      translations: {
        where: { locale: "en" },
        take: 1,
      },
    },
  },
  variants: {
    where: { published: true },
    take: 1,
    orderBy: { price: "asc" as const },
  },
  labels: true,
});

export type AdminProductListRecord = Prisma.ProductGetPayload<{
  include: ReturnType<typeof getProductListInclude>;
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
    orderBy: {
      position: "asc",
    },
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
    // Test database connection first
    logger.debug('Testing database connection...');
    await db.$queryRaw`SELECT 1`;
    logger.debug('Database connection OK');

    // Fetch products
    logger.debug('Fetching products...');
    const products = await db.product.findMany({
      where,
      skip,
      take,
      orderBy,
      include: getProductListInclude(),
    });
    
    const productsTime = Date.now() - queryStartTime;
    logger.debug(`Products fetched in ${productsTime}ms. Found ${products.length} products`);

    // Get count with timeout
    logger.debug('Counting total products...');
    const countStartTime = Date.now();
    
    const countPromise = db.product.count({ where });
    const timeoutPromise = new Promise<number>((_, reject) => 
      setTimeout(() => reject(new Error("Count query timeout")), 10000)
    );
    
    let total: number;
    try {
      total = await Promise.race([countPromise, timeoutPromise]) as number;
      const countTime = Date.now() - countStartTime;
      logger.debug(`Count completed in ${countTime}ms. Total: ${total}`);
    } catch (countError: unknown) {
      logger.warn('Count query failed, using estimated total', { 
        error: countError instanceof Error ? countError.message : String(countError) 
      });
      total = products.length || take;
    }
    
    const queryTime = Date.now() - queryStartTime;
    logger.debug(`All database queries completed in ${queryTime}ms`);

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

