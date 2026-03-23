'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, type MouseEvent } from 'react';
import { formatPrice } from '../../lib/currency';
import { useTranslation } from '../../lib/i18n-client';
import { Button } from '../ui/buttons';
import { CartIcon as CartPngIcon } from '../icons/CartIcon';
import type { CurrencyCode } from '../../lib/currency';
import type { ProductLabel } from '../ProductLabels';

interface ProductCardListProps {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    image: string | null;
    images?: string[];
    inStock: boolean;
    categories: Array<{
      id: string;
      slug: string;
      title: string;
    }>;
    brand?: { id: string; name: string } | null;
    labels?: ProductLabel[];
    compareAtPrice?: number | null;
    originalPrice?: number | null;
    discountPercent?: number | null;
  };
  currency: CurrencyCode;
  isAddingToCart: boolean;
  onAddToCart: (e: MouseEvent) => void;
}

/**
 * List view layout for ProductCard
 */
export function ProductCardList({
  product,
  currency,
  isAddingToCart,
  onAddToCart,
}: ProductCardListProps) {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const primaryImage = product.images?.[0] || product.image;

  useEffect(() => {
    setImageError(false);
  }, [product.id, primaryImage]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:bg-gray-50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 sm:px-6 py-4">
        {/* Product Image */}
        <Link
          href={`/products/${product.slug}`}
          className="w-20 h-20 bg-transparent rounded-lg flex-shrink-0 relative overflow-hidden self-start sm:self-center"
        >
          {primaryImage && !imageError ? (
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              className="object-contain"
              sizes="80px"
              unoptimized
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
              {product.title}
            </h3>
            <p className="text-base sm:text-lg text-gray-500 mt-1">
              {product.categories[0]?.title || product.brand?.name || t('common.defaults.category')}
            </p>
          </Link>
          <Link
            href={`/products/${product.slug}`}
            className="mt-2 inline-flex text-sm font-semibold text-gray-900 underline-offset-4 hover:underline"
          >
            {t('common.buttons.viewDetails')}
          </Link>
        </div>

        {/* Price and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          {/* Price */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl font-semibold text-blue-600">
                {formatPrice(product.price || 0, currency)}
              </span>
              {product.discountPercent && product.discountPercent > 0 ? (
                <span className="text-xs sm:text-sm font-semibold text-blue-600">
                  -{product.discountPercent}%
                </span>
              ) : null}
            </div>
            {(product.originalPrice && product.originalPrice > product.price) || 
             (product.compareAtPrice && product.compareAtPrice > product.price) ? (
              <span className="text-base sm:text-lg text-gray-500 line-through mt-0.5">
                {formatPrice(
                  (product.originalPrice && product.originalPrice > product.price) 
                    ? product.originalPrice 
                    : (product.compareAtPrice || 0), 
                  currency
                )}
              </span>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              type="button"
              variant="icon"
              size="icon"
              onClick={onAddToCart}
              disabled={!product.inStock || isAddingToCart}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${product.inStock && !isAddingToCart ? 'hover:!bg-[#122a26] hover:!text-white hover:!border-[#122a26]' : ''}`}
              title={product.inStock ? t('common.buttons.addToCart') : t('common.stock.outOfStock')}
              aria-label={product.inStock ? t('common.buttons.addToCart') : t('common.stock.outOfStock')}
            >
              {isAddingToCart ? (
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <CartPngIcon size={20} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}




