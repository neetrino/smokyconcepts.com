'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import { useCurrencyRatesReady } from '../../../../components/hooks/useCurrency';
import { Card } from '@shop/ui';
import { ADMIN_PRICE_CURRENCY, type CurrencyCode } from '../../../../lib/currency';
import {
  computeOrderSummaryDisplay,
  formatOrderCollectionDisplay,
  formatOrderMerchandiseDisplay,
  formatOrderShippingDisplay,
  formatOrderSummaryUsd,
  formatOrderTotalDisplay,
} from '@/lib/orders/order-summary-display';
import type { OrderDetails } from '../useOrders';

interface OrderDetailsTotalsProps {
  orderDetails: OrderDetails;
  currency: string;
  formatCurrency: (amount: number, orderCurrency?: string, storedCurrency?: string) => string;
}

export function OrderDetailsTotals({
  orderDetails,
  currency: _currency,
  formatCurrency: _formatCurrency,
}: OrderDetailsTotalsProps) {
  const { t } = useTranslation();
  useCurrencyRatesReady();

  if (!orderDetails.totals) {
    return null;
  }

  const displayCurrency = ADMIN_PRICE_CURRENCY as CurrencyCode;
  const summaryLines = (orderDetails.items ?? []).map((item) => ({
    price: item.unitPrice ?? (item.quantity > 0 ? item.total / item.quantity : item.total),
    quantity: item.quantity,
    sizeCatalogCategoryPriceAmd: item.sizeCatalogCategoryPriceAmd,
    variantBasePriceAmd: item.variantBasePriceAmd,
  }));

  const summary = computeOrderSummaryDisplay(
    orderDetails.totals,
    orderDetails.collectionPriceAmount,
    displayCurrency,
    summaryLines,
    {
      amountsAlreadyUsd: true,
      shippingPriceAmd: orderDetails.shippingPriceAmd,
    }
  );

  return (
    <Card className="p-4 md:p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('orders.orderSummary.title')}</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-gray-700">
          <span>{t('orders.orderSummary.subtotal')}</span>
          <span>{formatOrderMerchandiseDisplay(summary, displayCurrency)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-700">
          <span>{t('orders.orderSummary.shipping')}</span>
          <span>
            {orderDetails.shippingMethod === 'pickup'
              ? t('checkout.shipping.freePickup')
              : formatOrderShippingDisplay(
                  summary.shippingUsd,
                  orderDetails.shippingPriceAmd,
                  displayCurrency
                ) +
                (orderDetails.shippingAddress?.city || orderDetails.shippingAddress?.state
                  ? ` (${orderDetails.shippingAddress.city || orderDetails.shippingAddress.state})`
                  : '')}
          </span>
        </div>
        {summary.hasCollection && (
          <div className="flex justify-between text-sm text-gray-700">
            <span>{t('orders.orderSummary.collectionPrice')}</span>
            <span>{formatOrderCollectionDisplay(summary, displayCurrency)}</span>
          </div>
        )}
        {orderDetails.totals.discount > 0 && (
          <div className="flex justify-between text-sm text-gray-700">
            <span>{t('orders.orderSummary.discount')}</span>
            <span>-{formatOrderSummaryUsd(summary.discountUsd, displayCurrency)}</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between text-base font-bold text-gray-900">
            <span>{t('orders.orderSummary.total')}</span>
            <span>{formatOrderTotalDisplay(summary, displayCurrency)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
