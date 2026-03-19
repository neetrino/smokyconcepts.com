'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/api-client';
import { formatPrice } from '../../lib/currency';
import { useCurrency } from '../hooks/useCurrency';
import { HomeProductCard } from './HomeProductCard';
import { HomeSectionTitle } from './HomeSectionTitle';
import { HomeActionButton } from './HomeActionButton';
import { HOME_ASSET_PATHS } from './homePage.data';
import type { HomeProductItem } from './homePage.types';

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

const UPCOMING_LIMIT = 12;
const CARDS_PER_PAGE = 5;
const PLACEHOLDER_IMAGE = HOME_ASSET_PATHS.packMark;

/** Pagination pill dimensions to match Figma (Group 1321315254): 100×8px, rounded-[12px] */

function mapApiProductToHomeItem(product: ApiProduct, priceFormatted: string): HomeProductItem {
  const categoryTitle = product.categories?.[0]?.title ?? product.brand?.name ?? '';
  return {
    name: product.title,
    size: categoryTitle || '—',
    price: priceFormatted,
    imageSrc: product.image ?? PLACEHOLDER_IMAGE,
    badge: categoryTitle || 'Upcoming',
    badgeTone: 'dark',
    actionLabel: 'Order',
    slug: product.slug,
  };
}

/**
 * Home page "Upcoming" section: shows products marked as upcoming from the API.
 */
export function UpcomingProductsSection() {
  const currency = useCurrency();
  const [items, setItems] = useState<HomeProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUpcoming = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<ProductsResponse>('/api/v1/products', {
        params: {
          filter: 'upcoming',
          limit: String(UPCOMING_LIMIT),
          page: '1',
        },
      });
      const list = Array.isArray(response?.data) ? response.data : [];
      const mapped: HomeProductItem[] = list.map((p) =>
        mapApiProductToHomeItem(p, formatPrice(p.price ?? 0, currency))
      );
      setItems(mapped);
      setCurrentPage(1);
    } catch (err) {
      console.error('UpcomingProductsSection: failed to load upcoming products', err);
      setError('Failed to load');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);

  if (error) {
    return (
      <section className="flex flex-col gap-8">
        <div className="relative flex min-h-[4rem] items-center justify-end">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <HomeSectionTitle title="Upcoming" centered />
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 py-8">
          <p className="text-[#414141]">{error}</p>
          <button
            type="button"
            onClick={fetchUpcoming}
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
      <section className="flex flex-col gap-8">
        <div className="relative flex min-h-[4rem] items-center justify-end">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <HomeSectionTitle title="Upcoming" centered />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pb-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-3xl bg-white/60" />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="flex flex-col gap-8">
        <div className="relative flex min-h-[4rem] items-center justify-end">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <HomeSectionTitle title="Upcoming" centered />
          </div>
          <HomeActionButton href="/products" label="Shop" variant="outline" className="hidden sm:inline-flex" />
        </div>
        <p className="py-6 text-center text-[#9d9d9d]">No upcoming products yet.</p>
      </section>
    );
  }

  const totalPages = Math.max(1, Math.ceil(items.length / CARDS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * CARDS_PER_PAGE;
  const visibleItems = items.slice(start, start + CARDS_PER_PAGE);

  return (
    <section className="flex flex-col gap-8 overflow-hidden">
      <div className="relative flex min-h-[4rem] items-center justify-end">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <HomeSectionTitle title="Upcoming" centered />
        </div>
        <HomeActionButton href="/products" label="Shop" variant="outline" className="hidden sm:inline-flex" />
      </div>
      <div className="mt-28 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {visibleItems.map((item, index) => {
          const isStaggeredImage = index === 1 || index === 3;
          return (
            <div key={`upcoming-${start + index}-${item.name}-${item.badge}`}>
              <HomeProductCard item={item} imageNudgeDown={isStaggeredImage} />
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div
          className="mt-16 flex items-center justify-center gap-4"
          role="tablist"
          aria-label="Upcoming products pagination"
        >
          {Array.from({ length: totalPages }, (_, i) => {
            const page = i + 1;
            const isActive = page === safePage;
            return (
              <button
                key={page}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Page ${page}`}
                onClick={() => setCurrentPage(page)}
                className={`h-2 w-[100px] rounded-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#122a26] focus-visible:ring-offset-2 ${
                  isActive ? 'bg-[#122a26]' : 'bg-[#d9d9d9] hover:bg-[#c9c9c9]'
                }`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
