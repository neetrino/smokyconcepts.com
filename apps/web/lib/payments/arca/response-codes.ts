export function normalizeArcaErrorCode(errorCode: number | string | undefined): number {
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

export function normalizeArcaOrderStatus(status: number | string | undefined): number {
  const parsed = Number.parseInt(String(status ?? ''), 10);
  return Number.isNaN(parsed) ? -1 : parsed;
}

/** Ameria InitPayment / mutation APIs may return 1 or 00/0 as success. */
export function isAmeriaMutationSuccess(code: number | string | undefined): boolean {
  const normalized = String(code ?? '').trim();
  return normalized === '1' || normalized === '0' || normalized === '00';
}

export function resolveAmeriaDetailsCode(code: number | string | undefined): number | string {
  const normalized = String(code ?? '').trim();
  if (!normalized) {
    return -1;
  }
  if (normalized === '1') {
    return 0;
  }
  if (normalized === '0' || normalized === '00' || normalized.startsWith('00')) {
    return 0;
  }
  const numericCode = Number.parseInt(normalized, 10);
  return Number.isNaN(numericCode) ? normalized : numericCode;
}
