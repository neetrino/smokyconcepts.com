import { db } from "@white-shop/db";

const PRODUCT_COLLECTION_ORDER_SETTING_KEY = "product-collection-order-by-category";

export type ProductCollectionOrderMap = Record<string, string[]>;

function normalizeOrderMapValue(value: unknown): ProductCollectionOrderMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const entries = Object.entries(value);
  const normalized: ProductCollectionOrderMap = {};

  for (const [categoryId, rawIds] of entries) {
    if (!Array.isArray(rawIds)) {
      continue;
    }

    const uniqueIds = Array.from(
      new Set(
        rawIds.filter(
          (id): id is string => typeof id === "string" && id.trim().length > 0
        )
      )
    );
    normalized[categoryId] = uniqueIds;
  }

  return normalized;
}

export async function getProductCollectionOrderMap(): Promise<ProductCollectionOrderMap> {
  const setting = await db.settings.findUnique({
    where: { key: PRODUCT_COLLECTION_ORDER_SETTING_KEY },
    select: { value: true },
  });

  return normalizeOrderMapValue(setting?.value);
}

export async function saveProductCollectionOrderMap(
  orderMap: ProductCollectionOrderMap
): Promise<void> {
  await db.settings.upsert({
    where: { key: PRODUCT_COLLECTION_ORDER_SETTING_KEY },
    update: {
      value: orderMap,
      updatedAt: new Date(),
    },
    create: {
      key: PRODUCT_COLLECTION_ORDER_SETTING_KEY,
      value: orderMap,
      description: "Manual product order by collection (category id)",
    },
  });
}

export function sortItemsByExplicitIdOrder<T extends { id: string }>(
  items: T[],
  orderedIds: readonly string[]
): T[] {
  if (orderedIds.length === 0 || items.length <= 1) {
    return items;
  }

  const orderIndexById = new Map<string, number>();
  orderedIds.forEach((id, index) => {
    orderIndexById.set(id, index);
  });

  return [...items].sort((a, b) => {
    const indexA = orderIndexById.get(a.id);
    const indexB = orderIndexById.get(b.id);
    const rankA = indexA ?? Number.MAX_SAFE_INTEGER;
    const rankB = indexB ?? Number.MAX_SAFE_INTEGER;

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    return 0;
  });
}
