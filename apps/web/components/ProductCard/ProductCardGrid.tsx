'use client';

import type { MouseEvent } from 'react';
import Link from 'next/link';
import { Button } from '../ui/buttons';
import Image from 'next/image';
import { ProductCardImage } from './ProductCardImage';
import { ProductCardInfo } from './ProductCardInfo';
import { ProductCardActions } from './ProductCardActions';
import { CartIcon as CartPngIcon } from '../icons/CartIcon';
import { useTranslation } from '../../lib/i18n-client';
import { formatPrice } from '../../lib/currency';
import type { CurrencyCode } from '../../lib/currency';
import type { ProductLabel } from '../ProductLabels';

const BAG_ICON_PATH = '/assets/home/icons/bag.svg';

interface ProductCardGridProps {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    image: string | null;
    inStock: boolean;
    categories: Array<{
      id: string;
      slug: string;
      title: string;
    }>;
    brand: { id: string; name: string } | null;
    labels?: ProductLabel[];
    compareAtPrice?: number | null;
    originalPrice?: number | null;
    discountPercent?: number | null;
  };
  currency: CurrencyCode;
  isInWishlist: boolean;
  isInCompare: boolean;
  isAddingToCart: boolean;
  imageError: boolean;
  isCompact?: boolean;
  onImageError: () => void;
  onWishlistToggle: (e: MouseEvent) => void;
  onCompareToggle: (e: MouseEvent) => void;
  onAddToCart: (e: MouseEvent) => void;
}

/**
 * Grid view layout for ProductCard
 */
export function ProductCardGrid({
  product,
  currency,
  isInWishlist,
  isInCompare,
  isAddingToCart,
  imageError,
  isCompact = false,
  onImageError,
  onWishlistToggle,
  onCompareToggle,
  onAddToCart,
}: ProductCardGridProps) {
  const { t } = useTranslation();
  const imageWrapperHeight = isCompact ? 'h-44' : 'h-56';

  return (
    <article className="relative w-full max-w-[20rem] rounded-3xl bg-white p-4 shadow-[0_6px_24px_rgba(18,42,38,0.05)] transition-shadow hover:shadow-[0_8px_28px_rgba(18,42,38,0.08)] group">
      {/* Dots row — like Trending section */}
      <div className="mb-4 flex gap-1">
        {Array.from({ length: 7 }).map((_, index) => (
          <span
            key={`${product.slug}-dot-${index}`}
            className={`h-1 w-6 rounded-full ${index === 0 ? 'bg-[#122a26]' : 'bg-[#d9d9d9]'}`}
          />
        ))}
      </div>

      {/* Product Image */}
      <div className={`relative mb-4 ${imageWrapperHeight} overflow-hidden`}>
        <ProductCardImage
          slug={product.slug}
          image={product.image}
          title={product.title}
          labels={product.labels}
          imageError={imageError}
          onImageError={onImageError}
          isCompact={isCompact}
          fillContainer
        />
        <ProductCardActions
          isInWishlist={isInWishlist}
          isInCompare={isInCompare}
          isAddingToCart={isAddingToCart}
          inStock={product.inStock}
          isCompact={isCompact}
          onWishlistToggle={onWishlistToggle}
          onCompareToggle={onCompareToggle}
          onAddToCart={onAddToCart}
          showOnHover
        />
      </div>

      {/* Product Info — trending style */}
      <ProductCardInfo
        slug={product.slug}
        title={product.title}
        brandName={product.brand?.name}
        categoryName={product.categories[0]?.title}
        price={product.price}
        originalPrice={product.originalPrice}
        compareAtPrice={product.compareAtPrice}
        discountPercent={product.discountPercent}
        currency={currency}
        isCompact={isCompact}
        variant="trending"
      />

      {/* Price + Shop + Bag row — like Trending */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-base font-extrabold leading-none text-black">
          {formatPrice(product.price ?? 0, currency)}
        </span>
        <div className="flex items-center gap-3">
          <Link
            href={`/products/${product.slug}`}
            className="rounded-lg border-2 border-[#dcc090] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[#dcc090] transition-colors hover:bg-[#dcc090]/10"
          >
            {t('common.buttons.shop', 'Shop')}
          </Link>
          <Button
            type="button"
            variant="icon"
            size="icon"
            onClick={onAddToCart}
            disabled={!product.inStock || isAddingToCart}
            className="h-10 w-10"
            title={product.inStock ? t('common.buttons.addToCart') : t('common.stock.outOfStock')}
            aria-label={product.inStock ? t('common.ariaLabels.addToCart') : t('common.ariaLabels.outOfStock')}
          >
            {isAddingToCart ? (
              <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <Image src={BAG_ICON_PATH} alt="" width={20} height={20} aria-hidden />
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}

