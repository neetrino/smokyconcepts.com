-- Admin list and dashboard queries join order items and sort products by creation
-- date; without these indexes every such query fell back to a sequential scan.

-- CreateIndex
CREATE INDEX IF NOT EXISTS "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "order_items_variantId_idx" ON "order_items"("variantId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "products_deletedAt_createdAt_idx" ON "products"("deletedAt", "createdAt" DESC);
