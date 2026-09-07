/**
 * Lean Prisma include for product list queries.
 * Omits heavy translation HTML/SEO columns that catalog cards never use.
 */
export const PRODUCT_LIST_QUERY_INCLUDE = {
  translations: {
    select: {
      locale: true,
      title: true,
      slug: true,
    },
  },
  variants: {
    where: {
      published: true,
    },
    orderBy: {
      position: 'asc' as const,
    },
    select: {
      id: true,
      sku: true,
      price: true,
      compareAtPrice: true,
      stock: true,
      imageUrl: true,
      position: true,
      attributes: true,
      published: true,
    },
  },
  labels: true,
  categories: {
    select: {
      id: true,
      translations: {
        select: {
          locale: true,
          slug: true,
          title: true,
        },
      },
    },
  },
} as const;

/** When price filters run in memory, over-fetch a bounded window. */
export const PRODUCT_LIST_PRICE_FILTER_OVERFETCH_MULTIPLIER = 5;

/** Hard cap so catalog/list never requests tens of thousands of rows. */
export const PRODUCT_LIST_MAX_TAKE = 500;

/**
 * Resolve Prisma `take` for list queries.
 * Price filters need over-fetch; catalog/featured use exact `limit`.
 */
export function resolveProductListTake(
  limit: number,
  needsPriceFilterOverfetch: boolean
): number {
  const safeLimit = Math.max(1, Math.min(limit, PRODUCT_LIST_MAX_TAKE));
  if (!needsPriceFilterOverfetch) {
    return safeLimit;
  }
  return Math.min(
    safeLimit * PRODUCT_LIST_PRICE_FILTER_OVERFETCH_MULTIPLIER,
    PRODUCT_LIST_MAX_TAKE
  );
}
