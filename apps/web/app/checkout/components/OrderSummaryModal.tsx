'use client';

import { useTranslation } from '../../../lib/i18n-client';
import type { Cart, CheckoutOrderSummaryTotals } from '../types';
import { CheckoutSummaryBreakdown } from './CheckoutSummaryBreakdown';

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
}: OrderSummaryModalProps) {
  const { t } = useTranslation();

  if (!cart) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{t('checkout.summary.items')}:</span>
        <span className="font-medium">{cart.itemsCount}</span>
      </div>
      <CheckoutSummaryBreakdown
        orderSummary={orderSummary}
        shippingMethod={shippingMethod}
        loadingDeliveryPrice={loadingDeliveryPrice}
        textSizeClass="text-sm text-gray-600"
        totalTextClass="font-semibold text-gray-900"
      />
    </div>
  );
}
