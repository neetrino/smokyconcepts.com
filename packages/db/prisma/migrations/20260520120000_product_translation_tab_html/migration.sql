-- Product / Shipping tab copy on storefront PDP (admin Basic Information)
ALTER TABLE "product_translations"
ADD COLUMN IF NOT EXISTS "productDetailsHtml" TEXT,
ADD COLUMN IF NOT EXISTS "shippingHtml" TEXT;
