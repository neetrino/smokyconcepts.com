import { db } from '@white-shop/db';

/** Align with catalog/PDP `revalidate = 60` — discount settings rarely change mid-minute. */
const DISCOUNT_SETTINGS_CACHE_TTL_MS = 60_000;

export interface DiscountSettingsSnapshot {
  globalDiscount: number;
  categoryDiscounts: Record<string, number>;
}

let cachedSnapshot: DiscountSettingsSnapshot | null = null;
let cachedAtMs = 0;
let inflightLoad: Promise<DiscountSettingsSnapshot> | null = null;

async function fetchDiscountSettings(): Promise<DiscountSettingsSnapshot> {
  const discountSettings = await db.settings.findMany({
    where: {
      key: {
        in: ['globalDiscount', 'categoryDiscounts'],
      },
    },
  });

  const globalDiscount =
    Number(
      discountSettings.find((s: { key: string; value: unknown }) => s.key === 'globalDiscount')
        ?.value
    ) || 0;

  const categoryDiscountsSetting = discountSettings.find(
    (s: { key: string; value: unknown }) => s.key === 'categoryDiscounts'
  );
  const categoryDiscounts = categoryDiscountsSetting
    ? (categoryDiscountsSetting.value as Record<string, number>) || {}
    : {};

  return { globalDiscount, categoryDiscounts };
}

/**
 * Shared discount settings for product list + PDP transforms (in-process + short TTL).
 */
export async function getCachedDiscountSettings(): Promise<DiscountSettingsSnapshot> {
  const now = Date.now();
  if (cachedSnapshot && now - cachedAtMs < DISCOUNT_SETTINGS_CACHE_TTL_MS) {
    return cachedSnapshot;
  }

  if (inflightLoad) {
    return inflightLoad;
  }

  inflightLoad = fetchDiscountSettings()
    .then((snapshot) => {
      cachedSnapshot = snapshot;
      cachedAtMs = Date.now();
      return snapshot;
    })
    .finally(() => {
      inflightLoad = null;
    });

  return inflightLoad;
}

/** Call after admin updates global/category discounts. */
export function invalidateDiscountSettingsCache(): void {
  cachedSnapshot = null;
  cachedAtMs = 0;
}
