/**
 * One-time migration: product_variants.price / compareAtPrice stored as USD → AMD.
 *
 * Usage (from repo root):
 *   pnpm exec tsx scripts/migrate-catalog-prices-usd-to-amd.ts --dry-run
 *   pnpm exec tsx scripts/migrate-catalog-prices-usd-to-amd.ts
 *
 * Uses LEGACY_USD_CATALOG_PRICE_MAX from currency helpers (default: <= 200 treated as USD).
 */

import { PrismaClient } from '@prisma/client';

const LEGACY_USD_CATALOG_PRICE_MAX = 200;
const DEFAULT_AMD_PER_USD = 400;

const prisma = new PrismaClient();
const dryRun = process.argv.includes('--dry-run');

function usdToAmd(usd: number, amdPerUsd: number): number {
  return Math.max(0, Math.round(usd * amdPerUsd));
}

function isLegacyUsdPrice(stored: number): boolean {
  return stored > 0 && stored <= LEGACY_USD_CATALOG_PRICE_MAX;
}

async function main(): Promise<void> {
  const settings = await prisma.settings.findUnique({ where: { key: 'currencyRates' } });
  const rates = (settings?.value as { USD?: number } | null) ?? null;
  const usdRate = typeof rates?.USD === 'number' && rates.USD > 0 ? rates.USD : 1 / DEFAULT_AMD_PER_USD;
  const amdPerUsd = Math.round(1 / usdRate);

  const variants = await prisma.productVariant.findMany({
    select: { id: true, sku: true, price: true, compareAtPrice: true },
  });

  let updated = 0;
  for (const variant of variants) {
    const price = variant.price;
    const compare = variant.compareAtPrice;
    const nextPrice = isLegacyUsdPrice(price) ? usdToAmd(price, amdPerUsd) : price;
    const nextCompare =
      compare != null && isLegacyUsdPrice(compare) ? usdToAmd(compare, amdPerUsd) : compare;

    if (nextPrice === price && nextCompare === compare) {
      continue;
    }

    updated += 1;
    console.log(
      `${dryRun ? '[dry-run] ' : ''}${variant.sku ?? variant.id}: price ${price} → ${nextPrice}` +
        (compare != null && nextCompare !== compare ? `, compare ${compare} → ${nextCompare}` : ''),
    );

    if (!dryRun) {
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: {
          price: nextPrice,
          ...(nextCompare !== compare ? { compareAtPrice: nextCompare } : {}),
        },
      });
    }
  }

  console.log(
    dryRun
      ? `Would update ${updated} variant(s) (amdPerUsd=${amdPerUsd}). Re-run without --dry-run to apply.`
      : `Updated ${updated} variant(s) (amdPerUsd=${amdPerUsd}).`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
