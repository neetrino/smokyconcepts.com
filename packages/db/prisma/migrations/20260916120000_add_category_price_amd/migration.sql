-- Customize surcharge lives on product collections, not size-catalog rows.
ALTER TABLE "categories"
ADD COLUMN "priceAmd" INTEGER NOT NULL DEFAULT 0;
