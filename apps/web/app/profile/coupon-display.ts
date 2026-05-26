import {
  COUPON_DISCOUNT_FIXED_USD,
  COUPON_DISCOUNT_PERCENT,
} from '@/lib/services/coupon.service';
import {
  convertPrice,
  formatPriceInCurrency,
  roundCatalogAmd,
  type CurrencyCode,
} from '@/lib/currency';
import type { UserCouponStatus } from './types';

export function formatProfileCouponDiscount(
  discountType: string,
  discountValue: number,
  displayCurrency: CurrencyCode,
): string {
  if (discountType === COUPON_DISCOUNT_PERCENT) {
    return `${discountValue}%`;
  }

  if (discountType === COUPON_DISCOUNT_FIXED_USD) {
    const converted = convertPrice(discountValue, 'USD', displayCurrency);
    const amount = displayCurrency === 'AMD' ? roundCatalogAmd(converted) : converted;
    return formatPriceInCurrency(amount, displayCurrency);
  }

  return String(discountValue);
}

export function profileCouponStatusClass(status: UserCouponStatus): string {
  switch (status) {
    case 'active':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'expired':
      return 'bg-gray-50 text-gray-600 border-gray-200';
    case 'inactive':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'exhausted':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}
