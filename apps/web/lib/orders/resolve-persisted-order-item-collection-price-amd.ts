import { adminInputAmdToUsd } from '@/lib/currency';
import { orderItemHasSavedCustomize } from './order-item-has-saved-customize';

/**
 * Collection/customize surcharge AMD for a persisted order line.
 * Prefers charged unit price delta; title mapping only when customize text was saved.
 */
export function resolvePersistedOrderItemCollectionPriceAmd(params: {
  unitPriceUsd: number;
  variantBaseUsd: number;
  mappedCollectionPriceAmd: number | null;
  customizePlain?: string | null;
  customizeHtml?: string | null;
}): number | null {
  const usdPerAmd = adminInputAmdToUsd(1);
  const inferredCollectionPriceAmd =
    Number.isFinite(params.variantBaseUsd) &&
    Number.isFinite(params.unitPriceUsd) &&
    Number.isFinite(usdPerAmd) &&
    usdPerAmd > 0
      ? Math.max(0, Math.round((params.unitPriceUsd - params.variantBaseUsd) / usdPerAmd))
      : null;

  if (inferredCollectionPriceAmd != null && inferredCollectionPriceAmd > 0) {
    return inferredCollectionPriceAmd;
  }

  if (
    orderItemHasSavedCustomize(params) &&
    params.mappedCollectionPriceAmd != null &&
    params.mappedCollectionPriceAmd > 0
  ) {
    return params.mappedCollectionPriceAmd;
  }

  return inferredCollectionPriceAmd === 0 ? 0 : null;
}
