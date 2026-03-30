import { Prisma } from "@prisma/client";
import { db } from "@white-shop/db";
import { ensureProductVariantAttributesColumn } from "../utils/db-ensure";
import { logger } from "../utils/logger";
import type { ProductWithRelations } from "./types";

/**
 * Base include configuration for product queries
 */
const getBaseInclude = () => ({
  translations: true,
  variants: {
    where: {
      published: true,
    },
    orderBy: {
      position: "asc" as const,
    },
  },
  labels: true,
  categories: {
    include: {
      translations: true,
    },
  },
});

/**
 * Check if error is related to product_variants.attributes column
 */
function isVariantAttributesError(error: unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return errorMessage.includes('product_variants.attributes') || 
         (errorMessage.includes('attributes') && errorMessage.includes('does not exist'));
}

/**
 * Check if error is related to attribute_values.colors column
 */
function isAttributeValuesColorsError(error: unknown): boolean {
  const errorObj = error as { code?: string; message?: string };
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (errorObj && typeof errorObj === 'object' && 'code' in errorObj && errorObj.code === 'P2022') || 
         errorMessage.includes('attribute_values.colors') || 
         errorMessage.includes('does not exist');
}

/**
 * Execute product query with comprehensive error handling
 */
export async function executeProductQuery(
  where: Prisma.ProductWhereInput,
  limit: number
): Promise<ProductWithRelations[]> {
  const baseInclude = getBaseInclude();

  try {
    const products = await db.product.findMany({
      where,
      include: baseInclude,
      skip: 0,
      take: limit * 10, // Get more to filter in memory
    });
    logger.info(`Found ${products.length} products from database`);
    return products as ProductWithRelations[];
  } catch (error: unknown) {
    if (isVariantAttributesError(error)) {
      logger.warn('product_variants.attributes column not found, attempting to create it');
      try {
        await ensureProductVariantAttributesColumn();
        const products = await db.product.findMany({
          where,
          include: baseInclude,
          skip: 0,
          take: limit * 10,
        });
        logger.info(`Found ${products.length} products from database (after creating attributes column)`);
        return products as ProductWithRelations[];
      } catch (attributesError: unknown) {
        return handleAttributesError(attributesError, where, limit);
      }
    }

    if (isAttributeValuesColorsError(error)) {
      logger.warn('attribute_values.colors column not found, fetching without attributeValue', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return executeWithoutAttributeValue(where, limit);
    }

    throw error;
  }
}

/**
 * Handle attributes-related errors
 */
async function handleAttributesError(
  error: unknown,
  where: Prisma.ProductWhereInput,
  limit: number
): Promise<ProductWithRelations[]> {
  if (isAttributeValuesColorsError(error)) {
    logger.warn('attribute_values.colors column not found, fetching without attributeValue', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return executeWithoutAttributeValue(where, limit);
  }
  throw error;
}

/**
 * Execute query without attributeValue relation (fallback)
 */
async function executeWithoutAttributeValue(
  where: Prisma.ProductWhereInput,
  limit: number
): Promise<ProductWithRelations[]> {
  const baseInclude = getBaseInclude();
  const products = await db.product.findMany({
    where,
    include: baseInclude,
    skip: 0,
    take: limit * 10,
  });
  logger.info(`Found ${products.length} products from database (without attributeValue)`);
  return products as ProductWithRelations[];
}

