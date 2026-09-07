import { Prisma } from "@prisma/client";
import { db } from "@white-shop/db";
import { ensureProductVariantAttributesColumn } from "../utils/db-ensure";
import { logger } from "../utils/logger";
import type { ProductWithRelations } from "./types";
import {
  PRODUCT_LIST_QUERY_INCLUDE,
  resolveProductListTake,
} from "./list-query-include";

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

interface ExecuteProductQueryOptions {
  needsPriceFilterOverfetch?: boolean;
}

/**
 * Execute product query with lean includes and bounded take.
 */
export async function executeProductQuery(
  where: Prisma.ProductWhereInput,
  limit: number,
  options: ExecuteProductQueryOptions = {}
): Promise<ProductWithRelations[]> {
  const take = resolveProductListTake(limit, options.needsPriceFilterOverfetch === true);
  const baseInclude = PRODUCT_LIST_QUERY_INCLUDE;

  try {
    const products = await db.product.findMany({
      where,
      include: baseInclude,
      skip: 0,
      take,
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
          take,
        });
        logger.info(`Found ${products.length} products from database (after creating attributes column)`);
        return products as ProductWithRelations[];
      } catch (attributesError: unknown) {
        return handleAttributesError(attributesError, where, take);
      }
    }

    if (isAttributeValuesColorsError(error)) {
      logger.warn('attribute_values.colors column not found, fetching without attributeValue', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return executeWithoutAttributeValue(where, take);
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
  take: number
): Promise<ProductWithRelations[]> {
  if (isAttributeValuesColorsError(error)) {
    logger.warn('attribute_values.colors column not found, fetching without attributeValue', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return executeWithoutAttributeValue(where, take);
  }
  throw error;
}

/**
 * Execute query without attributeValue relation (fallback)
 */
async function executeWithoutAttributeValue(
  where: Prisma.ProductWhereInput,
  take: number
): Promise<ProductWithRelations[]> {
  const products = await db.product.findMany({
    where,
    include: PRODUCT_LIST_QUERY_INCLUDE,
    skip: 0,
    take,
  });
  logger.info(`Found ${products.length} products from database (without attributeValue)`);
  return products as ProductWithRelations[];
}
