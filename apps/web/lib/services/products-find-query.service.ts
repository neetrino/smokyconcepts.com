import { buildWhereClause } from "./products-find-query/query-builder";
import { executeProductQuery } from "./products-find-query/query-executor";
import type { ProductFilters, ProductWithRelations } from "./products-find-query/types";

/**
 * Service for building and executing product find queries
 */
class ProductsFindQueryService {
  /**
   * Build where clause and fetch products from database
   */
  async buildQueryAndFetch(filters: ProductFilters): Promise<{
    products: ProductWithRelations[];
    bestsellerProductIds: string[];
  }> {
    const { limit = 24 } = filters;

    // Build where clause
    const { where, bestsellerProductIds } = await buildWhereClause(filters);

    // If where is null (category not found), return empty result
    if (where === null) {
      return {
        products: [],
        bestsellerProductIds: [],
      };
    }

    // Execute query with comprehensive error handling
    const products = await executeProductQuery(where, limit);

    return {
      products,
      bestsellerProductIds,
    };
  }
}

export const productsFindQueryService = new ProductsFindQueryService();
export type { ProductFilters, ProductWithRelations };
