'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { ProductsCatalogCard } from '../../app/products/components/ProductsCatalogCard';
import {
  getCategoryLabel,
  getSectionLabel,
  getSizeLabel,
  toCatalogProduct,
  type CatalogProduct,
} from '../../app/products/components/catalogProductLabels';
import { HomeSectionTitle } from './HomeSectionTitle';
import { HomeActionButton } from './HomeActionButton';
import { HOME_ASSET_PATHS } from './homePage.data';
import { useTranslation } from '@/lib/i18n-client';

const TRENDING_ITEMS_PER_PAGE = 3;
/** Desktop track width matches original compact card width. */
const TRENDING_CARD_WIDTH_REM = 11;
const TRENDING_CARD_GAP_REM = 0.75;
const TRENDING_TRACK_STEP_REM = TRENDING_CARD_WIDTH_REM + TRENDING_CARD_GAP_REM;
/** Viewport for three cards (3×width + 2×gap) + small buffer so right card/shadow is not clipped */
const TRENDING_VIEWPORT_WIDTH_REM =
  TRENDING_CARD_WIDTH_REM * 3 + TRENDING_CARD_GAP_REM * 2 + 0.25;

interface ApiProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string | null;
  images?: string[];
  inStock?: boolean;
  categories?: Array<{ id: string; slug: string; title: string }>;
  brand?: { id: string; name: string } | null;
  skus?: string[];
  colors?: string[];
  originalPrice?: number | null;
  defaultVariantId?: string | null;
  defaultVariantStock?: number;
  defaultSku?: string;
}

interface ProductsResponse {
  data: ApiProduct[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

const TRENDING_FEATURED_PAGE_SIZE = 100;
const PLACEHOLDER_IMAGE = HOME_ASSET_PATHS.packMark;

function mapApiProductToCatalogProduct(product: ApiProduct): CatalogProduct {
  const base = toCatalogProduct({
    id: product.id,
    slug: product.slug,
    title: product.title,
    price: product.price ?? 0,
    image: product.image,
    images: product.images,
    inStock: product.inStock,
    originalPrice: product.originalPrice ?? null,
    defaultVariantId: product.defaultVariantId ?? null,
    defaultVariantStock: product.defaultVariantStock ?? 0,
    defaultSku: product.defaultSku ?? '',
    categories: product.categories,
    skus: product.skus,
    colors: product.colors,
  });
  if (!base.image && (base.images?.length ?? 0) === 0) {
    return { ...base, image: PLACEHOLDER_IMAGE };
  }
  return base;
}

/** Group items by category label so same-category items are side-by-side. */
function groupCatalogByCategory(products: CatalogProduct[]): CatalogProduct[] {
  const byCategory = new Map<string, CatalogProduct[]>();
  for (const product of products) {
    const section = getSectionLabel(product);
    const key = getCategoryLabel(product, section) || 'Other';
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(product);
  }
  const result: CatalogProduct[] = [];
  byCategory.forEach((group) => result.push(...group));
  return result;
}

/**
 * Trending section that displays featured (favorite) products from API with the same card as the products catalog.
 */
export function TrendingFeaturedSection() {
  const { t } = useTranslation();
  const desktopViewportRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const pageStartIndices = Array.from({ length: Math.max(1, Math.ceil(items.length / TRENDING_ITEMS_PER_PAGE)) }, (_, index) =>
    Math.min(index * TRENDING_ITEMS_PER_PAGE, Math.max(0, items.length - TRENDING_ITEMS_PER_PAGE))
  ).filter((startIndex, index, allStartIndices) => index === 0 || startIndex !== allStartIndices[index - 1]);
  const maxPage = Math.max(0, pageStartIndices.length - 1);
  const startIndex = pageStartIndices[currentPage] ?? 0;
  const n = items.length;
  const visibleItems =
    n <= TRENDING_ITEMS_PER_PAGE
      ? items
      : [items[startIndex], items[(startIndex + 1) % n], items[(startIndex + 2) % n]].filter(Boolean);
  const hasMultiplePages = maxPage > 0;
  const visibleIndices = new Set(
    n > 0 ? [startIndex, (startIndex + 1) % n, (startIndex + 2) % n] : []
  );
  const prevIndices =
    n === 0
      ? []
      : [(startIndex - 3 + n) % n, (startIndex - 2 + n) % n, (startIndex - 1 + n) % n]
          .filter((i, index, all) => !visibleIndices.has(i) && all.indexOf(i) === index);
  const nextIndices =
    n === 0
      ? []
      : [
          (startIndex + TRENDING_ITEMS_PER_PAGE) % n,
          (startIndex + TRENDING_ITEMS_PER_PAGE + 1) % n,
          (startIndex + TRENDING_ITEMS_PER_PAGE + 2) % n,
        ].filter((i, index, all) => !visibleIndices.has(i) && all.indexOf(i) === index);
  const previousPreviewItems = prevIndices.map((i) => items[i]).filter(Boolean);
  const nextPreviewItems = nextIndices.map((i) => items[i]).filter(Boolean);

  const playCircularTransition = useCallback((direction: 'prev' | 'next') => {
    const viewport = desktopViewportRef.current;
    if (!viewport || typeof viewport.animate !== 'function') {
      return;
    }

    const moveX = direction === 'next' ? -16 : 16;
    const tilt = direction === 'next' ? -2.5 : 2.5;

    viewport.animate(
      [
        { transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)' },
        { transform: `translate3d(${moveX}px, -14px, 0) rotate(${tilt}deg) scale(0.992)`, offset: 0.45 },
        { transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)' },
      ],
      {
        duration: 460,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }
    );
  }, []);

  const goPrev = useCallback(() => {
    playCircularTransition('prev');
    setCurrentPage((p) => (p === 0 ? maxPage : p - 1));
  }, [maxPage, playCircularTransition]);
  const goNext = useCallback(() => {
    playCircularTransition('next');
    setCurrentPage((p) => (p >= maxPage ? 0 : p + 1));
  }, [maxPage, playCircularTransition]);

  const fetchFeatured = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const aggregatedItems: ApiProduct[] = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const response = await apiClient.get<ProductsResponse>('/api/v1/products', {
          params: {
            filter: 'featured',
            limit: String(TRENDING_FEATURED_PAGE_SIZE),
            page: String(currentPage),
          },
        });

        const pageItems = Array.isArray(response?.data) ? response.data : [];
        aggregatedItems.push(...pageItems);
        totalPages = Math.max(1, response?.meta?.totalPages ?? 1);
        currentPage += 1;
      } while (currentPage <= totalPages);

      const seenIds = new Set<string>();
      const mapped: CatalogProduct[] = aggregatedItems
        .filter((p) => {
          const id = p.id?.trim() ?? '';
          if (!id || seenIds.has(id)) return false;
          seenIds.add(id);
          return true;
        })
        .map((p) => {
          const mappedProduct = mapApiProductToCatalogProduct(p);
          if (!mappedProduct.image && !mappedProduct.images?.length) {
            return { ...mappedProduct, image: PLACEHOLDER_IMAGE };
          }
          return mappedProduct;
        });
      setItems(groupCatalogByCategory(mapped));
    } catch (err) {
      console.error('TrendingFeaturedSection: failed to load featured products', err);
      setError('load_error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  useEffect(() => {
    setCurrentPage(0);
  }, [items.length]);

  /** Duplicating the track lets the carousel loop when there are many items; with ≤3, it shows the same product twice in the viewport. */
  const duplicateDesktopTrack = n > TRENDING_ITEMS_PER_PAGE;
  const desktopTrackItems = duplicateDesktopTrack ? [...items, ...items] : items;
  const desktopTrackWidthRem =
    desktopTrackItems.length > 0
      ? desktopTrackItems.length * TRENDING_TRACK_STEP_REM - TRENDING_CARD_GAP_REM
      : undefined;

  const firstVisible = visibleItems[0];
  const firstSection = firstVisible ? getSectionLabel(firstVisible) : '';
  const footerCategoryLabel = firstVisible ? getCategoryLabel(firstVisible, firstSection) : '';
  const leftPreviewAnchor = previousPreviewItems[1] ?? previousPreviewItems[0];
  const leftPreviewSection = leftPreviewAnchor ? getSectionLabel(leftPreviewAnchor) : '';
  const leftPreviewCategoryLabel = leftPreviewAnchor
    ? getCategoryLabel(leftPreviewAnchor, leftPreviewSection)
    : '';
  const rightPreviewAnchor = nextPreviewItems[1] ?? nextPreviewItems[0];
  const rightPreviewSection = rightPreviewAnchor ? getSectionLabel(rightPreviewAnchor) : '';
  const rightPreviewCategoryLabel = rightPreviewAnchor
    ? getCategoryLabel(rightPreviewAnchor, rightPreviewSection)
    : '';

  if (error) {
    return (
      <section className="flex flex-col gap-8">
        <HomeSectionTitle title={t('home.homepage.trending.title')} centered={false} />
        <div className="flex items-center justify-center gap-4 py-8">
          <p className="text-[#414141]">{error === 'load_error' ? t('home.homepage.trending.loadError') : error}</p>
          <button
            type="button"
            onClick={fetchFeatured}
            className="rounded-lg border-2 border-[#122a26] px-4 py-2 text-sm font-medium text-[#122a26] hover:bg-[#122a26]/5"
          >
            {t('home.homepage.common.retry')}
          </button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="flex flex-col gap-8 overflow-x-hidden">
        <div className="flex items-center justify-between gap-6">
          <HomeSectionTitle title={t('home.homepage.trending.title')} centered={false} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-80 w-full animate-pulse rounded-3xl bg-white/60"
            />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="flex flex-col gap-8">
        <div className="flex items-center justify-between gap-6">
          <HomeSectionTitle title={t('home.homepage.trending.title')} centered={false} />
          <HomeActionButton href="/products" label={t('home.homepage.trending.buyCta')} variant="outline" className="hidden sm:inline-flex" />
        </div>
        <p className="py-6 text-center text-[#9d9d9d]">{t('home.homepage.trending.noFeatured')}</p>
      </section>
    );
  }

  return (
    <section className="relative isolate flex flex-col gap-8 overflow-x-visible overflow-y-hidden pb-6 xl:left-1/2 xl:w-screen xl:max-w-none xl:-translate-x-1/2 xl:overflow-x-clip">
      <div className="flex min-h-[4rem] items-center justify-between gap-3 xl:relative xl:justify-center">
        <HomeSectionTitle
          title={t('home.homepage.trending.title')}
          centered={false}
          className="gap-0 xl:items-center xl:text-center"
        />
        <HomeActionButton
          href="/products"
          label={t('home.homepage.trending.shopCta')}
          variant="outline"
          className="min-h-6 rounded-[0.5rem] border-[2.5px] px-2.5 text-[0.625rem] font-black uppercase tracking-[0.07em] sm:min-h-9 sm:px-5 sm:text-[0.6875rem] sm:font-black sm:tracking-[0.14em] xl:absolute xl:right-[7.5rem]"
        />
      </div>

      <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-2 xl:hidden">
        {visibleItems.map((product, index) => {
          const isMiddleOfThree = visibleItems.length === 3 && index === 1;
          const isSideCard = index !== 1;
          const section = getSectionLabel(product);
          return (
            <div
              key={`trending-mobile-${product.id}-${index}`}
              className={
                index === 1
                  ? 'pt-[14rem]'
                  : index === 2
                    ? '-mt-[10rem] pt-2'
                    : 'pt-4 '
              }
            >
              <ProductsCatalogCard
                product={product}
                sectionLabel={section}
                sizeLabel={getSizeLabel(product)}
                categoryLabel={getCategoryLabel(product, section)}
                className={isSideCard ? 'w-[9.75rem]' : 'w-[10.6rem]'}
                tightenDetailsUnderImage
                imageScaleBoost={0.08}
                imageNudgeDown={isMiddleOfThree}
                compactLayout
                legacyHomeCartIcon
              />
            </div>
          );
        })}
      </div>

      <div className="relative z-0 mt-2 hidden min-w-0 xl:block xl:w-full">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-[calc(150%+8.75rem)]">
          <div className="flex items-end gap-3">
            {previousPreviewItems.map((product, index) => {
              const section = getSectionLabel(product);
              return (
                <div key={`trending-prev-${product.id}-${index}`} className="pointer-events-auto w-[9.5rem] opacity-50 -mt-6">
                  <ProductsCatalogCard
                    product={product}
                    sectionLabel={section}
                    sizeLabel={getSizeLabel(product)}
                    categoryLabel={getCategoryLabel(product, section)}
                    className="w-[9.5rem]"
                    imageScaleBoost={index === 1 ? -0.07 : 0.02}
                    compactLayout
                    legacyHomeCartIcon
                  />
                </div>
              );
            })}
          </div>
          <p className="mt-5 whitespace-nowrap text-center text-[1.5rem] font-extrabold leading-none text-[#122a26]/60">
            {leftPreviewCategoryLabel && leftPreviewCategoryLabel !== 'Featured'
              ? leftPreviewCategoryLabel
              : '—'}
          </p>
        </div>

        <div
          ref={desktopViewportRef}
          className="-mt-24 mx-auto shrink-0 overflow-x-clip overflow-y-clip"
          style={{ width: `${TRENDING_VIEWPORT_WIDTH_REM}rem` }}
        >
          <div
            className="flex touch-pan-y items-end justify-start gap-3 transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(-${startIndex * TRENDING_TRACK_STEP_REM}rem)`,
              width: desktopTrackWidthRem !== undefined ? `${desktopTrackWidthRem}rem` : undefined,
            }}
          >
            {n > 0 &&
              desktopTrackItems.map((product, index) => {
                const isMiddle = index === startIndex + 1;
                const section = getSectionLabel(product);
                return (
                  <div
                    key={`trending-${product.id}-${index}`}
                    className={`w-[11rem] shrink-0 ${isMiddle ? 'pt-28' : 'pt-20'}`}
                  >
                    <ProductsCatalogCard
                      product={product}
                      sectionLabel={section}
                      sizeLabel={getSizeLabel(product)}
                      categoryLabel={getCategoryLabel(product, section)}
                      className="w-[11rem]"
                      imageNudgeDown={isMiddle}
                      compactLayout
                      legacyHomeCartIcon
                    />
                  </div>
                );
              })}
          </div>
        </div>

        <div className="pointer-events-none absolute right-1/2 top-0 translate-x-[calc(150%+8.75rem)]">
          <div className="flex items-end gap-3">
            {nextPreviewItems.map((product, index) => {
              const section = getSectionLabel(product);
              return (
                <div key={`trending-next-${product.id}-${index}`} className="pointer-events-auto w-[9.5rem] opacity-50 -mt-6">
                  <ProductsCatalogCard
                    product={product}
                    sectionLabel={section}
                    sizeLabel={getSizeLabel(product)}
                    categoryLabel={getCategoryLabel(product, section)}
                    className="w-[9.5rem]"
                    imageScaleBoost={index === 1 ? -0.07 : 0.02}
                    compactLayout
                    legacyHomeCartIcon
                  />
                </div>
              );
            })}
          </div>
          <p className="mt-5 whitespace-nowrap text-center text-[1.5rem] font-extrabold leading-none text-[#122a26]/60">
            {rightPreviewCategoryLabel && rightPreviewCategoryLabel !== 'Featured'
              ? rightPreviewCategoryLabel
              : '—'}
          </p>
        </div>
      </div>

      <div className="relative z-20 flex items-center justify-center gap-8 sm:gap-16 lg:gap-32">
        <button
          type="button"
          onClick={goPrev}
          disabled={!hasMultiplePages}
          className="flex h-10 w-10 items-center justify-center text-[#122a26] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={t('home.homepage.trending.previousAria')}
        >
          <ChevronLeft className="h-8 w-8" strokeWidth={2.5} />
        </button>
        <p className="text-center text-xl font-black leading-none text-[#122a26] sm:text-[1.5rem] sm:font-extrabold">
          {footerCategoryLabel && footerCategoryLabel !== 'Featured'
            ? footerCategoryLabel
            : '—'}
        </p>
        <button
          type="button"
          onClick={goNext}
          disabled={!hasMultiplePages}
          className="flex h-10 w-10 items-center justify-center text-[#122a26] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={t('home.homepage.trending.nextAria')}
        >
          <ChevronRight className="h-8 w-8" strokeWidth={2.5} />
        </button>
      </div>
    </section>  
  );
}
