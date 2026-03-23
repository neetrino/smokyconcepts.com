'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { formatPrice } from '../../lib/currency';
import { useCurrency } from '../hooks/useCurrency';
import { HomeProductCard } from './HomeProductCard';
import { HomeSectionTitle } from './HomeSectionTitle';
import { HomeActionButton } from './HomeActionButton';
import { HOME_ASSET_PATHS } from './homePage.data';
import type { HomeProductItem } from './homePage.types';

const TRENDING_ITEMS_PER_PAGE = 3;
const TRENDING_CARD_WIDTH_REM = 14;
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
  categories?: Array<{ id: string; slug: string; title: string }>;
  brand?: { id: string; name: string } | null;
}

interface ProductsResponse {
  data: ApiProduct[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

const TRENDING_FEATURED_LIMIT = 8;
const PLACEHOLDER_IMAGE = HOME_ASSET_PATHS.packMark;

function mapApiProductToHomeItem(product: ApiProduct, priceFormatted: string): HomeProductItem {
  const categoryTitle = product.categories?.[0]?.title ?? product.brand?.name ?? '';
  return {
    name: product.title,
    size: categoryTitle || '—',
    price: priceFormatted,
    imageSrc: product.image ?? PLACEHOLDER_IMAGE,
    badge: categoryTitle || 'Featured',
    badgeTone: 'dark',
    actionLabel: 'Buy',
    slug: product.slug,
  };
}

/** Group items by category (badge), then flatten so same-category items are side-by-side. */
function groupItemsByCategory(items: HomeProductItem[]): HomeProductItem[] {
  const byCategory = new Map<string, HomeProductItem[]>();
  for (const item of items) {
    const key = item.badge || 'Other';
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(item);
  }
  const result: HomeProductItem[] = [];
  byCategory.forEach((group) => result.push(...group));
  return result;
}

/**
 * Trending section that displays featured (favorite) products from API with the same UI as static trending cards.
 */
export function TrendingFeaturedSection() {
  const currency = useCurrency();
  const [items, setItems] = useState<HomeProductItem[]>([]);
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
  const prevIndices = n === 0 ? [] : [(startIndex - 2 + n) % n, (startIndex - 1 + n) % n].filter((i) => !visibleIndices.has(i));
  const nextIndices = n === 0 ? [] : [(startIndex + TRENDING_ITEMS_PER_PAGE) % n, (startIndex + TRENDING_ITEMS_PER_PAGE + 1) % n].filter((i) => !visibleIndices.has(i));
  const previousPreviewItems = prevIndices.map((i) => items[i]).filter(Boolean);
  const nextPreviewItems = nextIndices.map((i) => items[i]).filter(Boolean);

  const goPrev = useCallback(() => {
    setCurrentPage((p) => (p === 0 ? maxPage : p - 1));
  }, [maxPage]);
  const goNext = useCallback(() => {
    setCurrentPage((p) => (p >= maxPage ? 0 : p + 1));
  }, [maxPage]);

  const fetchFeatured = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<ProductsResponse>('/api/v1/products', {
        params: {
          filter: 'featured',
          limit: String(TRENDING_FEATURED_LIMIT),
          page: '1',
        },
      });
      const list = Array.isArray(response?.data) ? response.data : [];
      const seenSlugs = new Set<string>();
      const mapped: HomeProductItem[] = list
        .filter((p) => {
          const slug = p.slug ?? p.id;
          if (seenSlugs.has(slug)) return false;
          seenSlugs.add(slug);
          return true;
        })
        .map((p) => mapApiProductToHomeItem(p, formatPrice(p.price ?? 0, currency)));
      setItems(groupItemsByCategory(mapped));
    } catch (err) {
      console.error('TrendingFeaturedSection: failed to load featured products', err);
      setError('Failed to load');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  useEffect(() => {
    setCurrentPage(0);
  }, [items.length]);

  if (error) {
    return (
      <section className="flex flex-col gap-8">
        <HomeSectionTitle title="Trending" centered={false} />
        <div className="flex items-center justify-center gap-4 py-8">
          <p className="text-[#414141]">{error}</p>
          <button
            type="button"
            onClick={fetchFeatured}
            className="rounded-lg border-2 border-[#122a26] px-4 py-2 text-sm font-medium text-[#122a26] hover:bg-[#122a26]/5"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="flex flex-col gap-8 overflow-x-hidden">
        <div className="flex items-center justify-between gap-6">
          <HomeSectionTitle title="Trending" centered={false} />
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
          <HomeSectionTitle title="Trending" centered={false} />
          <HomeActionButton href="/products" label="Buy" variant="outline" className="hidden sm:inline-flex" />
        </div>
        <p className="py-6 text-center text-[#9d9d9d]">No featured products yet.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8 overflow-x-hidden overflow-y-hidden pb-6">
      <div className="relative flex min-h-[4rem] items-center justify-end">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <HomeSectionTitle title="Trending" centered />
        </div>
        <HomeActionButton href="/products" label="Buy" variant="outline" className="hidden sm:inline-flex" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:hidden">
        {visibleItems.map((item, index) => {
          const isMiddleOfThree = visibleItems.length === 3 && index === 1;
          return (
            <div
              key={`trending-mobile-${item.slug ?? index}-${item.name}`}
              className="pt-16"
            >
              <HomeProductCard item={item} size="small" imageNudgeDown={isMiddleOfThree} imageNudgeDeep />
            </div>
          );
        })}
      </div>

      <div
        className="relative z-10 mx-auto mt-10 hidden w-full min-w-0 max-w-[82rem] items-center gap-4 xl:grid"
        style={{
          gridTemplateColumns: `minmax(0,18rem) ${TRENDING_VIEWPORT_WIDTH_REM}rem minmax(0,18rem)`,
        }}
      >
        <div className="flex min-w-0 items-center justify-end gap-3 pt-32">
          {previousPreviewItems.map((item, index) => (
            <div key={`trending-prev-${item.slug ?? index}-${item.name}`} className="w-[10.75rem] opacity-50">
              <HomeProductCard item={{ ...item, compact: true, faded: true }} size="small" />
            </div>
          ))}
        </div>

        <div
          className="-mt-28 shrink-0 overflow-x-clip overflow-y-clip"
          style={{ width: `${TRENDING_VIEWPORT_WIDTH_REM}rem` }}
        >
          <div
            className="flex touch-pan-y items-end justify-start gap-3 transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(-${startIndex * TRENDING_TRACK_STEP_REM}rem)`,
              width: n > 0 ? `${(n * 2) * TRENDING_TRACK_STEP_REM - TRENDING_CARD_GAP_REM}rem` : undefined,
            }}
          >
            {n > 0 &&
              [...items, ...items].map((item, index) => {
                const isMiddle = index === startIndex + 1;
                return (
                  <div
                    key={`trending-${item.slug ?? index}-${item.name}-${index}`}
                    className="w-[14rem] shrink-0 pt-20"
                  >
                    <HomeProductCard item={item} size="small" imageNudgeDown={isMiddle} imageNudgeDeep />
                  </div>
                );
              })}
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-start gap-3 pt-32">
          {nextPreviewItems.map((item, index) => (
            <div key={`trending-next-${item.slug ?? index}-${item.name}`} className="w-[10.75rem] opacity-50">
              <HomeProductCard item={{ ...item, compact: true, faded: true }} size="small" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-8 sm:gap-16 lg:gap-32">
        <button
          type="button"
          onClick={goPrev}
          disabled={!hasMultiplePages}
          className="flex h-10 w-10 items-center justify-center text-[#122a26] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous"
        >
          <ChevronLeft className="h-8 w-8" strokeWidth={2.5} />
        </button>
        <p className="text-center text-xl font-extrabold text-[#122a26] sm:text-[1.5rem]">
          {visibleItems[0]?.badge && visibleItems[0].badge !== 'Featured'
            ? visibleItems[0].badge
            : '—'}
        </p>
        <button
          type="button"
          onClick={goNext}
          disabled={!hasMultiplePages}
          className="flex h-10 w-10 items-center justify-center text-[#122a26] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next"
        >
          <ChevronRight className="h-8 w-8" strokeWidth={2.5} />
        </button>
      </div>
    </section>
  );
}
