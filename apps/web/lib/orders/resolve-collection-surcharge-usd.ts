import {
  adminInputAmdToUsd,
  catalogPriceToUsd,
  persistedOrderMoneyToUsd,
} from '@/lib/currency';

export function resolveCollectionSurchargeUsd(
  item: {
    quantity?: number | null;
    price?: number | null;
    total?: number | null;
    sizeCatalogTitle?: string | null;
    variant?: { price?: number | null } | null;
  },
  sizeCatalogPriceByTitle: Map<string, number>,
  orderCurrency: string
): number {
  const quantity = Math.max(0, Number(item.quantity ?? 0));
  if (quantity === 0) {
    return 0;
  }

  const itemUnitPrice = persistedOrderMoneyToUsd(Number(item.price ?? 0), orderCurrency);
  const variantBasePriceUsd = catalogPriceToUsd(Number(item.variant?.price ?? Number.NaN));
  if (Number.isFinite(itemUnitPrice) && Number.isFinite(variantBasePriceUsd)) {
    const perUnitSurcharge = Math.max(0, itemUnitPrice - variantBasePriceUsd);
    if (perUnitSurcharge > 0) {
      return perUnitSurcharge * quantity;
    }
  }

  const normalizedTitle = item.sizeCatalogTitle?.trim().toLocaleLowerCase() ?? '';
  const mappedSurchargeAmd = normalizedTitle !== '' ? (sizeCatalogPriceByTitle.get(normalizedTitle) ?? 0) : 0;
  if (mappedSurchargeAmd > 0) {
    return adminInputAmdToUsd(mappedSurchargeAmd) * quantity;
  }

  const itemTotal = persistedOrderMoneyToUsd(Number(item.total ?? 0), orderCurrency);
  if (!Number.isFinite(itemTotal) || itemTotal <= 0 || !Number.isFinite(variantBasePriceUsd)) {
    return 0;
  }
  const baseTotal = variantBasePriceUsd * quantity;
  return Math.max(0, itemTotal - baseTotal);
}
