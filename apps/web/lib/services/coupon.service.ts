import { db } from '@white-shop/db';
import { Prisma } from '@prisma/client';

/** Max stored coupon code length after trim + uppercase */
export const COUPON_CODE_MAX_LENGTH = 64;

export const COUPON_DISCOUNT_PERCENT = 'percent' as const;
export const COUPON_DISCOUNT_FIXED_USD = 'fixed_usd' as const;

export type CouponDiscountType = typeof COUPON_DISCOUNT_PERCENT | typeof COUPON_DISCOUNT_FIXED_USD;

export function normalizeCouponCode(raw: string): string {
  return raw.trim().toUpperCase().slice(0, COUPON_CODE_MAX_LENGTH);
}

export function roundMoneyUsd(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Discount on merchandise subtotal (USD), capped so total discount never exceeds subtotal.
 */
export function computeCouponDiscountUsd(
  merchandiseSubtotalUsd: number,
  discountType: string,
  discountValue: number,
): number {
  const subtotal = Math.max(0, merchandiseSubtotalUsd);
  if (subtotal <= 0) {
    return 0;
  }
  if (discountType === COUPON_DISCOUNT_PERCENT) {
    const p = Math.max(0, Math.min(100, discountValue));
    return roundMoneyUsd(Math.min(subtotal, subtotal * (p / 100)));
  }
  if (discountType === COUPON_DISCOUNT_FIXED_USD) {
    const fixed = Math.max(0, discountValue);
    return roundMoneyUsd(Math.min(subtotal, fixed));
  }
  return 0;
}

export type TryCouponResult =
  | { status: 'empty' }
  | { status: 'invalid'; reason?: 'not_eligible_user' }
  | { status: 'ok'; discountAmountUsd: number; code: string };

export interface TryApplyCouponOptions {
  /** When coupon is restricted to specific users, only this account may apply it (guests cannot). */
  userId?: string | null;
}

function isMissingCouponQuantityColumnError(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code !== 'P2022') {
    return false;
  }

  const meta = error.meta as { column?: string } | undefined;
  return meta?.column === 'coupons.quantity';
}

/**
 * Looks up a coupon and computes discount for the given merchandise subtotal (no throw).
 */
export async function tryApplyCoupon(
  rawCode: string | undefined,
  merchandiseSubtotalUsd: number,
  options: TryApplyCouponOptions = {},
): Promise<TryCouponResult> {
  const input = typeof rawCode === 'string' ? rawCode.trim() : '';
  if (!input) {
    return { status: 'empty' };
  }
  const code = normalizeCouponCode(input);
  if (!code) {
    return { status: 'invalid' };
  }

  const coupon = await (async () => {
    try {
      return await db.coupon.findUnique({
        where: { code },
        select: {
          code: true,
          active: true,
          expiresAt: true,
          discountType: true,
          discountValue: true,
          quantity: true,
          allowedUsers: {
            select: { userId: true },
          },
        },
      });
    } catch (error: unknown) {
      if (!isMissingCouponQuantityColumnError(error)) {
        throw error;
      }

      const fallbackCoupon = await db.coupon.findUnique({
        where: { code },
        select: {
          code: true,
          active: true,
          expiresAt: true,
          discountType: true,
          discountValue: true,
        },
      });

      if (!fallbackCoupon) {
        return null;
      }

      return {
        ...fallbackCoupon,
        quantity: null,
        allowedUsers: [] as { userId: string }[],
      };
    }
  })();

  if (!coupon || !coupon.active) {
    return { status: 'invalid' };
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { status: 'invalid' };
  }
  if (typeof coupon.quantity === 'number' && coupon.quantity > 0) {
    const usedCount = await db.order.count({
      where: { couponCode: coupon.code },
    });
    if (usedCount >= coupon.quantity) {
      return { status: 'invalid' };
    }
  }

  const allowedUserIds = coupon.allowedUsers.map(
    (row: { userId: string }) => row.userId,
  );
  if (allowedUserIds.length > 0) {
    const uid = options.userId?.trim();
    if (!uid || !allowedUserIds.includes(uid)) {
      return { status: 'invalid', reason: 'not_eligible_user' };
    }
  }

  const discountAmountUsd = computeCouponDiscountUsd(
    merchandiseSubtotalUsd,
    coupon.discountType,
    coupon.discountValue,
  );

  return { status: 'ok', discountAmountUsd, code: coupon.code };
}
