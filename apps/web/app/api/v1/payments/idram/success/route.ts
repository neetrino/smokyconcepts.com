import { NextRequest } from 'next/server';
import { db } from '@white-shop/db';
import { buildIdramSuccessRedirect } from '@/lib/payments/idram/redirects';
import { createPaymentReturnResponse } from '@/lib/payments/idram/top-level-redirect';
import { appendOrderAccessCookie } from '@/lib/orders/order-access-cookie.server';
import { logger } from '@/lib/utils/logger';

function resolveOrderNumber(query: URLSearchParams): string {
  const candidates = [
    query.get('order_number'),
    query.get('orderNumber'),
    query.get('order'),
    query.get('EDP_BILL_NO'),
  ];
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value) {
      return value;
    }
  }
  return '';
}

export async function GET(req: NextRequest) {
  const orderNumber = resolveOrderNumber(req.nextUrl.searchParams);
  let orderId: string | undefined;

  if (orderNumber) {
    try {
      const order = await db.order.findFirst({
        where: { number: orderNumber },
        select: { id: true },
      });
      orderId = order?.id;
    } catch (error: unknown) {
      logger.error('Idram success: failed to resolve order id', {
        error,
        orderNumber,
      });
    }
  }

  const targetUrl = buildIdramSuccessRedirect(
    orderNumber || undefined,
    req.nextUrl.origin,
  );
  const response = createPaymentReturnResponse(req, targetUrl);
  if (orderId) {
    appendOrderAccessCookie(response, req, orderId);
  }
  return response;
}
