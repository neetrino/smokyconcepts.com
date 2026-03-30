import { db } from "@white-shop/db";
import { logger } from "./logger";

// Cache to track if table check has been performed
let tableChecked = false;
let tableExists = false;

// Cache for product_variants.attributes column
let attributesColumnChecked = false;
let attributesColumnExists = false;

/**
 * Checks if the product_attributes table exists. Does NOT create it.
 * product_attributes (and attribute/brand tables) have been removed from the schema;
 * this is a no-op check so callers do not recreate them.
 *
 * @returns Promise<boolean> - true if table exists, false otherwise
 */
export async function ensureProductAttributesTable(): Promise<boolean> {
  if (tableChecked) {
    return tableExists;
  }
  try {
    await db.$queryRaw`SELECT 1 FROM "product_attributes" LIMIT 1`;
    tableChecked = true;
    tableExists = true;
    return true;
  } catch {
    tableChecked = true;
    tableExists = false;
    return false;
  }
}

/**
 * Ensures the attributes column exists in the product_variants table
 * This is a fallback mechanism for Vercel deployments where migrations might not run automatically
 * Uses lazy initialization - checks only once per process
 * 
 * @returns Promise<boolean> - true if column exists or was created, false if creation failed
 */
export async function ensureProductVariantAttributesColumn(): Promise<boolean> {
  // If already checked and exists, return immediately
  if (attributesColumnChecked && attributesColumnExists) {
    return true;
  }
  
  try {
    // Try to query the column to check if it exists
    await db.$queryRaw`SELECT "attributes" FROM "product_variants" LIMIT 1`;
    attributesColumnChecked = true;
    attributesColumnExists = true;
    return true;
  } catch (error: unknown) {
    // If column doesn't exist, create it
    const prismaError = error as { code?: string; message?: string };
    if (
      prismaError?.code === 'P2022' || 
      prismaError?.message?.includes('does not exist') ||
      prismaError?.message?.includes('product_variants.attributes') ||
      (prismaError?.message?.includes('column') && prismaError?.message?.includes('attributes'))
    ) {
      logger.info('product_variants.attributes column not found, creating...');
      
      try {
        // Add the attributes JSONB column if it doesn't exist
        await db.$executeRaw`
          ALTER TABLE "product_variants" 
          ADD COLUMN IF NOT EXISTS "attributes" JSONB
        `;
        
        logger.info('product_variants.attributes column created successfully');
        attributesColumnChecked = true;
        attributesColumnExists = true;
        return true;
      } catch (createError: unknown) {
        const prismaCreateError = createError as { message?: string; code?: string };
        logger.error('Failed to create product_variants.attributes column', {
          message: prismaCreateError?.message,
          code: prismaCreateError?.code,
        });
        attributesColumnChecked = true;
        attributesColumnExists = false;
        return false;
      }
    }
    
    // Other errors - log and return false
    logger.error('Unexpected error checking product_variants.attributes column', {
      message: prismaError?.message,
      code: prismaError?.code,
    });
    attributesColumnChecked = true;
    attributesColumnExists = false;
    return false;
  }
}

