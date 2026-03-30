-- Remove attribute variation: drop attribute-related tables and product_variant_options.
-- Run this after deploying code that no longer uses these tables.

-- Drop tables that reference attribute_values and product_variants
DROP TABLE IF EXISTS "product_variant_options";

-- Drop product-attribute junction
DROP TABLE IF EXISTS "product_attributes";

-- Drop attribute value translations and values
DROP TABLE IF EXISTS "attribute_value_translations";
DROP TABLE IF EXISTS "attribute_values";

-- Drop attribute translations and attributes
DROP TABLE IF EXISTS "attribute_translations";
DROP TABLE IF EXISTS "attributes";

-- Remove attributeIds column from products if it exists
ALTER TABLE "products" DROP COLUMN IF EXISTS "attributeIds";
