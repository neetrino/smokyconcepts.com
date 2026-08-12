import { getArcaConfig } from './config';
import { postAmeriaJson, postArcaForm } from './http';
import { isAmeriaMutationSuccess, normalizeArcaErrorCode } from './response-codes';
import type { ArcaMutationResponse } from './types';

type AmeriaMutationApiResponse = {
  ResponseCode?: number | string;
  responseCode?: number | string;
  ResponseMessage?: string;
  responseMessage?: string;
  Opaque?: string;
};

type ArcaFormMutationResponse = {
  errorCode?: number | string;
  errorMessage?: string;
};

function toArcaMutationResponse(
  errorCode: number | string,
  errorMessage?: string,
): ArcaMutationResponse {
  return {
    errorCode,
    errorMessage,
  };
}

async function cancelAmeriaPayment(paymentId: string): Promise<ArcaMutationResponse> {
  const config = getArcaConfig();
  const response = await postAmeriaJson<AmeriaMutationApiResponse>('/api/VPOS/CancelPayment', {
    PaymentID: paymentId,
    Username: config.username,
    Password: config.password,
  });
  const code = response.ResponseCode ?? response.responseCode ?? -1;
  if (isAmeriaMutationSuccess(code)) {
    return toArcaMutationResponse(0, response.ResponseMessage ?? response.responseMessage);
  }
  return toArcaMutationResponse(
    code,
    response.ResponseMessage ?? response.responseMessage ?? 'Ameria CancelPayment failed',
  );
}

async function refundAmeriaPayment(
  paymentId: string,
  amount: number,
): Promise<ArcaMutationResponse> {
  const config = getArcaConfig();
  const response = await postAmeriaJson<AmeriaMutationApiResponse>('/api/VPOS/RefundPayment', {
    PaymentID: paymentId,
    Username: config.username,
    Password: config.password,
    Amount: amount,
  });
  const code = response.ResponseCode ?? response.responseCode ?? -1;
  if (isAmeriaMutationSuccess(code)) {
    return toArcaMutationResponse(0, response.ResponseMessage ?? response.responseMessage);
  }
  return toArcaMutationResponse(
    code,
    response.ResponseMessage ?? response.responseMessage ?? 'Ameria RefundPayment failed',
  );
}

async function cancelClassicArcaPayment(orderId: string): Promise<ArcaMutationResponse> {
  const config = getArcaConfig();
  const response = await postArcaForm<ArcaFormMutationResponse>('reverse.do', {
    userName: config.username,
    password: config.password,
    orderId,
  });
  return toArcaMutationResponse(
    response.errorCode ?? -1,
    response.errorMessage,
  );
}

async function refundClassicArcaPayment(
  orderId: string,
  amount: number,
): Promise<ArcaMutationResponse> {
  const config = getArcaConfig();
  const response = await postArcaForm<ArcaFormMutationResponse>('refund.do', {
    userName: config.username,
    password: config.password,
    orderId,
    amount: String(amount),
  });
  return toArcaMutationResponse(
    response.errorCode ?? -1,
    response.errorMessage,
  );
}

export async function cancelArcaPayment(providerOrderId: string): Promise<ArcaMutationResponse> {
  const config = getArcaConfig();
  if (config.bank === 'ameriabank') {
    return cancelAmeriaPayment(providerOrderId);
  }
  return cancelClassicArcaPayment(providerOrderId);
}

export async function refundArcaPayment(
  providerOrderId: string,
  amount: number,
): Promise<ArcaMutationResponse> {
  const config = getArcaConfig();
  if (config.bank === 'ameriabank') {
    return refundAmeriaPayment(providerOrderId, amount);
  }
  return refundClassicArcaPayment(providerOrderId, amount);
}

/**
 * Prefer same-day reverse (Cancel/reverse.do). If that fails, attempt Refund.
 */
export async function reverseOrRefundArcaPayment(
  providerOrderId: string,
  amount: number,
): Promise<ArcaMutationResponse & { action: 'cancel' | 'refund' }> {
  const cancelResult = await cancelArcaPayment(providerOrderId);
  if (normalizeArcaErrorCode(cancelResult.errorCode) === 0) {
    return { ...cancelResult, errorCode: 0, action: 'cancel' };
  }

  const refundResult = await refundArcaPayment(providerOrderId, amount);
  if (normalizeArcaErrorCode(refundResult.errorCode) === 0) {
    return { ...refundResult, errorCode: 0, action: 'refund' };
  }

  return {
    errorCode: refundResult.errorCode,
    errorMessage:
      refundResult.errorMessage ||
      cancelResult.errorMessage ||
      'Arca cancel and refund both failed',
    action: 'refund',
  };
}
