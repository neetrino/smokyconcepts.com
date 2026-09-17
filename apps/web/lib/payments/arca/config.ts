import { getPaymentReturnAppUrl } from '@/lib/payments/get-payment-app-url';
import type { ArcaBank } from './types';

const ARCA_BASE_URLS: Record<ArcaBank, { test: string; live: string }> = {
  idbank: {
    test: 'https://testepg.arca.am/payment/rest',
    live: 'https://ipay.arca.am/payment/rest',
  },
  inecobank: {
    test: 'https://pg.inecoecom.am/payment/rest',
    live: 'https://pg.inecoecom.am/payment/rest',
  },
  ameriabank: {
    test: 'https://servicestest.ameriabank.am/VPOS',
    live: 'https://services.ameriabank.am/VPOS',
  },
};

export type ArcaConfig = {
  bank: ArcaBank;
  baseUrl: string;
  username: string;
  password: string;
  clientId: string | null;
  appUrl: string;
  testMode: boolean;
};

function readArcaBank(): ArcaBank {
  const raw = (process.env.ARCA_BANK ?? 'ameriabank').trim().toLowerCase();
  if (raw === 'idbank' || raw === 'inecobank' || raw === 'ameriabank') {
    return raw;
  }
  throw new Error('Invalid ARCA_BANK. Allowed values: idbank, inecobank, ameriabank.');
}

function isTestMode(): boolean {
  return (process.env.AMERIA_TEST_MODE ?? '').trim().toLowerCase() === 'true';
}

function requireEnvValue(value: string | undefined, key: string): string {
  const resolved = value?.trim() ?? '';
  if (resolved.length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return resolved;
}

function resolveBaseUrl(bank: ArcaBank, testMode: boolean): string {
  const overrideBaseUrl = testMode ? process.env.ARCA_TEST_BASE_URL : process.env.ARCA_LIVE_BASE_URL;
  if ((overrideBaseUrl?.trim() ?? '').length > 0) {
    return requireEnvValue(
      overrideBaseUrl,
      testMode ? 'ARCA_TEST_BASE_URL' : 'ARCA_LIVE_BASE_URL',
    );
  }
  return testMode ? ARCA_BASE_URLS[bank].test : ARCA_BASE_URLS[bank].live;
}

function resolveCredentials(
  bank: ArcaBank,
  testMode: boolean,
): { username: string; password: string; clientId: string | null } {
  if (bank === 'ameriabank') {
    const username = requireEnvValue(
      process.env.AMERIA_LIVE_USERNAME ?? process.env.AMERIA_USERNAME,
      'AMERIA_LIVE_USERNAME',
    );
    const password = requireEnvValue(
      process.env.AMERIA_LIVE_PASSWORD ?? process.env.AMERIA_PASSWORD,
      'AMERIA_LIVE_PASSWORD',
    );
    const clientId = requireEnvValue(
      process.env.AMERIA_LIVE_CLIENT_ID ?? process.env.AMERIA_CLIENT_ID,
      'AMERIA_LIVE_CLIENT_ID',
    );
    return { username, password, clientId };
  }

  const username = testMode
    ? requireEnvValue(process.env.ARCA_USERNAME, 'ARCA_USERNAME')
    : requireEnvValue(process.env.ARCA_LIVE_USERNAME, 'ARCA_LIVE_USERNAME');
  const password = testMode
    ? requireEnvValue(process.env.ARCA_PASSWORD, 'ARCA_PASSWORD')
    : requireEnvValue(process.env.ARCA_LIVE_PASSWORD, 'ARCA_LIVE_PASSWORD');
  return { username, password, clientId: null };
}

export function getArcaConfig(): ArcaConfig {
  const testMode = isTestMode();
  const bank = readArcaBank();
  const baseUrl = resolveBaseUrl(bank, testMode);
  const { username, password, clientId } = resolveCredentials(bank, testMode);

  return {
    bank,
    baseUrl,
    username,
    password,
    clientId,
    appUrl: getPaymentReturnAppUrl(),
    testMode,
  };
}
