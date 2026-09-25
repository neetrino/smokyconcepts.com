import { db } from '@white-shop/db';
import { after } from 'next/server';
import { registerArcaOrder } from '@/lib/payments/arca/client';
import { getArcaConfig } from '@/lib/payments/arca/config';
import { resolveOrderAmountForArcaAmd } from '@/lib/payments/arca/order-amount';
import type { ArcaCurrencyCode, ArcaRegisterOrderResponse } from '@/lib/payments/arca/types';
import { logger } from '@/lib/utils/logger';

const ARCA_REGISTER_CURRENCY: ArcaCurrencyCode = '051';
const ARCA_PAGE_LANGUAGE = 'en';
const ARCA_PROVIDER = 'arca';
const INVALID_AMOUNT_CODE = 'invalid_amount';

export type ArcaRegistrationHandle = Promise<ArcaRegisterOrderResponse>;

export type ArcaRegistrationFailure = 'invalid_amount' | 'bank';

export type SettledArcaRegistration = {
  redirectUrl: string | null;
  providerOrderId: string | null;
  errorMessage: string | null;
  failure: ArcaRegistrationFailure | null;
};

type BeginArcaOrderRegistrationInput = {
  orderNumber: string;
  orderTotal: number;
  orderCurrency: string;
};

type SettleArcaRegistrationInput = {
  orderId: string;
  paymentId: string;
  registration: ArcaRegistrationHandle;
};

function isSuccessfulRegistration(
  result: ArcaRegisterOrderResponse,
): result is ArcaRegisterOrderResponse & { formUrl: string; orderId: string } {
  const errorCode = Number.parseInt(String(result.errorCode), 10);
  return errorCode === 0 && Boolean(result.formUrl) && Boolean(result.orderId);
}

function failedSettlement(
  failure: ArcaRegistrationFailure,
  errorMessage: string,
): SettledArcaRegistration {
  return {
    redirectUrl: null,
    providerOrderId: null,
    errorMessage,
    failure,
  };
}

/**
 * Starts InitPayment for a chosen order number. Does not wait for the bank.
 * Await only after the order transaction has committed.
 */
export function beginArcaOrderRegistration(
  input: BeginArcaOrderRegistrationInput,
): ArcaRegistrationHandle {
  const config = getArcaConfig();
  const amountAmd = resolveOrderAmountForArcaAmd(
    input.orderTotal,
    input.orderCurrency,
    config.testMode,
  );
  if (!Number.isFinite(amountAmd) || amountAmd <= 0) {
    return Promise.resolve({
      errorCode: INVALID_AMOUNT_CODE,
      errorMessage: 'Order total must be greater than zero',
    });
  }

  const callbackUrl = `${config.appUrl}/api/v1/payments/arca/callback?order=${encodeURIComponent(
    input.orderNumber,
  )}`;

  return registerArcaOrder({
    orderNumber: input.orderNumber,
    amount: amountAmd,
    currency: ARCA_REGISTER_CURRENCY,
    returnUrl: callbackUrl,
    description: `Order ${input.orderNumber}`,
    language: ARCA_PAGE_LANGUAGE,
  });
}

/**
 * Ignores a bank session whose order number was not committed.
 * The buyer never receives the URL, so the card is not charged.
 */
export function discardArcaRegistration(registration: ArcaRegistrationHandle | null): void {
  if (!registration) {
    return;
  }
  void registration.catch((error: unknown) => {
    logger.warn('Discarded Arca registration after checkout rollback', { error });
  });
}

async function saveArcaRegistration(
  input: SettleArcaRegistrationInput & {
    providerOrderId: string;
    providerResponse: ArcaRegisterOrderResponse;
  },
): Promise<void> {
  const config = getArcaConfig();
  await db.payment.update({
    where: { id: input.paymentId },
    data: {
      providerTransactionId: input.providerOrderId,
      providerResponse: input.providerResponse,
    },
  });
  await db.orderEvent.create({
    data: {
      orderId: input.orderId,
      type: 'payment_initialized',
      data: {
        provider: ARCA_PROVIDER,
        orderId: input.providerOrderId,
        gatewayOrderId: input.providerResponse.gatewayOrderId ?? null,
        testMode: config.testMode,
      },
    },
  });
}

function persistRegistrationAfterResponse(
  input: SettleArcaRegistrationInput & {
    providerOrderId: string;
    providerResponse: ArcaRegisterOrderResponse;
  },
): void {
  const save = () => saveArcaRegistration(input);
  try {
    after(() =>
      save().catch((error: unknown) => {
        logger.error('Failed to persist Arca registration', { error });
      }),
    );
  } catch (error: unknown) {
    logger.warn('Arca registration save was not deferred', { error });
    void save().catch((saveError: unknown) => {
      logger.error('Failed to persist Arca registration', { error: saveError });
    });
  }
}

/**
 * Returns the bank URL as soon as registration succeeds.
 * PaymentID is stored after the response so the 3-D page can open immediately.
 * A bank failure leaves the order pending and returns no URL.
 */
export async function settleArcaRegistration(
  input: SettleArcaRegistrationInput,
): Promise<SettledArcaRegistration> {
  try {
    const registerResult = await input.registration;
    if (String(registerResult.errorCode) === INVALID_AMOUNT_CODE) {
      return failedSettlement(
        'invalid_amount',
        registerResult.errorMessage || 'Order total must be greater than zero',
      );
    }

    if (!isSuccessfulRegistration(registerResult)) {
      logger.error('Arca register failed', {
        errorCode: registerResult.errorCode,
        errorMessage: registerResult.errorMessage,
      });
      return failedSettlement(
        'bank',
        registerResult.errorMessage || 'Arca register returned an error',
      );
    }

    persistRegistrationAfterResponse({
      ...input,
      providerOrderId: registerResult.orderId,
      providerResponse: registerResult,
    });

    return {
      redirectUrl: registerResult.formUrl,
      providerOrderId: registerResult.orderId,
      errorMessage: null,
      failure: null,
    };
  } catch (error: unknown) {
    logger.error('Arca registration failed', { error });
    return failedSettlement('bank', 'Arca register returned an error');
  }
}
