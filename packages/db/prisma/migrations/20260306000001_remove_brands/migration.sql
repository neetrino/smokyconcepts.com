-- Remove brands: drop brand-related tables and product.brandId.
-- Run after deploying code that no longer uses brands.

ALTER TABLE "products" DROP COLUMN IF EXISTS "brandId";

DROP TABLE IF EXISTS "brand_translations";
DROP TABLE IF EXISTS "brands";
