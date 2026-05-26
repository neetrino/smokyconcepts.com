'use client';

import { Card } from '@shop/ui';
import { showToast } from '../../components/Toast';
import { useCurrency } from '../../components/hooks/useCurrency';
import { type CurrencyCode } from '../../lib/currency';
import { formatProfileCouponDiscount, profileCouponStatusClass } from './coupon-display';
import type { UserCoupon } from './types';

interface ProfileCouponsProps {
  coupons: UserCoupon[];
  couponsLoading: boolean;
  t: (key: string) => string;
}

export function ProfileCoupons({ coupons, couponsLoading, t }: ProfileCouponsProps) {
  const displayCurrency = useCurrency() as CurrencyCode;

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast(t('profile.coupons.copySuccess'), 'success');
    } catch {
      showToast(t('profile.coupons.copyError'), 'error');
    }
  };

  if (couponsLoading) {
    return (
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">{t('profile.coupons.title')}</h2>
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="animate-pulse">
              <div className="h-24 rounded-lg bg-gray-200" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (coupons.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">{t('profile.coupons.title')}</h2>
        <p className="text-sm text-gray-600">{t('profile.coupons.empty')}</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">{t('profile.coupons.title')}</h2>
      <div className="space-y-4">
        {coupons.map((coupon) => (
          <article
            key={coupon.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_4px_14px_rgba(18,42,38,0.04)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleCopyCode(coupon.code)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-[#122a26] transition-colors hover:bg-[#dcc090]/20"
                    aria-label={t('profile.coupons.copyCode')}
                    title={t('profile.coupons.copyCode')}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M10 20h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  <p className="truncate text-lg font-bold tracking-wide text-[#122a26]">{coupon.code}</p>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {t('profile.coupons.discount')}:{' '}
                  <span className="font-semibold text-[#122a26]">
                    {formatProfileCouponDiscount(
                      coupon.discountType,
                      coupon.discountValue,
                      displayCurrency,
                    )}
                  </span>
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {t('profile.coupons.expiresAt')}:{' '}
                  {coupon.expiresAt
                    ? new Date(coupon.expiresAt).toLocaleDateString()
                    : t('profile.coupons.noExpiry')}
                </p>
              </div>

              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${profileCouponStatusClass(coupon.status)}`}
              >
                {t(`profile.coupons.status.${coupon.status}`)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}
