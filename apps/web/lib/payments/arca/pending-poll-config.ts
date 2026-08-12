const DEFAULT_RECONCILIATION_INTERVAL_MINUTES = 30;
const DEFAULT_PENDING_TIMEOUT_MINUTES = 60;
const MS_PER_MINUTE = 60_000;

function readPositiveInt(raw: string | undefined, fallback: number): number {
  const parsed = Number.parseInt((raw ?? '').trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

export type PaymentReconciliationConfig = {
  intervalMinutes: number;
  pendingTimeoutMinutes: number;
  pendingTimeoutMs: number;
};

export function getPaymentReconciliationConfig(): PaymentReconciliationConfig {
  const intervalMinutes = readPositiveInt(
    process.env.PAYMENT_RECONCILIATION_INTERVAL_MINUTES,
    DEFAULT_RECONCILIATION_INTERVAL_MINUTES,
  );
  const pendingTimeoutMinutes = readPositiveInt(
    process.env.PAYMENT_PENDING_TIMEOUT_MINUTES,
    DEFAULT_PENDING_TIMEOUT_MINUTES,
  );

  return {
    intervalMinutes,
    pendingTimeoutMinutes,
    pendingTimeoutMs: pendingTimeoutMinutes * MS_PER_MINUTE,
  };
}
