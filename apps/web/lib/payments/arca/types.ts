export type ArcaBank = 'idbank' | 'inecobank' | 'ameriabank';

export type ArcaCurrencyCode = '051' | '840' | '978' | '643';

export type ArcaRegisterOrderRequest = {
  orderNumber: string;
  amount: number;
  currency: ArcaCurrencyCode;
  returnUrl: string;
  description: string;
  language: 'hy' | 'en' | 'ru';
};

export type ArcaRegisterOrderResponse = {
  errorCode: number | string;
  errorMessage?: string;
  orderId?: string;
  formUrl?: string;
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
};
