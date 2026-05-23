import { useMemo } from 'react';
import { adminInputAmdToUsd, amountToUsd } from '../../../lib/currency';
import type { Cart } from '../types';
import { getCartMerchandiseSubtotalUsd } from '../utils/getCartBaseSubtotalUsd';

interface UseOrderSummaryProps {
  cart: Cart | null;
  shippingMethod: 'pickup' | 'delivery';
  deliveryPrice: number | null;
  couponDiscountUsd: number;
}

export function useOrderSummary({
  cart,
  shippingMethod,
  deliveryPrice,
  couponDiscountUsd,
}: UseOrderSummaryProps) {
  const orderSummary = useMemo(() => {
    if (!cart || cart.items.length === 0) {
      return {
        subtotalUsd: 0,
        taxUsd: 0,
        shippingUsd: 0,
        collectionPriceUsd: 0,
        totalUsd: 0,
        subtotalDisplay: 0,
        taxDisplay: 0,
        shippingDisplay: 0,
        collectionPriceDisplay: 0,
        couponDiscountDisplay: 0,
        totalDisplay: 0,
      };
    }

    const cartMoneyCurrency = cart.totals.currency?.trim() || 'USD';
    const discountUsd = amountToUsd(cart.totals.discount, cartMoneyCurrency);
    const taxUsd = amountToUsd(cart.totals.tax, cartMoneyCurrency);
    const shippingUsd =
      shippingMethod === 'delivery' && deliveryPrice !== null ? adminInputAmdToUsd(deliveryPrice) : 0;
    const collectionPriceUsd = cart.items.reduce((sum, item) => {
      const priceAmd = item.variant.sizeCatalogCategoryPriceAmd;
      if (typeof priceAmd !== 'number' || priceAmd <= 0) {
        return sum;
      }
      return sum + adminInputAmdToUsd(priceAmd) * item.quantity;
    }, 0);
    const merchandiseUsd = getCartMerchandiseSubtotalUsd(cart) ?? 0;
    const couponUsd = Math.max(0, couponDiscountUsd);
    const totalUsd =
      merchandiseUsd +
      collectionPriceUsd -
      discountUsd -
      couponUsd +
      taxUsd +
      shippingUsd;

    return {
      subtotalUsd: merchandiseUsd,
      taxUsd,
      shippingUsd,
      collectionPriceUsd,
      totalUsd,
      subtotalDisplay: merchandiseUsd,
      taxDisplay: taxUsd,
      shippingDisplay: shippingUsd,
      collectionPriceDisplay: collectionPriceUsd,
      couponDiscountDisplay: couponUsd,
      totalDisplay: totalUsd,
    };
  }, [cart, shippingMethod, deliveryPrice, couponDiscountUsd]);

  return { orderSummary };
}
