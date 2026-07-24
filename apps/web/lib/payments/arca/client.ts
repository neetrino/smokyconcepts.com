import type {
  ArcaOrderStatusResponse,
  ArcaRegisterOrderRequest,
  ArcaRegisterOrderResponse,
} from './types';
import { getArcaConfig } from './config';

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
};

function normalizeArcaErrorCode(errorCode: number | string | undefined): number {
  const raw = String(errorCode ?? '').trim();
  if (!raw) {
    return -1;
  }
  if (raw === '0' || raw === '00' || raw.startsWith('00')) {
    return 0;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? -1 : parsed;
}

function normalizeArcaOrderStatus(status: number | string | undefined): number {
  const parsed = Number.parseInt(String(status ?? ''), 10);
  return Number.isNaN(parsed) ? -1 : parsed;
}

async function postArcaForm<TResponse>(
  endpoint: string,
  payload: Record<string, string>,
): Promise<TResponse> {
  const config = getArcaConfig();
  const body = new URLSearchParams(payload);
  const response = await fetch(`${config.baseUrl}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Arca API request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

async function postAmeriaJson<TResponse>(
  endpoint: string,
  payload: Record<string, string | number>,
): Promise<TResponse> {
  const config = getArcaConfig();
  const response = await fetch(`${config.baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Ameria API request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

function normalizeAmeriaOrderId(orderNumber: string): number {
  const numericOrder = Number.parseInt(orderNumber, 10);
  if (Number.isInteger(numericOrder) && numericOrder > 0) {
    return numericOrder;
  }

  let hash = 0;
  for (const char of orderNumber) {
    hash = (hash * 31 + char.charCodeAt(0)) % 1_000_000_000;
  }
  return Math.max(1, hash);
}

function isAmeriaInitSuccess(code: number | string | undefined): boolean {
  const normalized = String(code ?? '').trim();
  return normalized === '1';
}

function resolveAmeriaDetailsCode(code: number | string | undefined): number | string {
  const normalized = String(code ?? '').trim();
  if (!normalized) {
    return -1;
  }
  // Ameria VPOS responses commonly use `1` as success in both InitPayment and details APIs.
  // Normalize to `0` so shared ArCa status checks can treat it as non-error.
  if (normalized === '1') {
    return 0;
  }
  if (normalized === '0' || normalized === '00' || normalized.startsWith('00')) {
    return 0;
  }
  const numericCode = Number.parseInt(normalized, 10);
  return Number.isNaN(numericCode) ? normalized : numericCode;
}

function resolveAmeriaPaymentId(response: AmeriaInitPaymentResponse): string {
  const paymentId = response.PaymentID ?? response.paymentID ?? '';
  return paymentId.trim();
}

export async function registerArcaOrder(
  request: ArcaRegisterOrderRequest,
): Promise<ArcaRegisterOrderResponse> {
  const config = getArcaConfig();
  if (config.bank === 'ameriabank') {
    const response = await postAmeriaJson<AmeriaInitPaymentResponse>('/api/VPOS/InitPayment', {
      ClientID: config.clientId ?? '',
      Username: config.username,
      Password: config.password,
      OrderID: normalizeAmeriaOrderId(request.orderNumber),
      Amount: request.amount,
      Currency: request.currency,
      Description: request.description,
      BackURL: request.returnUrl,
      Opaque: request.orderNumber,
      lang: request.language,
      Timeout: 1200,
    });
    const paymentId = resolveAmeriaPaymentId(response);
    if (isAmeriaInitSuccess(response.ResponseCode ?? response.responseCode) && paymentId) {
      const formUrl = `${config.baseUrl}/Payments/Pay?id=${encodeURIComponent(paymentId)}&lang=${request.language}`;
      return {
        errorCode: 0,
        orderId: paymentId,
        formUrl,
      };
    }
    return {
      errorCode: response.ResponseCode ?? response.responseCode ?? -1,
      errorMessage:
        response.ResponseMessage ?? response.responseMessage ?? 'Ameria InitPayment returned an error',
    };
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

export function isArcaStatusPaid(status: ArcaOrderStatusResponse): boolean {
  const errorCode = normalizeArcaErrorCode(status.errorCode);
  if (errorCode !== 0) {
    return false;
  }

  const paymentStateRaw =
    status.paymentAmountInfo?.paymentState ??
    (status as ArcaOrderStatusResponse & { paymentState?: string | number }).paymentState;
  const paymentState = String(paymentStateRaw ?? '').trim().toUpperCase();
  if (
    paymentState === 'DEPOSITED' ||
    paymentState === 'PAYMENT_DEPOSITED' ||
    paymentState === 'SUCCESSFUL' ||
    paymentState === '2' ||
    paymentState === '4'
  ) {
    return true;
  }

  const orderStatus = normalizeArcaOrderStatus(status.orderStatus);
  return orderStatus === 2 || orderStatus === 4;
}
