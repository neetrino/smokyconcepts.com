import type { NextRequest } from 'next/server';
import { db } from '@white-shop/db';
import { getOrderAccessIdFromRequest } from '@/lib/orders/order-access-cookie.server';
import { logger } from '@/lib/utils/logger';

/**
 * Resolves the shop order number from the checkout order-access cookie.
 * Used when a payment provider returns without the order number.
 */
export async function resolveOrderNumberFromAccessCookie(
  req: NextRequest,
): Promise<string | undefined> {
  const orderId = getOrderAccessIdFromRequest(req);
  if (!orderId) {
    return undefined;
  }

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { number: true },
    });
    const number = order?.number.trim() ?? '';
    return number.length > 0 ? number : undefined;
  } catch (error: unknown) {
    logger.error('Failed to resolve order number from access cookie', { error });
    return undefined;
  }
}
