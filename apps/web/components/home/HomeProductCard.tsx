'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useAddToCart } from '../hooks/useAddToCart';
import { HOME_ASSET_PATHS } from './homePage.data';
import type { HomeBadgeTone, HomeProductItem } from './homePage.types';

type HomeProductCardSize = 'default' | 'small';

interface HomeProductCardProps {
  item: HomeProductItem;
  size?: HomeProductCardSize;
  /** Slight vertical offset for staggered product rows (e.g. Upcoming 2nd / 4th card). */
  imageNudgeDown?: boolean;
  /** Stronger offset when imageNudgeDown (e.g. Culture center card). */
  imageNudgeDeep?: boolean;
}

const BADGE_CLASS_NAMES: Record<HomeBadgeTone, string> = {
  charcoal: 'bg-[#414141] text-white',
  dark: 'bg-[#122a26] text-white',
  gold: 'bg-[#dcc090] text-white',
  wine: 'bg-[#731818] text-white',
};

/**
 * Product card reused across trending, upcoming, and culture sections.
 */
export function HomeProductCard({
  item,
  size = 'default',
  imageNudgeDown = false,
  imageNudgeDeep = false,
}: HomeProductCardProps) {
  const isSmall = size === 'small';
  const canAddToCart = Boolean(item.slug?.trim() && !item.slug.includes(' '));
  const { isAddingToCart, addToCart } = useAddToCart({
    productId: item.slug ?? '',
    productSlug: item.slug ?? '',
    inStock: true,
  });
  const cardClassName = item.compact
    ? 'w-[10.75rem] rounded-[1.125rem] p-3'
    : isSmall
      ? 'w-full max-w-[14rem] rounded-2xl p-3'
      : 'w-full max-w-[15rem] rounded-3xl p-4';
  const imageWrapperClassName = item.compact
    ? 'h-60'
    : isSmall
      ? 'h-60'
      : 'h-72';
  const opacityClassName = item.faded ? 'opacity-50' : '';

  const productHref = item.slug ? `/products/${item.slug}` : null;
  const imagePullUp = item.compact ? '-mt-16' : isSmall ? '-mt-20' : '-mt-24';
  const imageNudgeClassName =
    imageNudgeDown && !item.compact ? (imageNudgeDeep ? 'translate-y-4' : 'translate-y-1') : '';
  const imageBlock = (
    <div
      className={`relative z-10 mb-2 ${imagePullUp} ${imageWrapperClassName} overflow-visible ${imageNudgeClassName}`.trim()}
    >
      {productHref ? (
        <Link href={productHref} className="block h-full w-full">
          <Image
            src={item.imageSrc}
            alt={item.name}
            fill
            className="object-contain"
            sizes="240px"
          />
        </Link>
      ) : (
        <Image
          src={item.imageSrc}
          alt={item.name}
          fill
          className="object-contain"
          sizes="240px"
        />
      )}
    </div>
  );
  const titleClassName = isSmall ? 'text-lg' : 'text-xl';
  const titleBlock = productHref ? (
    <Link href={productHref}>
      <h3 className={`font-extrabold leading-none text-[#414141] ${titleClassName}`}>{item.name}</h3>
    </Link>
  ) : (
    <h3 className={`font-extrabold leading-none text-[#414141] ${titleClassName}`}>{item.name}</h3>
  );

  const dotsClassName = isSmall ? 'h-0.5 w-4' : 'h-1 w-6';
  const priceClassName = isSmall ? 'text-base' : 'text-lg';
  const actionClassName = isSmall
    ? 'rounded-md border-2 border-[#dcc090] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#dcc090] transition-colors hover:bg-[#dcc090]/10'
    : 'rounded-lg border-2 border-[#dcc090] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[#dcc090] transition-colors hover:bg-[#dcc090]/10';
  const iconSizeClassName = isSmall ? 'h-4 w-4' : 'h-5 w-5';
  const metaMt = isSmall ? 'mt-1.5' : 'mt-2';
  const priceMt = isSmall ? 'mt-3' : 'mt-4';
  const dotsSpacing = isSmall ? 'mt-0 mb-2' : 'mt-0 mb-3';

  return (
    <article className={`relative z-10 overflow-visible rounded-3xl bg-white ${cardClassName} ${opacityClassName}`.trim()}>
      {imageBlock}
      <div className={`flex gap-0.5 ${dotsSpacing}`}>
        {Array.from({ length: 7 }).map((_, index) => (
          <span
            key={`${item.name}-${index}`}
            className={`rounded-full ${dotsClassName} ${index === 0 ? 'bg-[#122a26]' : 'bg-[#d9d9d9]'}`}
          />
        ))}
      </div>
      {titleBlock}
      <div className={`flex items-center gap-2 ${metaMt}`}>
        <span className="text-xs font-medium text-[#9d9d9d]">{item.size}</span>
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${BADGE_CLASS_NAMES[item.badgeTone]}`}>
          {item.badge}
        </span>
      </div>
      <div className={`flex items-center justify-between gap-2 ${priceMt}`}>
        <span className={`font-extrabold leading-none text-black ${priceClassName}`}>{item.price || '\u00A0'}</span>
        <div className="flex items-center gap-2">
          {productHref ? (
            <Link href={productHref} className={actionClassName}>
              {item.actionLabel}
            </Link>
          ) : (
            <button type="button" className={actionClassName}>
              {item.actionLabel}
            </button>
          )}
          {canAddToCart ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                addToCart();
              }}
              disabled={isAddingToCart}
              className={`shrink-0 ${iconSizeClassName} transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Add to cart"
              title="Add to cart"
            >
              <img
                src={HOME_ASSET_PATHS.bagIcon}
                alt=""
                className="h-full w-full object-contain"
                aria-hidden="true"
              />
            </button>
          ) : (
            <img
              src={HOME_ASSET_PATHS.bagIcon}
              alt=""
              className={`object-contain ${iconSizeClassName}`}
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </article>
  );
}
