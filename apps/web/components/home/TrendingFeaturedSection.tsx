'use client';

import { useState, useEffect, useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
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

const ITEMS_PER_PAGE = 3;
/** Desktop card width — matches products catalog `xl:w-[13rem]`. */
const CARD_WIDTH_REM = 13;
const CARD_GAP_REM = 0.75;
/** Tight cluster width: 3 cards + 2 gaps (one focal page's product row). */
const CLUSTER_INNER_REM = CARD_WIDTH_REM * 3 + CARD_GAP_REM * 2;
/** Each track slot reserves a bit more than the cluster so adjacent (faded) clusters breathe. */
const PAGE_FRAME_REM = CLUSTER_INNER_REM + 2;
/** Mobile trending cluster widths (rem); slot wider than inner cluster to avoid coverflow clip. */
const MOBILE_CLUSTER_GAP_REM = 1;
const MOBILE_SIDE_CARD_MAX_REM = 9.25;
const MOBILE_MIDDLE_CARD_MAX_REM = 10;
const MOBILE_CLUSTER_INNER_REM = MOBILE_SIDE_CARD_MAX_REM + MOBILE_CLUSTER_GAP_REM + MOBILE_MIDDLE_CARD_MAX_REM;
const MOBILE_PAGE_FRAME_REM = MOBILE_CLUSTER_INNER_REM + 3.5;
const XL_MEDIA_QUERY = '(min-width: 1280px)';
const TRACK_TRANSITION_MS = 520;
const TRACK_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

const TRENDING_FEATURED_PAGE_SIZE = 100;
const PLACEHOLDER_IMAGE = HOME_ASSET_PATHS.packMark;

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

/** Group items by category label so same-category items become one page. */
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

interface TrendingPage {
  key: string;
  items: CatalogProduct[];
  categoryLabel: string;
}

/** Slice catalog into 3-card pages; pad short tail by wrapping so each page always has 3 cards. */
function buildTrendingPages(items: CatalogProduct[]): TrendingPage[] {
  if (items.length === 0) return [];
  const pages: TrendingPage[] = [];
  for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
    const slice = items.slice(i, i + ITEMS_PER_PAGE);
    while (slice.length < ITEMS_PER_PAGE) {
      slice.push(items[slice.length % items.length]);
    }
    const anchor = slice[1] ?? slice[0];
    const section = anchor ? getSectionLabel(anchor) : '';
    const rawLabel = anchor ? getCategoryLabel(anchor, section) : '';
    const categoryLabel = rawLabel && rawLabel !== 'Featured' ? rawLabel : section || 'Featured';
    pages.push({ key: `trending-page-${i}`, items: slice, categoryLabel });
  }
  return pages;
}

function subscribeXlMediaQuery(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const mq = window.matchMedia(XL_MEDIA_QUERY);
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function getXlMediaQuerySnapshot(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia(XL_MEDIA_QUERY).matches;
}

function getServerXlMediaQuerySnapshot(): boolean {
  return false;
}

function useIsXlBreakpoint(): boolean {
  return useSyncExternalStore(subscribeXlMediaQuery, getXlMediaQuerySnapshot, getServerXlMediaQuerySnapshot);
}

/**
 * Trending section that displays featured (favorite) products from API.
 * Coverflow: previous category cluster on the left (faded), focal cluster centered,
 * next on the right — slides with arrows on all breakpoints; `xl` uses wide cards,
 * below `xl` keeps the compact staggered mobile card layout.
 */
export function TrendingFeaturedSection() {
  const { t } = useTranslation();
  const isXl = useIsXlBreakpoint();
  const [items, setItems] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDisplayIndex, setActiveDisplayIndex] = useState(0);
  const [suppressTransition, setSuppressTransition] = useState(false);
  const wrapResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pages = useMemo(() => buildTrendingPages(items), [items]);
  const totalPages = pages.length;
  const hasMultiplePages = totalPages > 1;
  const safeDisplayIndex =
    totalPages > 1 ? Math.min(Math.max(activeDisplayIndex, 0), totalPages + 1) : 0;
  const safeCurrent =
    totalPages <= 1
      ? 0
      : safeDisplayIndex === 0
        ? totalPages - 1
        : safeDisplayIndex === totalPages + 1
          ? 0
          : safeDisplayIndex - 1;

  const prevIdx = totalPages > 0 ? (safeCurrent - 1 + totalPages) % totalPages : 0;
  const nextIdx = totalPages > 0 ? (safeCurrent + 1) % totalPages : 0;
  const currentLabel = pages[safeCurrent]?.categoryLabel ?? '—';
  const prevLabel = totalPages > 1 ? pages[prevIdx]?.categoryLabel ?? '' : '';
  const nextLabel = totalPages > 1 ? pages[nextIdx]?.categoryLabel ?? '' : '';

  const fetchFeatured = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const aggregatedItems: ApiProduct[] = [];
      let pageCursor = 1;
      let totalApiPages = 1;

      do {
        const response = await apiClient.get<ProductsResponse>('/api/v1/products', {
          params: {
            filter: 'featured',
            limit: String(TRENDING_FEATURED_PAGE_SIZE),
            page: String(pageCursor),
          },
        });
        const pageItems = Array.isArray(response?.data) ? response.data : [];
        aggregatedItems.push(...pageItems);
        totalApiPages = Math.max(1, response?.meta?.totalPages ?? 1);
        pageCursor += 1;
      } while (pageCursor <= totalApiPages);

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
    setSuppressTransition(false);
    setActiveDisplayIndex(items.length > 0 && totalPages > 1 ? 1 : 0);
  }, [items.length, totalPages]);

  useEffect(() => {
    if (totalPages <= 1) return;
    if (wrapResetTimeoutRef.current) {
      clearTimeout(wrapResetTimeoutRef.current);
      wrapResetTimeoutRef.current = null;
    }

    if (safeDisplayIndex !== 0 && safeDisplayIndex !== totalPages + 1) return;

    const normalizedDisplayIndex = safeDisplayIndex === 0 ? totalPages : 1;
    wrapResetTimeoutRef.current = setTimeout(() => {
      setSuppressTransition(true);
      setActiveDisplayIndex(normalizedDisplayIndex);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setSuppressTransition(false));
      });
    }, TRACK_TRANSITION_MS);

    return () => {
      if (wrapResetTimeoutRef.current) {
        clearTimeout(wrapResetTimeoutRef.current);
        wrapResetTimeoutRef.current = null;
      }
    };
  }, [safeDisplayIndex, totalPages]);

  const goPrev = useCallback(() => {
    if (!hasMultiplePages) return;
    if (suppressTransition) return;
    setActiveDisplayIndex((prev) => prev - 1);
  }, [hasMultiplePages, suppressTransition]);

  const goNext = useCallback(() => {
    if (!hasMultiplePages) return;
    if (suppressTransition) return;
    setActiveDisplayIndex((prev) => prev + 1);
  }, [hasMultiplePages, suppressTransition]);

  if (error) {
    return (
      <section className="flex flex-col gap-8">
        <HomeSectionTitle title={t('home.homepage.trending.title')} centered={false} />
        <div className="flex items-center justify-center gap-4 py-8">
          <p className="text-[#414141]">
            {error === 'load_error' ? t('home.homepage.trending.loadError') : error}
          </p>
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
            <div key={i} className="h-80 w-full animate-pulse rounded-3xl bg-white/60" />
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
          <HomeActionButton
            href="/products"
            label={t('home.homepage.trending.buyCta')}
            variant="outline"
            className="hidden sm:inline-flex"
          />
        </div>
        <p className="py-6 text-center text-[#9d9d9d]">{t('home.homepage.trending.noFeatured')}</p>
      </section>
    );
  }

  return (
    <section className="relative isolate flex min-w-0 flex-col gap-5 overflow-x-clip overflow-y-visible pb-6 sm:gap-8 xl:left-1/2 xl:w-screen xl:max-w-none xl:-translate-x-1/2 xl:gap-5">
      <div className="relative z-30 flex min-h-[4rem] min-w-0 items-center justify-between gap-3 xl:relative xl:z-20 xl:-translate-y-1 xl:justify-center">
        <HomeSectionTitle
          title={t('home.homepage.trending.title')}
          centered={false}
          className="gap-0 xl:items-center xl:text-center"
          titleClassName="xl:whitespace-nowrap"
        />
        <HomeActionButton
          href="/products"
          label={t('home.homepage.trending.shopCta')}
          variant="outline"
          className="!w-fit !min-h-8 !translate-y-0 !rounded-[0.5rem] !border-[2.5px] !border-[#dcc090] !px-2.5 !py-2 !text-[0.75rem] !font-black !uppercase !leading-tight !tracking-[0.07em] sm:!w-auto sm:!min-h-9 sm:!translate-y-0 sm:!rounded-[0.5rem] sm:!border-[2.5px] sm:!border-[#dcc090] sm:!px-5 sm:!py-0 sm:!text-[0.75rem] sm:!font-black sm:!leading-tight sm:!tracking-[0.14em] xl:absolute xl:!top-[46%] xl:right-[7.5rem] xl:z-30 xl:!-translate-y-1/2"
        />
      </div>

      <TrendingCoverflowTrack
        pages={pages}
        currentDisplayIndex={safeDisplayIndex}
        currentLogicalIndex={safeCurrent}
        suppressTransition={suppressTransition}
        isXl={isXl}
      />

      <TrendingPageSlider
        prevLabel={prevLabel}
        currentLabel={currentLabel}
        nextLabel={nextLabel}
        onPrev={goPrev}
        onNext={goNext}
        disabled={!hasMultiplePages}
        prevAria={t('home.homepage.trending.previousAria')}
        nextAria={t('home.homepage.trending.nextAria')}
      />
    </section>
  );
}

interface TrendingCoverflowTrackProps {
  pages: TrendingPage[];
  currentDisplayIndex: number;
  currentLogicalIndex: number;
  suppressTransition: boolean;
  isXl: boolean;
}

/** Horizontal track: focal cluster centered; neighbours fade (same motion on mobile + desktop). */
function TrendingCoverflowTrack({
  pages,
  currentDisplayIndex,
  currentLogicalIndex,
  suppressTransition,
  isXl,
}: TrendingCoverflowTrackProps) {
  const totalPages = pages.length;
  if (totalPages === 0) return null;

  const pageFrameRem = isXl ? PAGE_FRAME_REM : MOBILE_PAGE_FRAME_REM;

  const displaySlots =
    totalPages > 1
      ? [
          { key: `clone-left-${pages[totalPages - 1].key}`, page: pages[totalPages - 1], logicalIndex: totalPages - 1 },
          ...pages.map((page, logicalIndex) => ({ key: page.key, page, logicalIndex })),
          { key: `clone-right-${pages[0].key}`, page: pages[0], logicalIndex: 0 },
        ]
      : [{ key: pages[0].key, page: pages[0], logicalIndex: 0 }];

  const trackTransition = suppressTransition
    ? 'none'
    : `transform ${TRACK_TRANSITION_MS}ms ${TRACK_EASING}`;
  const slotTransition = suppressTransition
    ? 'none'
    : `opacity ${TRACK_TRANSITION_MS}ms ${TRACK_EASING}, transform ${TRACK_TRANSITION_MS}ms ${TRACK_EASING}`;

  return (
    <div className="relative z-0 mt-1 min-w-0 w-full overflow-x-hidden max-sm:mb-2 max-sm:pt-8 sm:max-xl:pt-12">
      <div
        className="flex items-end will-change-transform"
        style={{
          width: `${displaySlots.length * pageFrameRem}rem`,
          // marginLeft: 50% pins track's left edge to parent's horizontal center;
          // translateX then shifts so the focal cluster's center sits at parent center.
          marginLeft: '50%',
          transform: `translateX(-${(currentDisplayIndex + 0.5) * pageFrameRem}rem)`,
          transition: trackTransition,
        }}
      >
        {displaySlots.map(({ key, page, logicalIndex }) => {
          const rawDistance = Math.abs(logicalIndex - currentLogicalIndex);
          const distance = totalPages > 0
            ? Math.min(rawDistance, totalPages - rawDistance)
            : 0;
          const isFocal = distance === 0;
          const isAdjacent = distance === 1;
          const opacity = isFocal ? 1 : isAdjacent ? 0.5 : 0;
          const scale = isFocal ? 1 : 0.78;

          return (
            <div
              key={key}
              aria-hidden={!isFocal}
              className="shrink-0"
              style={{
                width: `${pageFrameRem}rem`,
                opacity,
                transform: `scale(${scale})`,
                transformOrigin: 'center bottom',
                transition: slotTransition,
                pointerEvents: isFocal ? 'auto' : 'none',
              }}
            >
              {isXl ? (
                <DesktopPageCluster
                  items={page.items}
                  eager={isFocal || isAdjacent}
                  label={page.categoryLabel}
                  isFocal={isFocal}
                />
              ) : (
                <MobilePageCluster items={page.items} eager={isFocal || isAdjacent} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface MobilePageClusterProps {
  items: CatalogProduct[];
  eager: boolean;
}

/** Staggered 2-column cluster (legacy mobile home trending layout). */
function MobilePageCluster({ items, eager }: MobilePageClusterProps) {
  return (
    <div
      className="mx-auto grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start justify-items-center gap-x-4 gap-y-3 sm:gap-x-5 sm:gap-y-4"
      style={{ width: `${MOBILE_CLUSTER_INNER_REM}rem` }}
    >
      {items.map((product, index) => {
        const isMiddleOfThree = items.length === 3 && index === 1;
        const section = getSectionLabel(product);
        const mobileCellZ =
          index === 1 ? 'relative z-[3]' : index === 0 ? 'relative z-[2]' : 'relative z-[1]';
        const cellMaxRem = index === 1 ? MOBILE_MIDDLE_CARD_MAX_REM : MOBILE_SIDE_CARD_MAX_REM;
        return (
          <div
            key={`trending-mobile-${product.id}-${index}`}
            className={`${mobileCellZ} flex min-w-0 w-full max-w-full justify-center justify-self-center ${
              index === 1 ? 'pt-[9.75rem]' : index === 2 ? '-mt-[6.75rem] pt-3' : 'pt-3'
            }`}
            style={{ maxWidth: `${cellMaxRem}rem` }}
          >
            <ProductsCatalogCard
              product={product}
              sectionLabel={section}
              sizeLabel={getSizeLabel(product)}
              categoryLabel={getCategoryLabel(product, section)}
              className="!h-auto w-full max-w-none"
              tightenDetailsUnderImage
              imageScaleBoost={0.1}
              imageNudgeDown={isMiddleOfThree}
              compactLayout
              suppressShadow
              eagerProductImage={eager}
              imageFrameClassName="max-sm:origin-bottom max-sm:scale-[0.88] max-sm:-translate-y-3.5"
            />
          </div>
        );
      })}
    </div>
  );
}

interface DesktopPageClusterProps {
  items: CatalogProduct[];
  eager: boolean;
  label: string;
  isFocal: boolean;
}

function DesktopPageCluster({ items, eager, label, isFocal }: DesktopPageClusterProps) {
  const displayLabel = label && label !== 'Featured' ? label : '—';
  return (
    <div
      className={`mx-auto flex flex-col items-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isFocal ? '-translate-y-2' : '-translate-y-[6.25rem]'
      }`}
      style={{ width: `${CLUSTER_INNER_REM}rem` }}
    >
      <div className="flex w-full items-end justify-center gap-3">
        {items.map((product, index) => {
          const isMiddle = index === 1;
          const section = getSectionLabel(product);
          return (
            <div
              key={`${product.id}-${index}`}
              className={`w-[13rem] shrink-0 ${isMiddle ? 'pt-16' : 'pt-4'}`}
            >
              <ProductsCatalogCard
                product={product}
                sectionLabel={section}
                sizeLabel={getSizeLabel(product)}
                categoryLabel={getCategoryLabel(product, section)}
                className="w-[13rem]"
                imageNudgeDown={isMiddle}
                compactLayout
                suppressShadow
                eagerProductImage={eager}
              />
            </div>
          );
        })}
      </div>
      <span
        className={`mt-10 max-w-full truncate leading-none text-[#122a26] ${
          isFocal ? 'text-[2rem] font-black' : 'text-[1.5rem] font-extrabold'
        }`}
      >
        {displayLabel}
      </span>
    </div>
  );
}

interface TrendingPageSliderProps {
  prevLabel: string;
  currentLabel: string;
  nextLabel: string;
  onPrev: () => void;
  onNext: () => void;
  disabled: boolean;
  prevAria: string;
  nextAria: string;
}

/** Bottom slider tab: prev | current (large) | next, flanked by chevron arrows. Mirrors Figma. */
function TrendingPageSlider({
  prevLabel,
  currentLabel,
  nextLabel,
  onPrev,
  onNext,
  disabled,
  prevAria,
  nextAria,
}: TrendingPageSliderProps) {
  const sideLabelBase =
    'truncate text-base font-extrabold leading-none text-[#122a26]/50 sm:text-xl xl:text-[1.5rem]';

  return (
    <div className="relative z-20 mx-auto grid w-full max-w-[34rem] grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 sm:max-w-[44rem] sm:gap-5 xl:flex xl:max-w-none xl:justify-center xl:gap-72">
      <button
        type="button"
        onClick={onPrev}
        disabled={disabled}
        className="col-start-1 row-start-1 flex h-10 w-10 items-center justify-center justify-self-start text-[#122a26] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 xl:-translate-y-16"
        aria-label={prevAria}
      >
        <ChevronLeft className="h-8 w-8" strokeWidth={2.5} />
      </button>
      {/* Mobile-only label strip: on xl labels live under each cluster inside the coverflow. */}
      <div className="col-start-2 row-start-1 flex w-full items-end justify-center gap-3 sm:justify-around sm:gap-6 xl:hidden">
        <span className={`hidden sm:inline ${sideLabelBase}`}>{prevLabel}</span>
        <span
          key={currentLabel}
          className="trending-current-label truncate text-2xl font-black leading-none text-[#122a26] sm:text-[1.75rem]"
          style={{
            animation: `trending-label-pop ${TRACK_TRANSITION_MS}ms ${TRACK_EASING}`,
          }}
        >
          {currentLabel && currentLabel !== 'Featured' ? currentLabel : '—'}
        </span>
        <span className={`hidden sm:inline ${sideLabelBase}`}>{nextLabel}</span>
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="col-start-3 row-start-1 flex h-10 w-10 items-center justify-center justify-self-end text-[#122a26] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 xl:-translate-y-16"
        aria-label={nextAria}
      >
        <ChevronRight className="h-8 w-8" strokeWidth={2.5} />
      </button>
    </div>
  );
}
