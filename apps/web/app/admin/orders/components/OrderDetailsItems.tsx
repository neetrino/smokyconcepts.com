'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import { Card } from '@shop/ui';
import {
  ADMIN_PRICE_CURRENCY,
  adminInputAmdToUsd,
  formatCatalogPrice,
  type CurrencyCode,
} from '../../../../lib/currency';
import { formatOrderSummaryUsd } from '@/lib/orders/order-summary-display';
import { isInternalVariantAttributeKey } from '@/lib/default-pricing-variant';
import { getColorValue } from '../utils/orderUtils';
import type { OrderDetails } from '../useOrders';

interface OrderDetailsItemsProps {
  orderDetails: OrderDetails;
  formatCurrency: (amount: number, orderCurrency?: string, storedCurrency?: string) => string;
}

/** Admin API returns item unitPrice/total already in USD. */
function resolveItemLineDisplay(params: {
  unitPriceUsd: number;
  lineTotalUsd: number;
  quantity: number;
  variantBasePriceAmd: number | null | undefined;
  sizeCatalogCategoryPriceAmd: number | null | undefined;
  displayCurrency: CurrencyCode;
}): { unitDisplay: string; lineTotalDisplay: string } {
  const collectionAmd =
    typeof params.sizeCatalogCategoryPriceAmd === 'number' &&
    Number.isFinite(params.sizeCatalogCategoryPriceAmd) &&
    params.sizeCatalogCategoryPriceAmd > 0
      ? Math.round(params.sizeCatalogCategoryPriceAmd)
      : 0;
  const variantBaseAmd =
    typeof params.variantBasePriceAmd === 'number' &&
    Number.isFinite(params.variantBasePriceAmd) &&
    params.variantBasePriceAmd > 0
      ? Math.round(params.variantBasePriceAmd)
      : null;

  const qty = Math.max(1, params.quantity);
  const useAmdSnapshots = params.displayCurrency === 'AMD' && variantBaseAmd != null;
  if (useAmdSnapshots) {
    return {
      unitDisplay: formatCatalogPrice(variantBaseAmd, 'AMD'),
      lineTotalDisplay: formatCatalogPrice((variantBaseAmd + collectionAmd) * qty, 'AMD'),
    };
  }

  const collectionUnitUsd = collectionAmd > 0 ? adminInputAmdToUsd(collectionAmd) : 0;
  const baseUnitUsd = Math.max(0, params.unitPriceUsd - collectionUnitUsd);
  return {
    unitDisplay: formatOrderSummaryUsd(baseUnitUsd, params.displayCurrency),
    lineTotalDisplay: formatOrderSummaryUsd(params.lineTotalUsd, params.displayCurrency),
  };
}

export function OrderDetailsItems({
  orderDetails,
  formatCurrency: _formatCurrency,
}: OrderDetailsItemsProps) {
  const { t } = useTranslation();
  const displayCurrency = ADMIN_PRICE_CURRENCY as CurrencyCode;

  const getColorsArray = (colors: unknown): string[] => {
    if (!colors) return [];
    if (Array.isArray(colors)) return colors;
    if (typeof colors === 'string') {
      try {
        const parsed = JSON.parse(colors);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  if (!Array.isArray(orderDetails.items) || orderDetails.items.length === 0) {
    return (
      <Card className="p-4 md:p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('admin.orders.orderDetails.items')}</h3>
        <div className="text-sm text-gray-500">{t('admin.orders.orderDetails.noItemsFound')}</div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('admin.orders.orderDetails.items')}</h3>
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-500">{t('admin.orders.orderDetails.product')}</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">{t('admin.orders.orderDetails.sku')}</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">{t('admin.orders.orderDetails.colorSize')}</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">{t('admin.orders.orderDetails.qty')}</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">{t('admin.orders.orderDetails.price')}</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">{t('admin.orders.orderDetails.totalCol')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {orderDetails.items.map((item) => {
              const allOptions = (item.variantOptions || []).filter(
                (opt) => !isInternalVariantAttributeKey(opt.attributeKey),
              );
              const quantity = Number(item.quantity ?? 0);
              const unitPriceUsd = Number(item.unitPrice ?? 0);
              const lineTotalUsd = Number(item.total ?? 0);
              const { unitDisplay, lineTotalDisplay } = resolveItemLineDisplay({
                unitPriceUsd: Number.isFinite(unitPriceUsd) ? unitPriceUsd : 0,
                lineTotalUsd: Number.isFinite(lineTotalUsd) ? lineTotalUsd : 0,
                quantity: Number.isFinite(quantity) ? quantity : 0,
                variantBasePriceAmd: item.variantBasePriceAmd,
                sizeCatalogCategoryPriceAmd: item.sizeCatalogCategoryPriceAmd,
                displayCurrency,
              });
              return (
                <tr key={item.id}>
                  <td className="px-3 py-2">{item.productTitle}</td>
                  <td className="px-3 py-2 text-gray-500">{item.sku}</td>
                  <td className="px-3 py-2">
                    {allOptions.length > 0 ? (
                      <div className="flex flex-wrap gap-2 items-center">
                        {allOptions.map((opt, optIndex) => {
                          if (!opt.attributeKey || !opt.value) return null;
                          const attributeKey = opt.attributeKey.toLowerCase().trim();
                          const optionValue = opt.value;
                          const isColor = attributeKey === 'color' || attributeKey === 'colour';
                          const displayLabel = opt.label || optionValue;
                          const hasImage = opt.imageUrl && opt.imageUrl.trim() !== '';
                          const colors = getColorsArray(opt.colors);
                          const primaryColor = colors[0];
                          const colorHex = primaryColor ?? (isColor ? getColorValue(optionValue) : null);
                          return (
                            <div key={optIndex} className="flex items-center gap-1.5">
                              {hasImage ? (
                                <img
                                  src={opt.imageUrl!}
                                  alt={displayLabel}
                                  className="w-4 h-4 rounded border border-gray-300 object-cover flex-shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : isColor && colorHex ? (
                                <div
                                  className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                                  style={{ backgroundColor: colorHex }}
                                  title={displayLabel}
                                />
                              ) : null}
                              <span className="text-xs text-gray-700 capitalize">{displayLabel}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {Number.isFinite(quantity) ? quantity : '—'}
                  </td>
                  <td className="px-3 py-2 text-right">{unitDisplay}</td>
                  <td className="px-3 py-2 text-right">{lineTotalDisplay}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
