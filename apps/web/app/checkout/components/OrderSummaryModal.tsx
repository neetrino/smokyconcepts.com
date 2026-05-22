'use client';

import { useCurrency } from '../../../components/hooks/useCurrency';
import { useTranslation } from '../../../lib/i18n-client';
import { convertPrice, formatPriceInCurrency } from '../../../lib/currency';
import type { Cart, CheckoutOrderSummaryTotals } from '../types';

interface OrderSummaryModalProps {
  cart: Cart | null;
  orderSummary: CheckoutOrderSummaryTotals;
  shippingMethod: 'pickup' | 'delivery';
  loadingDeliveryPrice: boolean;
  deliveryPrice: number | null;
}

export function OrderSummaryModal({
  cart,
  orderSummary,
  shippingMethod,
  loadingDeliveryPrice,
  deliveryPrice,
}: OrderSummaryModalProps) {
  const { t } = useTranslation();
  const displayCurrency = useCurrency();
  const formatCheckoutUsd = (amountUsd: number) =>
    formatPriceInCurrency(convertPrice(amountUsd, 'USD', displayCurrency), displayCurrency);

  if (!cart) {
    return null;
  }

  const shippingDisplay = shippingMethod === 'pickup' 
    ? t('checkout.shipping.freePickup')
    : loadingDeliveryPrice
      ? t('checkout.shipping.loading')
      : deliveryPrice !== null
        ? formatCheckoutUsd(orderSummary.shippingDisplay)
        : t('checkout.shipping.enterRegion');

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{t('checkout.summary.items')}:</span>
        <span className="font-medium">{cart.itemsCount}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{t('checkout.summary.subtotal')}:</span>
        <span className="font-medium">{formatCheckoutUsd(orderSummary.subtotalDisplay)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{t('checkout.summary.shipping')}:</span>
        <span className="font-medium">{shippingDisplay}</span>
      </div>
      {orderSummary.collectionPriceDisplay > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('checkout.summary.collectionPrice')}:</span>
          <span className="font-medium">{formatCheckoutUsd(orderSummary.collectionPriceDisplay)}</span>
        </div>
      )}
      {orderSummary.couponDiscountDisplay > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-emerald-700">{t('checkout.summary.couponDiscount')}:</span>
          <span className="font-medium text-emerald-700">
            -{formatCheckoutUsd(orderSummary.couponDiscountDisplay)}
          </span>
        </div>
      )}
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{t('checkout.summary.tax')}:</span>
        <span className="font-medium">{formatCheckoutUsd(orderSummary.taxDisplay)}</span>
      </div>
      <div className="border-t border-gray-200 pt-2 mt-2">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-900">{t('checkout.summary.total')}:</span>
          <span className="font-bold text-gray-900">
            {formatCheckoutUsd(orderSummary.totalDisplay)}
          </span>
        </div>
      </div>
    </div>
  );
}

