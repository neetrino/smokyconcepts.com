'use client';

import Link from 'next/link';
import { Card, Button } from '@shop/ui';
import { useCurrency } from '../../../../components/hooks/useCurrency';
import { dispatchCartDrawerOpen } from '../../../cart/constants';
import { useTranslation } from '../../../../lib/i18n-client';
import { type CurrencyCode } from '../../../../lib/currency';
import {
  computeOrderSummaryDisplay,
  formatOrderCollectionDisplay,
  formatOrderDiscountDisplay,
  formatOrderMerchandiseDisplay,
  formatOrderShippingDisplay,
  formatOrderTotalDisplay,
} from '@/lib/orders/order-summary-display';
import type { Order } from '../types';

interface OrderSummaryProps {
  order: Order;
  /** Hide storefront CTAs when embedded (e.g. profile order modal). */
  showActions?: boolean;
}

export function OrderSummary({ order, showActions = true }: OrderSummaryProps) {
  const { t } = useTranslation();
  const displayCurrency = useCurrency() as CurrencyCode;

  const totals = order.totals;
  const summaryLines = order.items.map((item) => ({
    price: item.price,
    quantity: item.quantity,
    sizeCatalogCategoryPriceAmd: item.sizeCatalogCategoryPriceAmd,
    variantBasePriceAmd: item.variantBasePriceAmd,
  }));

  const summary =
    totals != null
      ? computeOrderSummaryDisplay(
          totals,
          order.collectionPriceAmount,
          displayCurrency,
          summaryLines,
          {
            amountsAlreadyUsd: true,
            shippingPriceAmd: order.shippingPriceAmd,
          }
        )
      : null;

  const shippingDisplay =
    order.shippingMethod === 'pickup'
      ? t('checkout.shipping.freePickup')
      : summary != null
        ? formatOrderShippingDisplay(
            summary.shippingUsd,
            order.shippingPriceAmd,
            displayCurrency
          ) +
          (order.shippingAddress?.city || order.shippingAddress?.state
            ? ` (${order.shippingAddress.city || order.shippingAddress.state})`
            : '')
        : '';

  return (
    <Card className="p-6 sticky top-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('orders.orderSummary.title')}</h2>
      <div className="space-y-4 mb-6">
        {summary != null && totals != null ? (
          <>
            <div className="flex justify-between text-gray-600">
              <span>{t('orders.orderSummary.subtotal')}</span>
              <span>{formatOrderMerchandiseDisplay(summary, displayCurrency)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t('orders.orderSummary.shipping')}</span>
              <span>{shippingDisplay}</span>
            </div>
            {summary.hasCollection && (
              <div className="flex justify-between text-gray-600">
                <span>{t('orders.orderSummary.collectionPrice')}</span>
                <span>{formatOrderCollectionDisplay(summary, displayCurrency)}</span>
              </div>
            )}
            {totals.discount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>{t('orders.orderSummary.discount')}</span>
                <span>-{formatOrderDiscountDisplay(summary, displayCurrency)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>{t('orders.orderSummary.total')}</span>
                <span>{formatOrderTotalDisplay(summary, displayCurrency)}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-gray-600">{t('orders.orderSummary.loadingTotals')}</div>
        )}
      </div>

      {showActions ? (
        <div className="space-y-3">
          <Link href="/products">
            <Button variant="gold" className="w-full">
              {t('orders.buttons.continueShopping')}
            </Button>
          </Link>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => dispatchCartDrawerOpen()}
          >
            {t('orders.buttons.viewCart')}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
