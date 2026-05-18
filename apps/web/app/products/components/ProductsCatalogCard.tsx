'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAddToCart } from '../../../components/hooks/useAddToCart';
import { useCurrency } from '../../../components/hooks/useCurrency';
import { formatCatalogPrice } from '../../../lib/currency';

import { PRODUCT_SECTION_BADGE_CLASS_NAMES } from './catalogProductLabels';

const BAG_ICON_PATH = '/assets/home/icons/bag.svg';
const CATALOG_BAG_ICON_PATH = '/assets/home/icons/bag-catalog.svg';
const IMAGE_SIZES = '(max-width: 640px) 160px, (max-width: 768px) 200px, 240px';

const MAX_IMAGE_DOT_COUNT = 8;

/** Default card elevation (catalog, home, upcoming — same token for consistent look). */
const CARD_SHADOW_TAILWIND = 'shadow-[0_4px_22.5px_rgba(0,0,0,0.08)]';

export interface CatalogProductCardItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string | null;
  images?: string[];
  inStock: boolean;
  originalPrice?: number | null;
  /** From list API — required for local-only cart lines */
  defaultVariantId?: string | null;
  defaultVariantStock?: number;
  defaultSku?: string;
}

interface ProductsCatalogCardProps {
  product: CatalogProductCardItem;
  sectionLabel: string;
  sizeLabel: string;
  categoryLabel: string;
  className?: string;
  tightenDetailsUnderImage?: boolean;
  imageScaleBoost?: number;
  imageNudgeDown?: boolean;
  compactLayout?: boolean;
  /** Slightly wider compact card (e.g. PDP related strip) without affecting home/catalog compact rows. */
  widerCompactCard?: boolean;
  /**
   * Home-only: keep the legacy outline bag asset.
   * Everywhere else uses the filled catalog cart icon (`bag-catalog.svg`).
   */
  legacyHomeCartIcon?: boolean;
  /** When true (e.g. carousel drag), product links do not navigate. */
  shouldBlockProductNavigation?: () => boolean;
  /** Omit default card drop shadow (e.g. trending carousel center hero card). */
  suppressShadow?: boolean;
  /** Optional CTA label override for section-specific wording (e.g. Upcoming => Order). */
  buyButtonLabel?: string;
  /** Merged onto the compact/non-compact product image frame (below pull-up); use for section-specific tweaks. */
  imageFrameClassName?: string;
  /**
   * When true, the hero product image loads eagerly (avoids lazy decode when the card sits in a clipped carousel track).
   */
  eagerProductImage?: boolean;
  /**
   * With `compactLayout`, below `lg` the card uses a viewport-based width so ~half of the next
   * card shows in the horizontal catalog strip (mobile / tablet scroll hint).
   */
  catalogStripMobilePeek?: boolean;
  /** Products catalog: slightly narrower card + shorter image stack (more grid gap from parent). */
  slimCatalogGrid?: boolean;
  /** `/products` — slightly less vertical gap between hero image and details. */
  productsCatalogPage?: boolean;
}

/**
 * Canonical Figma-styled product card (catalog, home, related products, legacy grids).
 */
export function ProductsCatalogCard({
  product,
  sectionLabel,
  sizeLabel,
  categoryLabel,
  className,
  tightenDetailsUnderImage = false,
  imageScaleBoost = 0,
  imageNudgeDown = false,
  compactLayout = false,
  widerCompactCard = false,
  legacyHomeCartIcon = false,
  shouldBlockProductNavigation,
  suppressShadow = false,
  buyButtonLabel = 'Buy',
  imageFrameClassName,
  eagerProductImage = false,
  catalogStripMobilePeek = false,
  slimCatalogGrid = false,
  productsCatalogPage = false,
}: ProductsCatalogCardProps) {
  const displayCurrency = useCurrency();
  const isAmdCurrency = displayCurrency === 'AMD';
  const router = useRouter();
  const { isAddingToCart, addToCart } = useAddToCart({
    productId: product.id,
    productSlug: product.slug,
    title: product.title,
    price: product.price ?? 0,
    image: product.image,
    originalPrice: product.originalPrice ?? null,
    inStock: product.inStock,
    defaultVariantId: product.defaultVariantId ?? null,
    defaultVariantStock: product.defaultVariantStock ?? 0,
    defaultSku: product.defaultSku ?? '',
    sizeLabel,
    categoryLabel,
  });
  const productImages = useMemo(() => {
    const rawImages = product.images && product.images.length > 0 ? product.images : [product.image];
    return rawImages.filter(
      (image, index, images): image is string => Boolean(image) && images.indexOf(image) === index
    );
  }, [product.image, product.images]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const visibleDotCount = Math.min(productImages.length, MAX_IMAGE_DOT_COUNT);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id]);

  useEffect(() => {
    setActiveImageIndex((previous) => {
      if (productImages.length === 0) return 0;
      return previous >= productImages.length ? 0 : previous;
    });
  }, [product.id, productImages.length]);

  useEffect(() => {
    setImageError(false);
  }, [activeImageIndex, product.id]);

  const activeImage = productImages[activeImageIndex] ?? product.image;
  const badgeClassName =
    PRODUCT_SECTION_BADGE_CLASS_NAMES[sectionLabel] ?? PRODUCT_SECTION_BADGE_CLASS_NAMES.Classic;
  const isCompactSize = sizeLabel === 'Compact';

  const stripPeekMaxLg = slimCatalogGrid ? 'max-lg:max-w-[16.5rem]' : 'max-lg:max-w-[19rem]';
  const stripPeekLgW = slimCatalogGrid ? 'lg:w-[11.25rem]' : 'lg:w-[12.75rem]';
  const stripPeekXlW = slimCatalogGrid ? 'xl:w-[11.625rem]' : 'xl:w-[13rem]';
  const stripPeekMobileWidth = slimCatalogGrid
    ? 'max-lg:w-[calc((100vw-3.75rem)/1.65)]'
    : 'max-lg:w-[calc((100vw-3.75rem)/1.5)]';
  const compactArticleWidth =
    catalogStripMobilePeek && compactLayout
      ? // 3.75rem ≈ page px-4 (2rem) + strip gap; /1.5 ≈ half of next card visible in viewport
        `max-sm:w-full max-sm:max-w-full ${stripPeekMobileWidth} ${stripPeekMaxLg} ${stripPeekLgW} ${stripPeekXlW}`
      : widerCompactCard
        ? 'w-[12rem] max-sm:w-[10.75rem]'
        : 'w-[11rem] max-sm:w-[10.25rem]';
  const cardShadowClass = suppressShadow ? 'shadow-none' : CARD_SHADOW_TAILWIND;
  const articleStackClassName = 'z-0 hover:z-[8] focus-within:z-[8]';
  const articleClassName = compactLayout
    ? `relative ${compactArticleWidth} ${articleStackClassName} flex h-full min-h-0 shrink-0 flex-col overflow-visible rounded-[1.125rem] bg-white px-2.5 pb-2.5 pt-2 sm:px-3 sm:pb-3 sm:pt-2.5 ${cardShadowClass}`.trim()
    : `relative w-[14.25rem] max-sm:w-[12.5rem] ${articleStackClassName} shrink-0 overflow-visible rounded-[1.375rem] bg-white px-3 pb-3 pt-2.5 sm:px-3.5 sm:pb-3.5 sm:pt-3 ${cardShadowClass}`.trim();

  const imageWrapperClassName = compactLayout
    ? widerCompactCard
      ? 'h-[15.25rem] sm:h-[18.5rem]'
      : slimCatalogGrid
        ? 'h-[14.75rem] sm:h-[17.75rem] md:h-[13.5rem] lg:h-[16rem]'
        : 'h-[14.75rem] sm:h-[17.75rem]'
    : isCompactSize
      ? 'h-[12.5rem] sm:h-60'
      : 'h-[15rem] sm:h-72';

  const baseImagePullUpClassName = compactLayout
    ? slimCatalogGrid
      ? '-mt-[5.125rem] sm:-mt-[6.25rem] md:-mt-[4.75rem] lg:-mt-[5.75rem]'
      : '-mt-[5.125rem] sm:-mt-[6.25rem]'
    : isCompactSize
      ? '-mt-12 sm:-mt-16'
      : '-mt-[4.5rem] sm:-mt-24';
  const imagePullUpClassName = baseImagePullUpClassName;

  const compactInnerImageHeight = widerCompactCard
    ? 'h-[14.25rem] sm:h-[17.25rem]'
    : slimCatalogGrid
      ? 'h-[13.75rem] sm:h-[16.5rem] md:h-[12.5rem] lg:h-[15rem]'
      : 'h-[13.75rem] sm:h-[16.5rem]';
  const imageInnerClassName = compactLayout
    ? `${compactInnerImageHeight} w-full`
    : 'h-full w-full';
  const compactBaseScale = imageNudgeDown ? 1.05 : 1.12;
  const compactImageScale = compactBaseScale + imageScaleBoost;
  const imageClassName = compactLayout ? 'object-contain origin-bottom' : 'object-contain';

  // Text sizes — upcoming mobile bumped to match Figma (18 px title, 12 px meta, 20 px price).
  const titleClassName = compactLayout
    ? 'text-[0.9375rem] sm:text-[1.0625rem]'
    : 'text-[1.0625rem] sm:text-[1.25rem]';
  const badgeClassNames = compactLayout
    ? `rounded-[0.3125rem] px-[0.3125rem] py-px text-[0.5625rem] font-medium leading-tight sm:rounded-[0.375rem] sm:px-[0.375rem] sm:py-[0.125rem] sm:text-[0.625rem] ${badgeClassName}`
    : `rounded-[0.375rem] px-[0.375rem] py-[0.125rem] text-[0.6875rem] font-medium leading-tight sm:px-[0.4375rem] sm:py-[0.1875rem] sm:text-[0.75rem] ${badgeClassName}`;
  const priceClassName = compactLayout
    ? 'text-[0.75rem] sm:text-[0.98rem]'
    : 'text-[0.875rem] sm:text-[1.05rem]';

  const buyButtonClassName = compactLayout
    ? 'inline-flex h-[1.375rem] min-w-[2.75rem] items-center justify-center rounded-[0.4375rem] border-2 border-[#dcc090] px-1.5 text-[0.6875rem] font-extrabold leading-tight text-[#dcc090] transition-colors hover:bg-[#dcc090]/10 sm:h-6 sm:min-w-[3.25rem] sm:rounded-[0.5rem] sm:px-2 sm:text-[0.75rem]'
    : 'inline-flex h-[1.375rem] min-w-[3.25rem] items-center justify-center rounded-[0.5rem] border-2 border-[#dcc090] px-2 text-[0.8125rem] font-extrabold leading-tight text-[#dcc090] transition-colors hover:bg-[#dcc090]/10 sm:h-[1.625rem] sm:min-w-[3.75rem] sm:px-3 sm:text-[0.875rem]';
  const iconClassName = compactLayout
    ? 'h-3.5 w-3.5 object-contain sm:h-4 sm:w-4'
    : 'h-4 w-4 object-contain sm:h-5 sm:w-5';
  const catalogBagIconClassName = compactLayout
    ? 'h-5 w-6 object-contain sm:h-6 sm:w-[28px]'
    : 'h-6 w-8 object-contain sm:h-7 sm:w-9';

  const detailsOffsetClassName = compactLayout
    ? tightenDetailsUnderImage
      ? slimCatalogGrid
        ? '-mt-[4.125rem] sm:-mt-[5rem] md:-mt-[3.75rem] lg:-mt-[4.5rem]'
        : '-mt-[4.125rem] sm:-mt-[5rem]'
      : productsCatalogPage
        ? slimCatalogGrid
          ? '-mt-[3.25rem] sm:-mt-[3.75rem] md:-mt-[3rem] lg:-mt-[3.5rem]'
          : '-mt-[3.25rem] sm:-mt-[3.75rem]'
        : slimCatalogGrid
          ? '-mt-[2.75rem] sm:-mt-[3.25rem] md:-mt-[2.5rem] lg:-mt-[3rem]'
          : '-mt-[2.75rem] sm:-mt-[3.25rem]'
    : '-mt-4';
  const imageWrapperBottomMarginClassName = compactLayout && productsCatalogPage ? 'mb-1' : 'mb-2';
  const dotsGapClassName = compactLayout ? 'gap-1' : 'gap-[0.3125rem]';
  const dotsMarginClassName = compactLayout
    ? productsCatalogPage
      ? 'mb-0.5'
      : 'mb-1'
    : 'mb-3';
  /** Keeps strip / multi-dot rows same block height so flex row stretch aligns all catalog cards. */
  const dotsRowLayoutClassName = `flex min-h-3 items-center ${dotsGapClassName} ${dotsMarginClassName}`;
  const sizeBadgeClassName = compactLayout
    ? 'inline-flex items-center px-0 py-0 text-[0.5625rem] font-semibold leading-tight text-[#122a26] sm:text-[0.625rem]'
    : 'inline-flex items-center px-0 py-0 text-[0.6875rem] font-semibold leading-tight text-[#122a26] sm:text-[0.75rem]';

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    addToCart();
  };

  const handleBuyNow = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    await addToCart({ openDrawer: false });
    router.push('/checkout');
  };

  const handleProductLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (shouldBlockProductNavigation?.()) {
      event.preventDefault();
    }
  };

  const formattedPrice = formatCatalogPrice(product.price ?? 0, displayCurrency);
  const amountText = isAmdCurrency ? formattedPrice.replace(/\s?֏$/, '') : formattedPrice;

  return (
    <article
      className={`${articleClassName} ${className ?? ''}`.trim()}
      {...(catalogStripMobilePeek ? { 'data-catalog-strip-card': '' } : {})}
    >
      <div
        className={`relative z-10 ${imageWrapperBottomMarginClassName} flex shrink-0 items-end justify-center ${imagePullUpClassName} ${imageWrapperClassName} overflow-visible`.trim()}
      >
        <div
          className={`relative ${imageInnerClassName} transition-transform duration-300 ease-out md:group-hover:-translate-y-1.5 md:group-hover:scale-[1.045] ${imageFrameClassName ?? ''}`.trim()}
        >
          {activeImage && !imageError ? (
            <Link
              href={`/products/${product.slug}`}
              className="block h-full w-full"
              onClick={handleProductLinkClick}
            >
              <Image
                key={`${product.id}-${activeImageIndex}-${activeImage}`}
                src={activeImage}
                alt={product.title}
                fill
                className={imageClassName}
                style={compactLayout ? { transform: `scale(${compactImageScale})` } : undefined}
                sizes={IMAGE_SIZES}
                unoptimized
                loading={eagerProductImage ? 'eager' : undefined}
                onError={() => setImageError(true)}
              />
            </Link>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-[1rem] bg-[#f1f1ef] text-sm font-medium text-[#9d9d9d]">
              No Image
            </div>
          )}
        </div>
      </div>

      <div
        className={`relative z-20 min-h-0 ${compactLayout ? 'flex flex-1 flex-col justify-between' : ''} ${detailsOffsetClassName}`.trim()}
      >
        <div className="min-w-0">
          {visibleDotCount > 0 ? (
            visibleDotCount === 1 ? (
              <div className={`${dotsRowLayoutClassName} justify-center`} aria-hidden="true">
                <span className="block h-[0.25rem] w-[1.625rem] shrink-0 rounded-[0.15625rem] bg-[#122a26]" />
              </div>
            ) : (
              <div
                className={dotsRowLayoutClassName}
                role="tablist"
                aria-label="Product images"
              >
                {Array.from({ length: visibleDotCount }).map((_, index) => {
                  const isActive = index === activeImageIndex;

                  return (
                    <button
                      key={`${product.id}-dot-${index}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setActiveImageIndex(index);
                      }}
                      className="relative flex h-3 w-[1.625rem] cursor-pointer items-center"
                      aria-label={`Select product image ${index + 1}`}
                    >
                      <span
                        className={`block h-[0.25rem] w-full rounded-[0.15625rem] transition-colors ${
                          isActive ? 'bg-[#122a26]' : 'bg-[#d9d9d9]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            <div className={`min-h-3 ${dotsMarginClassName}`} aria-hidden />
          )}

          <Link href={`/products/${product.slug}`} className="block" onClick={handleProductLinkClick}>
            <h3 className={`line-clamp-1 font-extrabold leading-tight text-[#414141] ${titleClassName}`}>
              {product.title}
            </h3>
          </Link>

          <div
            className={
              compactLayout
                ? 'mt-0.5 flex items-center gap-1'
                : 'mt-2 flex items-center gap-1.5'
            }
          >
            <span className={sizeBadgeClassName}>{sizeLabel}</span>
            <span className={badgeClassNames}>{categoryLabel}</span>
          </div>
        </div>

        <div className={compactLayout ? 'mt-2 flex items-center justify-between gap-2' : 'mt-5 flex items-center justify-between gap-3'}>
          <span className={`font-extrabold leading-tight text-black ${priceClassName}`}>
            {amountText}
            {isAmdCurrency ? <span className="ml-1 text-[0.78em]">֏</span> : null}
          </span>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!product.inStock || isAddingToCart}
              className={buyButtonClassName}
            >
              {buyButtonLabel}
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock || isAddingToCart}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:w-8"
              aria-label={product.inStock ? 'Add to cart' : 'Out of stock'}
              title={product.inStock ? 'Add to cart' : 'Out of stock'}
            >
              {isAddingToCart ? (
                <svg
                  className="h-5 w-5 animate-spin text-[#dcc090] sm:h-6 sm:w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <Image
                  src={legacyHomeCartIcon ? BAG_ICON_PATH : CATALOG_BAG_ICON_PATH}
                  alt=""
                  width={legacyHomeCartIcon ? 20 : 32}
                  height={legacyHomeCartIcon ? 20 : 32}
                  aria-hidden
                  className={legacyHomeCartIcon ? iconClassName : catalogBagIconClassName}
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
