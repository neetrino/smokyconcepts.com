import { NextRequest, NextResponse } from 'next/server';
import { db } from '@white-shop/db';
import { authenticateToken } from '@/lib/middleware/auth';
import { appendOrderAccessCookie } from '@/lib/orders/order-access-cookie.server';

/**
 * Grants order-detail cookie access for an order owned by the authenticated user.
 * Call before opening /orders/:number or loading order details from profile.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ number: string }> },
) {
  const user = await authenticateToken(req);
  if (!user) {
    return NextResponse.json(
      {
        type: 'https://api.shop.am/problems/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication token required',
        instance: req.url,
      },
      { status: 401 },
    );
  }

  const { number } = await params;
  const order = await db.order.findFirst({
    where: {
      number,
      userId: user.id,
    },
    select: { id: true, number: true },
  });

  if (!order) {
    return NextResponse.json(
      {
        type: 'https://api.shop.am/problems/not-found',
        title: 'Order not found',
        status: 404,
        detail: `Order with number '${number}' not found`,
        instance: req.url,
      },
      { status: 404 },
    );
  }

  const response = NextResponse.json({
    ok: true,
    orderNumber: order.number,
  });
  appendOrderAccessCookie(response, req, order.id);
  return response;
}
