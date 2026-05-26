'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n-client';
import {
  BAG_ICON_PATH,
  CATALOG_BAG_ICON_PATH,
  IMAGE_SIZES,
} from './productsCatalogCardImage.utils';
import type { useProductsCatalogCard } from './hooks/useProductsCatalogCard';

type ProductsCatalogCardViewProps = ReturnType<typeof useProductsCatalogCard>;

export function ProductsCatalogCardView({
  presentation,
  product,
  className,
  compactLayout,
  legacyHomeCartIcon,
  catalogStripMobilePeek,
  productsCatalogPage = false,
  imageFrameClassName,
  eagerProductImage = false,
  buyButtonLabel,
  activeImage,
  activeImageIndex,
  imageError,
  visibleDotCount,
  setActiveImageIndex,
  setImageError,
  handleAddToCart,
  handleBuyNow,
  handleShopNavigate,
  handleProductLinkClick,
  handleImageLoadComplete,
  isAddingToCart,
  amountText,
  isAmdCurrency,
  sizeLabel,
  categoryLabel,
  trendingSectionCard = false,
  showUnifiedNavCta = false,
  catalogBuyOnlyCta = false,
}: ProductsCatalogCardViewProps) {
  const { t } = useTranslation();
  const catalogBuyLabel = buyButtonLabel ?? 'Buy';
  const unifiedNavButtonLabel =
    buyButtonLabel ?? (trendingSectionCard ? t('home.homepage.trending.shopCta') : catalogBuyLabel);

  const {
    articleClassName,
    imageWrapperClassName,
    imagePullUpClassName,
    imageInnerClassName,
    imageObjectClassName,
    imageContentFrameClassName,
    imageTransformStyle,
    imageTransformOrigin,
    heroLinkUsesItemsEnd,
    titleClassName,
    badgeClassNames,
    priceClassName,
    buyButtonClassName,
    unifiedShopButtonClassName,
    catalogBuyOnlyButtonClassName,
    iconClassName,
    catalogBagIconClassName,
    trendingShopBagIconClassName,
    detailsOffsetClassName,
    imageWrapperBottomMarginClassName,
    catalogDetailsLayoutClassName,
    catalogDetailsPaddingClassName,
    catalogPriceRowClassName,
    dotsRowLayoutClassName,
    dotsMarginClassName,
    sizeBadgeClassName,
  } = presentation;

  return (
    <article
      className={`${articleClassName} ${className ?? ''}`.trim()}
      {...(catalogStripMobilePeek ? { 'data-catalog-strip-card': '' } : {})}
    >
      <div
        className={`relative z-10 ${imageWrapperBottomMarginClassName} flex shrink-0 items-end justify-center ${imagePullUpClassName} ${imageWrapperClassName} overflow-visible`.trim()}
      >
        <div
          className={`relative ${imageInnerClassName} transition-transform duration-300 ease-out md:group-hover:-translate-y-1.5 md:group-hover:scale-[1.045] ${productsCatalogPage ? 'max-sm:overflow-visible' : ''} ${imageFrameClassName ?? ''}`.trim()}
        >
          {activeImage && !imageError ? (
            <Link
              href={`/products/${product.slug}`}
              className={`flex h-full w-full justify-center ${heroLinkUsesItemsEnd ? 'items-end' : 'items-center'}`}
              onClick={handleProductLinkClick}
            >
              <span className={imageContentFrameClassName}>
                <Image
                  key={`${product.id}-${activeImageIndex}-${activeImage}`}
                  src={activeImage}
                  alt={product.title}
                  fill
                  className={imageObjectClassName}
                  style={
                    imageTransformStyle || imageTransformOrigin
                      ? {
                          ...(imageTransformStyle ? { transform: imageTransformStyle } : {}),
                          ...(imageTransformOrigin ? { transformOrigin: imageTransformOrigin } : {}),
                        }
                      : undefined
                  }
                  sizes={IMAGE_SIZES}
                  unoptimized
                  loading={eagerProductImage ? 'eager' : undefined}
                  onLoadingComplete={handleImageLoadComplete}
                  onError={() => setImageError(true)}
                />
              </span>
            </Link>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-[1rem] bg-[#f1f1ef] text-sm font-medium text-[#9d9d9d]">
              No Image
            </div>
          )}
        </div>
      </div>

      <div
        className={`relative z-20 min-h-0 ${catalogDetailsLayoutClassName} ${detailsOffsetClassName} ${catalogDetailsPaddingClassName}`.trim()}
      >
        <div className="min-w-0">
          {visibleDotCount > 0 ? (
            visibleDotCount === 1 ? (
              <div className={dotsRowLayoutClassName} aria-hidden="true">
                <span className="block h-[0.25rem] w-[1.625rem] shrink-0 rounded-[0.15625rem] bg-[#122a26]" />
              </div>
            ) : (
              <div className={dotsRowLayoutClassName} role="tablist" aria-label="Product images">
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

          <div className={compactLayout ? 'mt-0.5 flex items-center gap-1' : 'mt-2 flex items-center gap-1.5'}>
            <span className={sizeBadgeClassName}>{sizeLabel}</span>
            <span className={badgeClassNames}>{categoryLabel}</span>
          </div>
        </div>

        <div className={catalogPriceRowClassName}>
          <span className={`font-extrabold leading-tight text-black ${priceClassName}`}>
            {amountText}
            {isAmdCurrency ? <span className="ml-1 text-[0.78em]">֏</span> : null}
          </span>

          {showUnifiedNavCta ? (
            <button
              type="button"
              onClick={handleShopNavigate}
              className={unifiedShopButtonClassName}
              aria-label={`${unifiedNavButtonLabel} — ${product.title}`}
            >
              <span>{unifiedNavButtonLabel}</span>
              <Image
                src={legacyHomeCartIcon ? BAG_ICON_PATH : CATALOG_BAG_ICON_PATH}
                alt=""
                width={legacyHomeCartIcon ? 16 : 24}
                height={legacyHomeCartIcon ? 16 : 24}
                aria-hidden
                className={legacyHomeCartIcon ? iconClassName : trendingShopBagIconClassName}
              />
            </button>
          ) : catalogBuyOnlyCta ? (
            <button
              type="button"
              onClick={handleShopNavigate}
              className={catalogBuyOnlyButtonClassName}
              aria-label={`${catalogBuyLabel} — ${product.title}`}
            >
              {catalogBuyLabel}
            </button>
          ) : (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!product.inStock || isAddingToCart}
                className={buyButtonClassName}
              >
                {catalogBuyLabel}
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
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
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
          )}
        </div>
      </div>
    </article>
  );
}
