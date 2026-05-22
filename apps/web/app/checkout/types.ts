export type { Cart, CartItem } from '../cart/types';

/** Totals passed to checkout summary UI (USD display amounts) */
export type CheckoutOrderSummaryTotals = {
  subtotalDisplay: number;
  taxDisplay: number;
  shippingDisplay: number;
  collectionPriceDisplay: number;
  couponDiscountDisplay: number;
  totalDisplay: number;
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
};
