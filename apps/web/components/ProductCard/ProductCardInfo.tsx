'use client';

import Link from 'next/link';
import { formatPrice } from '../../lib/currency';
import { useTranslation } from '../../lib/i18n-client';
import type { CurrencyCode } from '../../lib/currency';

export type ProductCardInfoVariant = 'default' | 'trending';

interface ProductCardInfoProps {
  slug: string;
  title: string;
  brandName?: string | null;
  categoryName?: string | null;
  price: number;
  originalPrice?: number | null;
  compareAtPrice?: number | null;
  discountPercent?: number | null;
  currency: CurrencyCode;
  isCompact?: boolean;
  variant?: ProductCardInfoVariant;
}

/**
 * Component for displaying product information (title, brand, price)
 */
export function ProductCardInfo({
  slug,
  title,
  brandName,
  categoryName,
  price,
  originalPrice,
  compareAtPrice,
  discountPercent,
  currency,
  isCompact = false,
  variant = 'default',
}: ProductCardInfoProps) {
  const { t } = useTranslation();
  const categoryOrBrand = categoryName || brandName || t('common.defaults.category');

  if (variant === 'trending') {
    return (
      <div className="mt-0">
        <Link href={`/products/${slug}`} className="block">
          <h3 className="text-[1.6rem] font-extrabold leading-none text-[#414141] line-clamp-2">
            {title}
          </h3>
          <p className="mt-2 text-xs font-medium text-[#9d9d9d]">
            {categoryOrBrand}
          </p>
        </Link>
      </div>
    );
  }

  return (
    <div className={isCompact ? 'p-2.5' : 'p-4'}>
      <Link href={`/products/${slug}`} className="block">
        <h3 className={`${isCompact ? 'text-base' : 'text-xl'} font-medium text-gray-900 ${isCompact ? 'mb-0.5' : 'mb-1'} line-clamp-2`}>
          {title}
        </h3>
        <p className={`${isCompact ? 'text-sm' : 'text-lg'} text-gray-500 ${isCompact ? 'mb-1' : 'mb-2'}`}>
          {categoryOrBrand}
        </p>
      </Link>

      <Link
        href={`/products/${slug}`}
        className="inline-flex text-sm font-semibold text-gray-900 underline-offset-4 hover:underline"
      >
        {t('common.buttons.viewDetails')}
      </Link>

      <div className={`mt-2 flex items-center justify-between ${isCompact ? 'gap-2' : 'gap-4'}`}>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`${isCompact ? 'text-lg' : 'text-2xl'} font-semibold text-gray-900`}>
              {formatPrice(price || 0, currency)}
            </span>
            {discountPercent && discountPercent > 0 ? (
              <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-semibold text-blue-600`}>
                -{discountPercent}%
              </span>
            ) : null}
          </div>
          {(originalPrice && originalPrice > price) ||
           (compareAtPrice && compareAtPrice > price) ? (
            <span className={`${isCompact ? 'text-sm' : 'text-lg'} text-gray-500 line-through`}>
              {formatPrice(
                originalPrice && originalPrice > price ? originalPrice : compareAtPrice ?? 0,
                currency
              )}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}




