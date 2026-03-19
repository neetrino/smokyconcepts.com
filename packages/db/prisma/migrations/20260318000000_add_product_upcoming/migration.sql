-- AlterTable
ALTER TABLE "products" ADD COLUMN "upcoming" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "products_upcoming_idx" ON "products"("upcoming");
