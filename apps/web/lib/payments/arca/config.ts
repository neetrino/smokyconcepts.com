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
};

export type ArcaConfig = {
  bank: ArcaBank;
  baseUrl: string;
  username: string;
  password: string;
  appUrl: string;
  testMode: boolean;
};

function normalizeAppUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function readArcaBank(): ArcaBank {
  const raw = (process.env.ARCA_BANK ?? 'idbank').trim().toLowerCase();
  if (raw === 'idbank' || raw === 'inecobank') {
    return raw;
  }
  throw new Error('Invalid ARCA_BANK. Allowed values: idbank, inecobank.');
}

function requireEnvValue(value: string | undefined, key: string): string {
  const resolved = value?.trim() ?? '';
  if (resolved.length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return resolved;
}

export function getArcaConfig(): ArcaConfig {
  const testMode = (process.env.ARCA_TEST_MODE ?? '').trim().toLowerCase() === 'true';
  const bank = readArcaBank();
  const baseUrl = testMode ? ARCA_BASE_URLS[bank].test : ARCA_BASE_URLS[bank].live;
  const username = testMode
    ? requireEnvValue(process.env.ARCA_USERNAME, 'ARCA_USERNAME')
    : requireEnvValue(process.env.ARCA_LIVE_USERNAME, 'ARCA_LIVE_USERNAME');
  const password = testMode
    ? requireEnvValue(process.env.ARCA_PASSWORD, 'ARCA_PASSWORD')
    : requireEnvValue(process.env.ARCA_LIVE_PASSWORD, 'ARCA_LIVE_PASSWORD');
  const appUrlSource =
    process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000';

  return {
    bank,
    baseUrl,
    username,
    password,
    appUrl: normalizeAppUrl(appUrlSource),
    testMode,
  };
}
