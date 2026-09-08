import { db } from "@white-shop/db";

const UNKNOWN_PRODUCT_TITLE = "Unknown Product";
const UNKNOWN_SKU = "N/A";

/**
 * Extract image from product media
 */
function extractImageFromMedia(media: unknown[] | undefined): string | null {
  if (!Array.isArray(media) || media.length === 0) {
    return null;
  }

  const firstMedia = media[0];

  if (typeof firstMedia === "string") {
    return firstMedia;
  }

  if (firstMedia && typeof firstMedia === "object" && "url" in firstMedia) {
    const mediaObj = firstMedia as { url?: string };
    return mediaObj.url || null;
  }

  return null;
}

interface VariantDetails {
  productId: string;
  sku: string | null;
  title: string;
  image: string | null;
}

/** `db` is loosely typed at the client boundary, so query shapes are declared here. */
interface RankedVariantGroup {
  variantId: string | null;
  _sum: { quantity: number | null; total: number | null };
  _count: { _all: number };
}

interface VariantWithProduct {
  id: string;
  productId: string;
  sku: string | null;
  product?: {
    media?: unknown[];
    translations: Array<{ title: string }>;
  } | null;
}

/** Loads presentation data for the already-ranked variants only. */
async function loadVariantDetails(variantIds: string[]): Promise<Map<string, VariantDetails>> {
  const variants: VariantWithProduct[] = await db.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: {
      id: true,
      productId: true,
      sku: true,
      product: {
        select: {
          media: true,
          translations: {
            where: { locale: "en" },
            take: 1,
          },
        },
      },
    },
  });

  return new Map<string, VariantDetails>(
    variants.map((variant: VariantWithProduct) => [
      variant.id,
      {
        productId: variant.productId,
        sku: variant.sku,
        title: variant.product?.translations[0]?.title || UNKNOWN_PRODUCT_TITLE,
        image: extractImageFromMedia(variant.product?.media),
      },
    ])
  );
}

/**
 * Get top products for dashboard.
 *
 * Ranking is done by the database via `groupBy`, so only the `limit` winning
 * variants are hydrated instead of streaming every order item into memory.
 */
export async function getTopProducts(limit: number = 5) {
  const rankedVariants: RankedVariantGroup[] = await db.orderItem.groupBy({
    by: ["variantId"],
    where: { variantId: { not: null } },
    _sum: { quantity: true, total: true },
    _count: { _all: true },
    orderBy: { _sum: { total: "desc" } },
    take: limit,
  });

  const variantIds = rankedVariants
    .map((group: RankedVariantGroup) => group.variantId)
    .filter((variantId: string | null): variantId is string => Boolean(variantId));

  if (variantIds.length === 0) {
    return [];
  }

  const detailsByVariantId = await loadVariantDetails(variantIds);

  return variantIds.flatMap((variantId: string, index: number) => {
    const details = detailsByVariantId.get(variantId);
    if (!details) {
      return [];
    }

    const group = rankedVariants[index];

    return [
      {
        variantId,
        productId: details.productId,
        title: details.title,
        sku: details.sku || UNKNOWN_SKU,
        totalQuantity: group._sum.quantity ?? 0,
        totalRevenue: group._sum.total ?? 0,
        orderCount: group._count._all,
        image: details.image,
      },
    ];
  });
}
