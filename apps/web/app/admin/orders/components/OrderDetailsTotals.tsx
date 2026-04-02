'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import { Card } from '@shop/ui';
import { amountToUsd, formatPriceInCurrency, formatStoredMoney } from '../../../../lib/currency';
import type { OrderDetails } from '../useOrders';

interface OrderDetailsTotalsProps {
  orderDetails: OrderDetails;
  currency: string;
  formatCurrency: (amount: number, orderCurrency?: string, storedCurrency?: string) => string;
}

export function OrderDetailsTotals({
  orderDetails,
  currency: _currency,
  formatCurrency,
}: OrderDetailsTotalsProps) {
  const { t } = useTranslation();

  if (!orderDetails.totals) {
    return null;
  }

  const storedTotalsCurrency = orderDetails.totals.currency || 'USD';

  return (
    <Card className="p-4 md:p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('orders.orderSummary.title')}</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-gray-700">
          <span>{t('orders.orderSummary.subtotal')}</span>
          <span>{formatCurrency(orderDetails.totals.subtotal, 'USD', storedTotalsCurrency)}</span>
        </div>
        {orderDetails.totals.discount > 0 && (
          <div className="flex justify-between text-sm text-gray-700">
            <span>{t('orders.orderSummary.discount')}</span>
            <span>-{formatCurrency(orderDetails.totals.discount, 'USD', storedTotalsCurrency)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-gray-700">
          <span>{t('orders.orderSummary.shipping')}</span>
          <span>
            {orderDetails.shippingMethod === 'pickup'
              ? t('checkout.shipping.freePickup')
              : formatStoredMoney(orderDetails.totals.shipping, storedTotalsCurrency) +
                (orderDetails.shippingAddress?.city ? ` (${orderDetails.shippingAddress.city})` : '')}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-700">
          <span>{t('orders.orderSummary.tax')}</span>
          <span>{formatCurrency(orderDetails.totals.tax, 'USD', storedTotalsCurrency)}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between text-base font-bold text-gray-900">
            <span>{t('orders.orderSummary.total')}</span>
            <span>
              {(() => {
                const subtotalUsd = amountToUsd(orderDetails.totals.subtotal, orderDetails.totals.currency);
                const discountUsd = amountToUsd(orderDetails.totals.discount, orderDetails.totals.currency);
                const shippingUsd = amountToUsd(orderDetails.totals.shipping, storedTotalsCurrency);
                const taxUsd = amountToUsd(orderDetails.totals.tax, orderDetails.totals.currency);
                const totalUsd = subtotalUsd - discountUsd + shippingUsd + taxUsd;
                return formatPriceInCurrency(totalUsd, 'USD');
              })()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
