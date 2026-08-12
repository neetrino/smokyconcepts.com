export type ArcaBank = 'idbank' | 'inecobank' | 'ameriabank';

/** Classic ArCa numeric ISO 4217 codes. */
export type ArcaCurrencyCode = '051' | '840' | '978' | '643';

/** Ameria VPOS expects alphabetic currency codes. */
export type AmeriaCurrencyCode = 'AMD' | 'EUR' | 'USD' | 'RUB';

export type PaymentGatewayCurrency = ArcaCurrencyCode | AmeriaCurrencyCode;

export type ArcaRegisterOrderRequest = {
  orderNumber: string;
  amount: number;
  currency: PaymentGatewayCurrency;
  returnUrl: string;
  description: string;
  language: 'hy' | 'en' | 'ru';
};

export type ArcaRegisterOrderResponse = {
  errorCode: number | string;
  errorMessage?: string;
  orderId?: string;
  formUrl?: string;
  /** Ameria numeric OrderID (test-range mapped); classic ArCa omits this. */
  gatewayOrderId?: number;
};

export type ArcaPaymentAmountInfo = {
  paymentState?: string | number;
};

export type ArcaOrderStatusResponse = {
  errorCode: number | string;
  errorMessage?: string;
  orderStatus?: number | string;
  actionCode?: number | string;
  paymentAmountInfo?: ArcaPaymentAmountInfo;
  amount?: number;
  depositedAmount?: number;
};

export type ArcaMutationResponse = {
  errorCode: number | string;
  errorMessage?: string;
};
