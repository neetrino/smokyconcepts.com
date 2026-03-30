-- Cart has been moved to localStorage-only flow.
-- Remove cart-related database tables.
DROP TABLE IF EXISTS "cart_items";
DROP TABLE IF EXISTS "carts";
