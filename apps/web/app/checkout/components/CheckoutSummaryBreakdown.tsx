'use client';

import { useCurrency } from '@/components/hooks/useCurrency';
import { useTranslation } from '@/lib/i18n-client';
import { type CurrencyCode } from '@/lib/currency';
import {
  formatOrderCollectionDisplay,
  formatOrderDiscountDisplay,
  formatOrderMerchandiseDisplay,
  formatOrderShippingDisplay,
  formatOrderSummaryUsd,
  formatOrderTotalDisplay,
} from '@/lib/orders/order-summary-display';
import type { CheckoutOrderSummaryTotals } from '../types';

interface CheckoutSummaryBreakdownProps {
  orderSummary: CheckoutOrderSummaryTotals;
  shippingMethod: 'pickup' | 'delivery';
  loadingDeliveryPrice?: boolean;
  /** When false, shipping row uses summary shipping only (no region hint). */
  showShippingRegionHint?: boolean;
  shippingRegionLabel?: string;
  textSizeClass?: string;
  totalTextClass?: string;
}

export function CheckoutSummaryBreakdown({
  orderSummary,
  shippingMethod,
  loadingDeliveryPrice = false,
  showShippingRegionHint = false,
  shippingRegionLabel,
  textSizeClass = '',
  totalTextClass = 'text-lg font-bold text-gray-900',
}: CheckoutSummaryBreakdownProps) {
  const { t } = useTranslation();
  const displayCurrency = useCurrency() as CurrencyCode;
  const { summary, shippingPriceAmd } = orderSummary;

  const shippingDisplay =
    shippingMethod === 'pickup'
      ? t('checkout.shipping.freePickup')
      : loadingDeliveryPrice
        ? t('checkout.shipping.loading')
        : shippingPriceAmd != null
          ? formatOrderShippingDisplay(summary.shippingUsd, shippingPriceAmd, displayCurrency) +
            (showShippingRegionHint && shippingRegionLabel ? ` (${shippingRegionLabel})` : '')
          : t('checkout.shipping.enterRegion');

  const rowClass = textSizeClass ? `flex justify-between ${textSizeClass}` : 'flex justify-between text-gray-600';

  return (
    <>
      <div className={rowClass}>
        <span>{t('checkout.summary.subtotal')}</span>
        <span>{formatOrderMerchandiseDisplay(summary, displayCurrency)}</span>
      </div>
      <div className={rowClass}>
        <span>{t('checkout.summary.shipping')}</span>
        <span>{shippingDisplay}</span>
      </div>
      {summary.hasCollection ? (
        <div className={rowClass}>
          <span>{t('checkout.summary.collectionPrice')}</span>
          <span>{formatOrderCollectionDisplay(summary, displayCurrency)}</span>
        </div>
      ) : null}
      {summary.discountUsd > 0 ? (
        <div className={`${rowClass} text-emerald-700`}>
          <span>{t('checkout.summary.couponDiscount')}</span>
          <span>-{formatOrderDiscountDisplay(summary, displayCurrency)}</span>
        </div>
      ) : null}
      {summary.taxUsd > 0 ? (
        <div className={rowClass}>
          <span>{t('checkout.summary.tax')}</span>
          <span>{formatOrderSummaryUsd(summary.taxUsd, displayCurrency)}</span>
        </div>
      ) : null}
      <div className="border-t border-gray-200 pt-4">
        <div className={`flex justify-between ${totalTextClass}`}>
          <span>{t('checkout.summary.total')}</span>
          <span>{formatOrderTotalDisplay(summary, displayCurrency)}</span>
        </div>
      </div>
    </>
  );
}
