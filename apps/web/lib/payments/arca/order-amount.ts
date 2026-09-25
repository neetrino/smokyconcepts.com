import { convertPrice, roundCatalogAmd } from '@/lib/currency';

const ARCA_TEST_MODE_REQUIRED_AMOUNT_AMD = 10;

/**
 * Amount sent to ArCa/Ameria. Test mode uses the bank's fixed AMD amount.
 */
export function resolveOrderAmountForArcaAmd(
  orderTotal: number,
  orderCurrency: string,
  testMode: boolean,
): number {
  if (testMode) {
    return ARCA_TEST_MODE_REQUIRED_AMOUNT_AMD;
  }

  const normalizedCurrency = orderCurrency.trim().toUpperCase();
  if (normalizedCurrency === 'AMD') {
    return roundCatalogAmd(orderTotal);
  }
  if (normalizedCurrency === 'USD') {
    return roundCatalogAmd(convertPrice(orderTotal, 'USD', 'AMD'));
  }

  return roundCatalogAmd(orderTotal);
}
