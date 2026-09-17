import { getPublicSiteAppUrl } from '@/lib/payments/get-payment-app-url';

export type IdramConfig = {
  recAccount: string;
  secretKey: string;
  appUrl: string;
  testMode: boolean;
};

export type IdramPaymentUrls = {
  resultUrl: string;
  successUrl: string;
  failUrl: string;
};

/** Public app base URL for Idram server callbacks; does not require merchant credentials. */
export function getPaymentAppUrl(): string {
  return getPublicSiteAppUrl();
}

function requireEnvValue(value: string | undefined, key: string): string {
  const resolved = value?.trim() ?? '';
  if (resolved.length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return resolved;
}

export function getIdramConfig(): IdramConfig {
  const testMode = (process.env.IDRAM_TEST_MODE ?? '').trim().toLowerCase() === 'true';
  const recAccount = testMode
    ? requireEnvValue(process.env.IDRAM_REC_ACCOUNT, 'IDRAM_REC_ACCOUNT')
    : requireEnvValue(process.env.IDRAM_LIVE_REC_ACCOUNT, 'IDRAM_LIVE_REC_ACCOUNT');
  const secretKey = testMode
    ? requireEnvValue(process.env.IDRAM_SECRET_KEY, 'IDRAM_SECRET_KEY')
    : requireEnvValue(process.env.IDRAM_LIVE_SECRET_KEY, 'IDRAM_LIVE_SECRET_KEY');

  return {
    recAccount,
    secretKey,
    appUrl: getPaymentAppUrl(),
    testMode,
  };
}

export function getIdramPaymentUrls(appUrl: string = getPaymentAppUrl()): IdramPaymentUrls {
  const base = appUrl;
  return {
    resultUrl: `${base}/api/v1/payments/idram/callback`,
    successUrl: `${base}/api/v1/payments/idram/success`,
    failUrl: `${base}/api/v1/payments/idram/fail`,
  };
}
