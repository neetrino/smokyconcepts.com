import { db } from "@white-shop/db";
import { logger } from "../../utils/logger";
import type { ProductFilters } from "./types";
import { buildProductWhereClause, buildProductOrderByClause } from "./query-builder";
import { executeProductListQuery, executeProductDetailQuery } from "./query-executor";
import { formatProductForList } from "./product-formatter";
import { formatVariantForAdmin } from "./variant-formatter";

/**
 * Get products for admin
 */
export async function getProducts(filters: ProductFilters) {
  logger.info('getProducts called with filters', { filters });
  const startTime = Date.now();
  
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where = buildProductWhereClause(filters);
  const orderBy = buildProductOrderByClause(filters);

  logger.debug('Executing database queries...', { where: JSON.stringify(where, null, 2) });

  const { products, total } = await executeProductListQuery(where, orderBy, skip, limit);

  const data = products.map(formatProductForList);

  const totalTime = Date.now() - startTime;
  logger.info(`getProducts completed in ${totalTime}ms. Returning ${data.length} products`);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get product by ID
 */
export async function getProductById(productId: string) {
  const product = await executeProductDetailQuery(productId);

  if (!product) {
    throw {
      status: 404,
      type: "https://api.shop.am/problems/not-found",
      title: "Product not found",
      detail: `Product with id '${productId}' does not exist`,
    };
  }

  // Безопасное получение translation с проверкой на существование массива
  const translations = Array.isArray(product.translations) ? product.translations : [];
  const translation = translations.find((t: { locale: string }) => t.locale === "en") || translations[0] || null;

  // Безопасное получение labels с проверкой на существование массива
  const labels = Array.isArray(product.labels) ? product.labels : [];
  
  // Безопасное получение variants с проверкой на существование массива
  const variants = Array.isArray(product.variants) ? product.variants : [];
  
  const attributeIds: string[] = [];

  return {
    id: product.id,
    title: translation?.title || "",
    slug: translation?.slug || "",
    subtitle: translation?.subtitle || null,
    descriptionHtml: translation?.descriptionHtml || null,
    primaryCategoryId: product.primaryCategoryId || null,
    categoryIds: product.categoryIds || [],
    attributeIds,
    published: product.published,
    featured: product.featured ?? false,
    upcoming: product.upcoming ?? false,
    media: Array.isArray(product.media) ? product.media : [],
    labels: labels.map((label: { id: string; type: string; value: string; position: string; color: string | null }) => ({
      id: label.id,
      type: label.type,
      value: label.value,
      position: label.position,
      color: label.color,
    })),
    variants: variants.map(formatVariantForAdmin),
  };
}




