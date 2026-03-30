import { useMemo } from 'react';
import { convertPrice } from '../../../lib/currency';
import type { CurrencyCode } from '../../../lib/currency';
import type { Cart } from '../types';

interface UseOrderSummaryProps {
  cart: Cart | null;
  shippingMethod: 'pickup' | 'delivery';
  deliveryPrice: number | null;
  currency: CurrencyCode;
}

export function useOrderSummary({
  cart,
  shippingMethod,
  deliveryPrice,
  currency,
}: UseOrderSummaryProps) {
  const orderSummary = useMemo(() => {
    if (!cart || cart.items.length === 0) {
      return {
        subtotalAMD: 0,
        taxAMD: 0,
        shippingAMD: 0,
        totalAMD: 0,
        subtotalDisplay: 0,
        taxDisplay: 0,
        shippingDisplay: 0,
        totalDisplay: 0,
      };
    }

    const subtotalAMD = convertPrice(cart.totals.subtotal, 'USD', 'AMD');
    const taxAMD = convertPrice(cart.totals.tax, 'USD', 'AMD');
    const shippingAMD = shippingMethod === 'delivery' && deliveryPrice !== null ? deliveryPrice : 0;
    const totalAMD = subtotalAMD + taxAMD + shippingAMD;
    
    const subtotalDisplay = convertPrice(subtotalAMD, 'AMD', currency);
    const taxDisplay = convertPrice(taxAMD, 'AMD', currency);
    const shippingDisplay = convertPrice(shippingAMD, 'AMD', currency);
    const totalDisplay = convertPrice(totalAMD, 'AMD', currency);
    
    return {
      subtotalAMD,
      taxAMD,
      shippingAMD,
      totalAMD,
      subtotalDisplay,
      taxDisplay,
      shippingDisplay,
      totalDisplay,
    };
  }, [cart, shippingMethod, deliveryPrice, currency]);

  return { orderSummary };
}




