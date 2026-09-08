import { db } from "@white-shop/db";
import type { AnalyticsDateRange } from "./analytics-date-range";

const TOP_LIST_LIMIT = 10;
const UNKNOWN_PRODUCT_TITLE = "Unknown Product";
const UNKNOWN_SKU = "N/A";

export interface VariantSalesGroup {
  variantId: string | null;
  productTitle: string;
  sku: string;
  _sum: { quantity: number | null; total: number | null };
  _count: { _all: number };
}

export interface VariantSales {
  variantId: string;
  title: string;
  sku: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
}

export interface TopProduct extends VariantSales {
  productId: string;
  image: string | null;
}

export interface TopCategory {
  categoryId: string;
  categoryName: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
}

interface VariantProduct {
  productId: string;
  categories: Array<{ id: string; name: string }>;
}

/** `db` is loosely typed at the client boundary, so the query shape is declared here. */
interface VariantWithCategories {
  id: string;
  productId: string;
  product?: {
    categories: Array<{ id: string; translations: Array<{ title: string }> }>;
  } | null;
}

/**
 * Aggregate sales per variant in the given period.
 *
 * The database does the summing; grouping also carries the denormalized
 * title/SKU stored on each order item so no extra lookup is needed.
 */
export async function loadVariantSalesGroups(
  range: AnalyticsDateRange
): Promise<VariantSalesGroup[]> {
  return db.orderItem.groupBy({
    by: ["variantId", "productTitle", "sku"],
    where: {
      variantId: { not: null },
      order: { createdAt: { gte: range.start, lte: range.end } },
    },
    _sum: { quantity: true, total: true },
    _count: { _all: true },
  });
}

/** Merges the (variant, title, sku) groups back into one row per variant. */
export function mergeVariantSales(groups: VariantSalesGroup[]): VariantSales[] {
  const salesByVariantId = new Map<string, VariantSales>();

  for (const group of groups) {
    if (!group.variantId) {
      continue;
    }

    const existing = salesByVariantId.get(group.variantId) ?? {
      variantId: group.variantId,
      title: group.productTitle || UNKNOWN_PRODUCT_TITLE,
      sku: group.sku || UNKNOWN_SKU,
      totalQuantity: 0,
      totalRevenue: 0,
      orderCount: 0,
    };

    existing.totalQuantity += group._sum.quantity ?? 0;
    existing.totalRevenue += group._sum.total ?? 0;
    existing.orderCount += group._count._all;
    salesByVariantId.set(group.variantId, existing);
  }

  return [...salesByVariantId.values()];
}

/**
 * Loads product and category context for the variants sold in the period.
 *
 * Filtering by the relation keeps this to a single indexed semi-join instead of
 * nesting product/category joins inside every order item row.
 */
export async function loadVariantProducts(
  range: AnalyticsDateRange
): Promise<Map<string, VariantProduct>> {
  const variants: VariantWithCategories[] = await db.productVariant.findMany({
    where: {
      orderItems: { some: { order: { createdAt: { gte: range.start, lte: range.end } } } },
    },
    select: {
      id: true,
      productId: true,
      product: {
        select: {
          categories: {
            select: {
              id: true,
              translations: { where: { locale: "en" }, take: 1 },
            },
          },
        },
      },
    },
  });

  return new Map<string, VariantProduct>(
    variants.map((variant: VariantWithCategories) => [
      variant.id,
      {
        productId: variant.productId,
        categories: (variant.product?.categories ?? []).map(
          (category: { id: string; translations: Array<{ title: string }> }) => ({
            id: category.id,
            name: category.translations[0]?.title || category.id,
          })
        ),
      },
    ])
  );
}

export function buildTopProducts(
  sales: VariantSales[],
  variantProducts: Map<string, VariantProduct>
): TopProduct[] {
  return [...sales]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, TOP_LIST_LIMIT)
    .map((entry) => ({
      ...entry,
      productId: variantProducts.get(entry.variantId)?.productId || "",
      image: null,
    }));
}

export function buildTopCategories(
  sales: VariantSales[],
  variantProducts: Map<string, VariantProduct>
): TopCategory[] {
  const categoryTotals = new Map<string, TopCategory>();

  for (const entry of sales) {
    for (const category of variantProducts.get(entry.variantId)?.categories ?? []) {
      const existing = categoryTotals.get(category.id) ?? {
        categoryId: category.id,
        categoryName: category.name,
        totalQuantity: 0,
        totalRevenue: 0,
        orderCount: 0,
      };

      existing.totalQuantity += entry.totalQuantity;
      existing.totalRevenue += entry.totalRevenue;
      existing.orderCount += entry.orderCount;
      categoryTotals.set(category.id, existing);
    }
  }

  return [...categoryTotals.values()]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, TOP_LIST_LIMIT);
}
