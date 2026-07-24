'use client';

import { Button } from '@shop/ui';
import { useCurrency } from '../../components/hooks/useCurrency';
import { useTranslation } from '../../lib/i18n-client';
import { convertPrice, formatPriceInCurrency } from '../../lib/currency';
import type { CheckoutOrderSummaryTotals } from './types';

interface OrderSummaryProps {
  orderSummary: CheckoutOrderSummaryTotals;
  shippingMethod: 'pickup' | 'delivery';
  loadingDeliveryPrice: boolean;
  deliveryPrice: number | null;
  error: string | null;
  isSubmitting: boolean;
  couponDraft: string;
  onCouponDraftChange: (value: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  couponApplying: boolean;
  couponFieldError: string | null;
  appliedCouponCode: string | null;
}

export function OrderSummary({
  orderSummary,
  shippingMethod,
  loadingDeliveryPrice,
  deliveryPrice,
  error,
  isSubmitting,
  couponDraft,
  onCouponDraftChange,
  onApplyCoupon,
  onRemoveCoupon,
  couponApplying,
  couponFieldError,
  appliedCouponCode,
}: OrderSummaryProps) {
  const { t } = useTranslation();
  const displayCurrency = useCurrency();
  const formatCheckoutUsd = (amountUsd: number) =>
    formatPriceInCurrency(convertPrice(amountUsd, 'USD', displayCurrency), displayCurrency);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('checkout.orderSummary')}</h2>

        <div className="mb-6 rounded-2xl border border-[#dcc090]/25 bg-[#dcc090]/8 p-4">
          <p className="mb-2 text-xs font-medium text-[#122a26]/80">{t('checkout.coupon.sectionTitle')}</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              type="text"
              name="checkout-coupon-code"
              autoComplete="off"
              value={couponDraft}
              onChange={(e) => onCouponDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void onApplyCoupon();
                }
              }}
              disabled={Boolean(appliedCouponCode) || couponApplying}
              placeholder={t('checkout.coupon.placeholder')}
              className="min-w-0 flex-1 rounded-full border border-[#dcc090]/35 bg-white px-4 py-2.5 text-sm text-[#122a26] shadow-sm placeholder:text-gray-400 focus:border-[#dcc090] focus:outline-none focus:ring-2 focus:ring-[#dcc090]/30 disabled:bg-gray-50 disabled:text-gray-500"
            />
            <Button
              type="button"
              variant="gold"
              className="shrink-0 shadow-sm"
              disabled={couponApplying || Boolean(appliedCouponCode) || !couponDraft.trim()}
              onClick={() => void onApplyCoupon()}
            >
              {couponApplying ? t('checkout.coupon.applying') : t('checkout.coupon.apply')}
            </Button>
          </div>
          {couponFieldError ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {couponFieldError}
            </p>
          ) : null}
          {appliedCouponCode ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#122a26]">
              <span>
                {t('checkout.coupon.applied').replace('{code}', appliedCouponCode)}
              </span>
              <button
                type="button"
                className="font-medium text-[#122a26] underline underline-offset-2 hover:text-[#0f221f]"
                onClick={onRemoveCoupon}
              >
                {t('checkout.coupon.remove')}
              </button>
            </div>
          ) : null}
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-gray-600">
            <span>{t('checkout.summary.subtotal')}</span>
            <span>{formatCheckoutUsd(orderSummary.subtotalDisplay)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>{t('checkout.summary.shipping')}</span>
            <span>
              {shippingMethod === 'pickup'
                ? t('checkout.shipping.freePickup')
                : loadingDeliveryPrice
                  ? t('checkout.shipping.loading')
                  : deliveryPrice !== null
                    ? formatCheckoutUsd(orderSummary.shippingDisplay)
                    : t('checkout.shipping.enterRegion')}
            </span>
          </div>
          {orderSummary.collectionPriceDisplay > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>{t('checkout.summary.collectionPrice')}</span>
              <span>{formatCheckoutUsd(orderSummary.collectionPriceDisplay)}</span>
            </div>
          )}
          {orderSummary.couponDiscountDisplay > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>{t('checkout.summary.couponDiscount')}</span>
              <span>-{formatCheckoutUsd(orderSummary.couponDiscountDisplay)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>{t('checkout.summary.total')}</span>
              <span>{formatCheckoutUsd(orderSummary.totalDisplay)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

      <Button
        type="submit"
        variant="gold"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? t('checkout.buttons.processing') : t('checkout.buttons.placeOrder')}
      </Button>
    </div>
  );
}
