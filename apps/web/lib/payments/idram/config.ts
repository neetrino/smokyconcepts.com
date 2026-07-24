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

function normalizeAppUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

/** Public app base URL for redirects; does not require Idram merchant credentials. */
export function getPaymentAppUrl(): string {
  const explicitUrl = process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || '';
  if (explicitUrl.length > 0) {
    return normalizeAppUrl(explicitUrl);
  }

  const vercelHost = process.env.VERCEL_URL?.trim() || '';
  if (vercelHost.length > 0) {
    return normalizeAppUrl(`https://${vercelHost}`);
  }

  return 'http://localhost:3000';
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
