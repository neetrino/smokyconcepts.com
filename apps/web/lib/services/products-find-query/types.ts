import { Prisma } from "@prisma/client";
import { PRODUCT_LIST_QUERY_INCLUDE } from "./list-query-include";

/**
 * Product filters interface
 */
export interface ProductFilters {
  category?: string;
  search?: string;
  filter?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
  lang?: string;
}

/**
 * Type for product with lean relations used by list/transform.
 */
export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof PRODUCT_LIST_QUERY_INCLUDE;
}>;
