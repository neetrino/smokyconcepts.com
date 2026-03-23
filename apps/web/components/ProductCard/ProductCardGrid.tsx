'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { Button } from '../ui/buttons';
import Image from 'next/image';
import { ProductCardImage } from './ProductCardImage';
import { ProductCardInfo } from './ProductCardInfo';
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
  isCompact?: boolean;
  onAddToCart: (e: MouseEvent) => void;
}

/**
 * Grid view layout for ProductCard
 */
export function ProductCardGrid({
  product,
  currency,
  isAddingToCart,
  isCompact = false,
  onAddToCart,
}: ProductCardGridProps) {
  const { t } = useTranslation();
  const imageWrapperHeight = isCompact ? 'h-44' : 'h-56';
  const productImages = useMemo(() => {
    const rawImages = product.images && product.images.length > 0 ? product.images : [product.image];
    return rawImages.filter((image, index, images): image is string => Boolean(image) && images.indexOf(image) === index);
  }, [product.image, product.images]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id]);

  useEffect(() => {
    if (activeImageIndex >= productImages.length) {
      setActiveImageIndex(0);
    }
  }, [activeImageIndex, productImages.length]);

  useEffect(() => {
    setImageError(false);
  }, [activeImageIndex, product.id]);

  const activeImage = productImages[activeImageIndex] || product.image;
  const paginationDots = productImages.length > 0 ? productImages : [product.image || 'fallback-image'];

  return (
    <article className="relative w-full max-w-[20rem] rounded-3xl bg-white p-4 shadow-[0_6px_24px_rgba(18,42,38,0.05)] transition-shadow hover:shadow-[0_8px_28px_rgba(18,42,38,0.08)] group">
      {/* Dots row */}
      <div className="mb-4 flex gap-1">
        {paginationDots.map((_, index) => (
          <button
            key={`${product.slug}-dot-${index}`}
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setActiveImageIndex(index);
            }}
            className={`h-1 rounded-full transition-all ${index === activeImageIndex ? 'w-8 bg-[#122a26]' : 'w-6 bg-[#d9d9d9]'}`}
            aria-label={`${t('common.buttons.viewDetails')} ${index + 1}`}
          />
        ))}
      </div>

      {/* Product Image */}
      <div className={`relative mb-4 ${imageWrapperHeight} overflow-hidden`}>
        <ProductCardImage
          slug={product.slug}
          image={activeImage}
          title={product.title}
          labels={product.labels}
          imageError={imageError}
          onImageError={() => setImageError(true)}
          isCompact={isCompact}
          fillContainer
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
            {t('common.buttons.shop')}
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

