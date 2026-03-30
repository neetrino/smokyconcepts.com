import { Prisma } from "@prisma/client";

/**
 * Type for product with all relations needed for slug service
 */
export type ProductWithFullRelations = Prisma.ProductGetPayload<{
  include: {
    translations: true;
    categories: {
      include: {
        translations: true;
      };
    };
    variants: true;
    labels: true;
  };
}>;

/**
 * Type for product variant with options
 */
export type ProductVariantWithOptions = ProductWithFullRelations['variants'][number];




