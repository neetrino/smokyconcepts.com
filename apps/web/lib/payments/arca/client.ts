import {
  isAmeriaDuplicateOrderIdError,
  loadUsedAmeriaGatewayOrderIds,
  resolveAmeriaOrderId,
} from './ameria-order-id';
import { getArcaConfig } from './config';
import { resolvePaymentCurrencyForBank } from './currency';
import { postAmeriaJson, postArcaForm } from './http';
import { resolveAmeriaDetailsCode } from './response-codes';
import type {
  ArcaOrderStatusResponse,
  ArcaRegisterOrderRequest,
  ArcaRegisterOrderResponse,
} from './types';
import { logger } from '@/lib/utils/logger';

export {
  isArcaStatusAlreadyReversed,
  isArcaStatusFailed,
  isArcaStatusPaid,
} from './status-checks';
export { cancelArcaPayment, refundArcaPayment, reverseOrRefundArcaPayment } from './reverse-refund';

const AMERIA_INIT_MAX_ATTEMPTS = 8;

type AmeriaInitPaymentResponse = {
  PaymentID?: string;
  paymentID?: string;
  ResponseCode?: number | string;
  responseCode?: number | string;
  ResponseMessage?: string;
  responseMessage?: string;
};

type AmeriaPaymentDetailsResponse = {
  ResponseCode?: number | string;
  responseCode?: number | string;
  ResponseMessage?: string;
  responseMessage?: string;
  OrderStatus?: number | string;
  orderStatus?: number | string;
  PaymentState?: number | string;
  paymentState?: number | string;
  Amount?: number | string;
  amount?: number | string;
  DepositedAmount?: number | string;
  depositedAmount?: number | string;
};

function isAmeriaInitSuccess(code: number | string | undefined): boolean {
  return String(code ?? '').trim() === '1';
}

function resolveAmeriaPaymentId(response: AmeriaInitPaymentResponse): string {
  const paymentId = response.PaymentID ?? response.paymentID ?? '';
  return paymentId.trim();
}

function parseOptionalAmount(value: number | string | undefined): number | undefined {
  if (value == null) {
    return undefined;
  }
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value).trim());
  return Number.isFinite(parsed) ? parsed : undefined;
}

async function registerAmeriaOrder(
  request: ArcaRegisterOrderRequest,
): Promise<ArcaRegisterOrderResponse> {
  const config = getArcaConfig();
  const currency = resolvePaymentCurrencyForBank(config.bank, request.currency);
  const usedIds = await loadUsedAmeriaGatewayOrderIds();
  let lastErrorCode: number | string = -1;
  let lastErrorMessage = 'Ameria InitPayment returned an error';

  for (let attempt = 0; attempt < AMERIA_INIT_MAX_ATTEMPTS; attempt += 1) {
    const ameriaOrderId = resolveAmeriaOrderId(request.orderNumber, attempt, usedIds);
    usedIds.add(ameriaOrderId);

    const response = await postAmeriaJson<AmeriaInitPaymentResponse>('/api/VPOS/InitPayment', {
      ClientID: config.clientId ?? '',
      Username: config.username,
      Password: config.password,
      OrderID: ameriaOrderId,
      Amount: request.amount,
      Currency: currency,
      Description: request.description,
      BackURL: request.returnUrl,
      Opaque: request.orderNumber,
      lang: request.language,
      Timeout: 1200,
    });

    const responseCode = response.ResponseCode ?? response.responseCode;
    const responseMessage = response.ResponseMessage ?? response.responseMessage;
    const paymentId = resolveAmeriaPaymentId(response);

    if (isAmeriaInitSuccess(responseCode) && paymentId) {
      const formUrl = `${config.baseUrl}/Payments/Pay?id=${encodeURIComponent(paymentId)}&lang=${request.language}`;
      return {
        errorCode: 0,
        orderId: paymentId,
        formUrl,
        gatewayOrderId: ameriaOrderId,
      };
    }

    lastErrorCode = responseCode ?? -1;
    lastErrorMessage = responseMessage ?? 'Ameria InitPayment returned an error';

    const canRetry =
      attempt < AMERIA_INIT_MAX_ATTEMPTS - 1 &&
      isAmeriaDuplicateOrderIdError(responseCode, responseMessage);
    if (!canRetry) {
      break;
    }

    logger.warn('Ameria InitPayment duplicate OrderID, retrying', {
      shopOrderNumber: request.orderNumber,
      ameriaOrderId,
      attempt: attempt + 1,
      responseCode,
      responseMessage,
    });
  }

  return {
    errorCode: lastErrorCode,
    errorMessage: lastErrorMessage,
  };
}

export async function registerArcaOrder(
  request: ArcaRegisterOrderRequest,
): Promise<ArcaRegisterOrderResponse> {
  const config = getArcaConfig();
  if (config.bank === 'ameriabank') {
    return registerAmeriaOrder(request);
  }

  return postArcaForm<ArcaRegisterOrderResponse>('register.do', {
    userName: config.username,
    password: config.password,
    orderNumber: request.orderNumber,
    amount: String(request.amount),
    currency: request.currency,
    returnUrl: request.returnUrl,
    description: request.description,
    language: request.language,
    pageView: 'DESKTOP',
    jsonParams: '{"FORCE_3DS2":"true"}',
  });
}

export async function getArcaOrderStatus(orderId: string): Promise<ArcaOrderStatusResponse> {
  const config = getArcaConfig();
  if (config.bank === 'ameriabank') {
    const response = await postAmeriaJson<AmeriaPaymentDetailsResponse>('/api/VPOS/GetPaymentDetails', {
      PaymentID: orderId,
      Username: config.username,
      Password: config.password,
    });
    const paymentState = response.PaymentState ?? response.paymentState;
    return {
      errorCode: resolveAmeriaDetailsCode(response.ResponseCode ?? response.responseCode),
      errorMessage: response.ResponseMessage ?? response.responseMessage,
      orderStatus: response.OrderStatus ?? response.orderStatus,
      amount: parseOptionalAmount(response.Amount ?? response.amount),
      depositedAmount: parseOptionalAmount(response.DepositedAmount ?? response.depositedAmount),
      paymentAmountInfo: {
        paymentState: paymentState == null ? undefined : String(paymentState),
      },
    };
  }

  return postArcaForm<ArcaOrderStatusResponse>('getOrderStatusExtended.do', {
    userName: config.username,
    password: config.password,
    orderId,
  });
}
