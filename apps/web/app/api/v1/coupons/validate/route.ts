import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import { tryApplyCoupon } from '@/lib/services/coupon.service';
import { logger } from '@/lib/utils/logger';

/**
 * POST /api/v1/coupons/validate
 * Preview coupon discount for checkout (server re-validates on place order).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const code = typeof body.code === 'string' ? body.code : '';
    const rawSub = body.merchandiseSubtotalUsd;
    const merchandiseSubtotalUsd =
      typeof rawSub === 'number' && Number.isFinite(rawSub) ? Math.max(0, rawSub) : 0;

    const authUser = await authenticateToken(req).catch(() => null);
    const userId = authUser?.id ?? null;

    const result = await tryApplyCoupon(code, merchandiseSubtotalUsd, { userId });

    if (result.status === 'empty') {
      return NextResponse.json({
        valid: false,
        message: 'empty_code',
      });
    }
    if (result.status === 'invalid') {
      return NextResponse.json({
        valid: false,
        ...(result.reason === 'not_eligible_user' ? { reason: 'not_eligible_user' as const } : {}),
      });
    }
    return NextResponse.json({
      valid: true,
      discountAmountUsd: result.discountAmountUsd,
      code: result.code,
    });
  } catch (error: unknown) {
    logger.error('Coupon validate error', { error });
    return NextResponse.json(
      {
        type: 'https://api.shop.am/problems/internal-error',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Could not validate coupon',
      },
      { status: 500 },
    );
  }
}
