import type {
  ArcaOrderStatusResponse,
  ArcaRegisterOrderRequest,
  ArcaRegisterOrderResponse,
} from './types';
import { getArcaConfig } from './config';

function normalizeArcaErrorCode(errorCode: number | string | undefined): number {
  const parsed = Number.parseInt(String(errorCode ?? ''), 10);
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

export async function registerArcaOrder(
  request: ArcaRegisterOrderRequest,
): Promise<ArcaRegisterOrderResponse> {
  const config = getArcaConfig();
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

  const paymentState = status.paymentAmountInfo?.paymentState?.trim().toUpperCase();
  if (paymentState === 'DEPOSITED') {
    return true;
  }

  return normalizeArcaOrderStatus(status.orderStatus) === 2;
}
