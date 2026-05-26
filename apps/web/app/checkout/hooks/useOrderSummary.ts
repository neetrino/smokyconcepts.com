import { useMemo } from 'react';
import { adminInputAmdToUsd, amountToUsd, type CurrencyCode } from '../../../lib/currency';
import {
  buildCheckoutSummaryLinesFromCart,
  computeOrderSummaryDisplay,
  type OrderSummaryDisplayAmounts,
} from '@/lib/orders/order-summary-display';
import { useSizeCatalogPriceByTitle } from '@/lib/size-catalog/use-size-catalog-price-by-title';
import { getCartLineCollectionUnitUsd } from '../../cart/cart-line-pricing';
import type { Cart } from '../types';
import { getCartMerchandiseSubtotalUsd } from '../utils/getCartBaseSubtotalUsd';

interface UseOrderSummaryProps {
  cart: Cart | null;
  shippingMethod: 'pickup' | 'delivery';
  deliveryPrice: number | null;
  couponDiscountUsd: number;
}

export type CheckoutOrderSummaryResult = {
  summary: OrderSummaryDisplayAmounts;
  shippingPriceAmd: number | null;
};

export function useOrderSummary({
  cart,
  shippingMethod,
  deliveryPrice,
  couponDiscountUsd,
}: UseOrderSummaryProps) {
  const categoryPriceByTitle = useSizeCatalogPriceByTitle();

  const orderSummary = useMemo((): CheckoutOrderSummaryResult => {
    const emptySummary: OrderSummaryDisplayAmounts = {
      merchandiseUsd: 0,
      collectionUsd: 0,
      discountUsd: 0,
      shippingUsd: 0,
      taxUsd: 0,
      totalUsd: 0,
      merchandiseAmd: null,
      collectionAmd: null,
      totalAmd: null,
      hasCollection: false,
    };

    if (!cart || cart.items.length === 0) {
      return { summary: emptySummary, shippingPriceAmd: null };
    }

    const cartMoneyCurrency = cart.totals.currency?.trim() || 'USD';
    const discountUsd = amountToUsd(cart.totals.discount, cartMoneyCurrency);
    const taxUsd = amountToUsd(cart.totals.tax, cartMoneyCurrency);
    const shippingPriceAmd =
      shippingMethod === 'delivery' && deliveryPrice !== null ? Math.round(deliveryPrice) : null;
    const shippingUsd =
      shippingPriceAmd != null && shippingPriceAmd > 0 ? adminInputAmdToUsd(shippingPriceAmd) : 0;
    const collectionPriceUsd = cart.items.reduce(
      (sum, item) => sum + getCartLineCollectionUnitUsd(item, categoryPriceByTitle) * item.quantity,
      0
    );
    const merchandiseUsd = getCartMerchandiseSubtotalUsd(cart) ?? 0;
    const couponUsd = Math.max(0, couponDiscountUsd);
    const combinedDiscountUsd = discountUsd + couponUsd;
    const totalUsd =
      merchandiseUsd + collectionPriceUsd - combinedDiscountUsd + taxUsd + shippingUsd;

    const summaryLines = buildCheckoutSummaryLinesFromCart(cart.items, categoryPriceByTitle);
    const summary = computeOrderSummaryDisplay(
      {
        subtotal: merchandiseUsd + collectionPriceUsd,
        discount: combinedDiscountUsd,
        shipping: shippingUsd,
        tax: taxUsd,
        total: totalUsd,
        currency: 'USD',
      },
      collectionPriceUsd,
      'AMD' satisfies CurrencyCode,
      summaryLines,
      {
        amountsAlreadyUsd: true,
        shippingPriceAmd,
      }
    );

    return { summary, shippingPriceAmd };
  }, [cart, shippingMethod, deliveryPrice, couponDiscountUsd, categoryPriceByTitle]);

  return { orderSummary };
}
