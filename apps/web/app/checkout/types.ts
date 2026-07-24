export type { Cart, CartItem } from '../cart/types';

import type { OrderSummaryDisplayAmounts } from '@/lib/orders/order-summary-display';

/** Checkout summary — shared breakdown with order detail page (AMD component sum when in dram). */
export type CheckoutOrderSummaryTotals = {
  summary: OrderSummaryDisplayAmounts;
  shippingPriceAmd: number | null;
};

export type CheckoutFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  shippingMethod: 'pickup' | 'delivery';
  paymentMethod: 'idram' | 'arca' | 'cash_on_delivery';
  shippingAddress?: string;
  /** Delivery country label (filters available regions) */
  shippingCountry?: string;
  /** Admin delivery location id (order stores region label in shippingAddress.state) */
  shippingRegion?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardHolderName?: string;
  acceptedPrivacyPolicy: boolean;
};
