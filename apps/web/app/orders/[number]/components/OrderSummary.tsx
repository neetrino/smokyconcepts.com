'use client';

import Link from 'next/link';
import { Card, Button } from '@shop/ui';
import { useTranslation } from '../../../../lib/i18n-client';
import { amountToUsd, catalogPriceToUsd, formatPriceInCurrency } from '../../../../lib/currency';
import type { Order } from '../types';

interface OrderSummaryProps {
  order: Order;
  calculatedShipping: number | null;
  loadingShipping: boolean;
}

export function OrderSummary({
  order,
  calculatedShipping,
  loadingShipping,
}: OrderSummaryProps) {
  const { t } = useTranslation();
  const storedCurrency = order.totals.currency;

  const subtotalUsd = amountToUsd(order.totals.subtotal, storedCurrency);

  const discountUsd =
    order.totals.discount > 0 ? amountToUsd(order.totals.discount, storedCurrency) : 0;

  const shippingUsd =
    order.shippingMethod === 'pickup'
      ? 0
      : calculatedShipping !== null
        ? catalogPriceToUsd(calculatedShipping)
        : amountToUsd(order.totals.shipping, storedCurrency);

  const taxUsd = amountToUsd(order.totals.tax, storedCurrency);

  const totalUsd = subtotalUsd - discountUsd + shippingUsd + taxUsd;

  const shippingDisplay =
    order.shippingMethod === 'pickup'
      ? t('checkout.shipping.freePickup')
      : loadingShipping
        ? t('checkout.shipping.loading')
        : formatPriceInCurrency(shippingUsd, 'USD') +
          (order.shippingAddress?.city ? ` (${order.shippingAddress.city})` : '');

  return (
    <Card className="p-6 sticky top-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('orders.orderSummary.title')}</h2>
      <div className="space-y-4 mb-6">
        {order.totals ? (
          <>
            <div className="flex justify-between text-gray-600">
              <span>{t('orders.orderSummary.subtotal')}</span>
              <span>{formatPriceInCurrency(subtotalUsd, 'USD')}</span>
            </div>
            {order.totals.discount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>{t('orders.orderSummary.discount')}</span>
                <span>-{formatPriceInCurrency(discountUsd, 'USD')}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>{t('orders.orderSummary.shipping')}</span>
              <span>{shippingDisplay}</span>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>{t('orders.orderSummary.total')}</span>
                <span>{formatPriceInCurrency(totalUsd, 'USD')}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-gray-600">{t('orders.orderSummary.loadingTotals')}</div>
        )}
      </div>

      <div className="space-y-3">
        <Link href="/products">
          <Button variant="gold" className="w-full">
            {t('orders.buttons.continueShopping')}
          </Button>
        </Link>
        <Link href="/cart">
          <Button variant="ghost" className="w-full">
            {t('orders.buttons.viewCart')}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
