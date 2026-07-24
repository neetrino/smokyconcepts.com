import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import { listCouponsForUser } from '@/lib/services/coupon.service';
import { toApiError } from '@/lib/types/errors';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/v1/users/coupons
 * Lists coupons assigned to the authenticated user.
 */
export async function GET(req: NextRequest) {
  try {
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

    const data = await listCouponsForUser(user.id);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    logger.error('User coupons list error', { error });
    const apiError = toApiError(error, req.url);
    return NextResponse.json(apiError, { status: apiError.status || 500 });
  }
}
