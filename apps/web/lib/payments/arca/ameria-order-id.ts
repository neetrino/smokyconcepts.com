import { db } from '@white-shop/db';

const AMERIA_DUPLICATE_ORDER_CODES = new Set(['01', '1', '08204', '8204']);
const USED_ORDER_ID_LOOKBACK_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
/** Max candidates scanned when avoiding locally known OrderIDs. */
const ORDER_ID_COLLISION_SCAN_LIMIT = 10_000;
/** Gap between InitPayment retry attempts to reduce bank-side collisions. */
const ORDER_ID_RETRY_STRIDE = 100_000;

function parseShopOrderId(orderNumber: string): number {
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

function extractGatewayOrderId(providerResponse: unknown): number | null {
  if (!providerResponse || typeof providerResponse !== 'object') {
    return null;
  }
  const record = providerResponse as Record<string, unknown>;
  const raw = record.gatewayOrderId ?? record.OrderID ?? record.orderID;
  const parsed = typeof raw === 'number' ? raw : Number.parseInt(String(raw ?? ''), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Loads Ameria OrderIDs we already initialized so they are not reused locally.
 */
export async function loadUsedAmeriaGatewayOrderIds(): Promise<Set<number>> {
  const createdAfter = new Date(Date.now() - USED_ORDER_ID_LOOKBACK_DAYS * MS_PER_DAY);
  const payments = await db.payment.findMany({
    where: {
      provider: 'arca',
      createdAt: { gte: createdAfter },
      providerResponse: { not: null },
    },
    select: { providerResponse: true },
    take: 500,
    orderBy: { createdAt: 'desc' },
  });

  const used = new Set<number>();
  for (const payment of payments) {
    const gatewayOrderId = extractGatewayOrderId(payment.providerResponse);
    if (gatewayOrderId != null) {
      used.add(gatewayOrderId);
    }
  }
  return used;
}

/**
 * Resolves Ameria `OrderID` from the shop order number (no merchant test-range clamp).
 * Opaque still carries the real shop order number for callbacks.
 */
export function resolveAmeriaOrderId(
  orderNumber: string,
  attempt = 0,
  usedIds: ReadonlySet<number> = new Set(),
): number {
  const orderSeed = parseShopOrderId(orderNumber);
  const base = orderSeed + attempt * ORDER_ID_RETRY_STRIDE;

  for (let offset = 0; offset < ORDER_ID_COLLISION_SCAN_LIMIT; offset += 1) {
    const candidate = base + offset;
    if (candidate > 0 && !usedIds.has(candidate)) {
      return candidate;
    }
  }

  return Math.max(1, base);
}

export function isAmeriaDuplicateOrderIdError(
  code: number | string | undefined,
  message: string | undefined,
): boolean {
  const normalizedCode = String(code ?? '').trim();
  if (AMERIA_DUPLICATE_ORDER_CODES.has(normalizedCode)) {
    return true;
  }
  const normalizedMessage = (message ?? '').toLowerCase();
  return (
    normalizedMessage.includes('duplicat') ||
    normalizedMessage.includes('already') ||
    normalizedMessage.includes('incorrect order id')
  );
}
