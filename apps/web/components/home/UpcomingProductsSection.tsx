'use client';

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import { apiClient } from '../../lib/api-client';
import { HomeSectionTitle } from './HomeSectionTitle';
import { HomeActionButton } from './HomeActionButton';
import { ProductsCatalogCard } from '../../app/products/components/ProductsCatalogCard';
import {
  getCategoryLabel,
  getSectionLabel,
  getSizeLabel,
  shouldNudgeCatalogProductImage,
  toCatalogProduct,
} from '../../app/products/components/catalogProductLabels';
import {
  CATALOG_PRODUCT_CARD_MOBILE_ARTICLE_CLASS_NAME,
  CATALOG_PRODUCT_CARD_MOBILE_STRIP_GAP_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_STRIP_GAP_CLASS_NAME,
  CATALOG_PRODUCT_CARD_SM_VIEWPORT_QUERY,
  HOME_UPCOMING_MOBILE_CARD_TOP_PADDING_CLASS_NAME,
  HOME_UPCOMING_MOBILE_DETAILS_OFFSET_CLASS_NAME,
  HOME_UPCOMING_MOBILE_HERO_PULL_UP_CLASS_NAME,
  HOME_UPCOMING_MOBILE_IMAGE_BOTTOM_MARGIN_CLASS_NAME,
  HOME_UPCOMING_MOBILE_IMAGE_FRAME_CLASS_NAME,
  HOME_UPCOMING_MOBILE_ITEM_WRAPPER_CLASS_NAME,
  getCatalogProductCardImageScaleBoost,
  getProductsCatalogPageSmallerImageScaleMultiplier,
} from '../../app/products/components/catalogProductCardMobilePresentation';
import { useTranslation } from '@/lib/i18n-client';

interface ApiProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string | null;
  images?: string[];
  inStock?: boolean;
  skus?: string[];
  categories?: Array<{ id: string; slug: string; title: string }>;
  brand?: { id: string; name: string } | null;
  originalPrice?: number | null;
  defaultVariantId?: string | null;
  defaultVariantStock?: number;
  defaultSku?: string;
}

interface ProductsResponse {
  data: ApiProduct[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

const UPCOMING_LIMIT = 12;
const UPCOMING_CARDS_PER_PAGE_MOBILE = 2;
const UPCOMING_CARDS_PER_PAGE_SM_UP = 6;
const UPCOMING_PAGE_ANIMATION_DURATION_MS = 300;
const UPCOMING_SCROLL_IDLE_UPDATE_DELAY_MS = 90;
/** rAF frames where scrollLeft must stay constant before treating smooth scroll as settled. */
const UPCOMING_SCROLL_SETTLE_STABLE_FRAMES = 4;
/** Safety cap so programmatic-scroll flag is always released even if scroll never reports settling. */
const UPCOMING_SCROLL_SETTLE_MAX_WAIT_MS = 1500;
/** Tolerance (px) when matching live scrollLeft to the target page anchor. */
const UPCOMING_SCROLL_TARGET_TOLERANCE_PX = 2;
const UPCOMING_PAGE_STAGGER_DELAY_CLASSES = [
  'delay-[10ms]',
  'delay-[50ms]',
  'delay-[154ms]',
  'delay-[296ms]',
  'delay-[428ms]',
  'delay-[516ms]',
] as const;
/**
 * Mobile/sm+ pagination tabs — always one tab per page; dot widths flex to fit one row on narrow viewports.
 */
function getUpcomingVisiblePageNumbers(totalPages: number): number[] {
  return Array.from({ length: totalPages }, (_, i) => i + 1);
}

function subscribeUpcomingSmViewport(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const mq = window.matchMedia(CATALOG_PRODUCT_CARD_SM_VIEWPORT_QUERY);
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function getUpcomingSmViewportSnapshot(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(CATALOG_PRODUCT_CARD_SM_VIEWPORT_QUERY).matches;
}

/** SSR: assume mobile pagination (2 per step) to avoid layout jump on narrow clients. */
function getServerUpcomingSmViewportSnapshot(): boolean {
  return false;
}

/** Scroll offset of `element` within `container` (works when `offsetLeft` chain differs). */
function getScrollLeftForElementWithin(container: HTMLDivElement, element: HTMLElement): number {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  return container.scrollLeft + (elementRect.left - containerRect.left);
}

function resolveUpcomingPageFromMobileAnchors(
  container: HTMLDivElement,
  pageStartAnchors: Array<HTMLDivElement | null | undefined>,
  totalPages: number
): number {
  if (totalPages <= 1) {
    return 1;
  }

  const scrollLeft = container.scrollLeft;
  let bestPage = 1;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
    const anchor = pageStartAnchors[pageIndex];
    if (!anchor) {
      continue;
    }
    const anchorScrollLeft = getScrollLeftForElementWithin(container, anchor);
    const distance = Math.abs(scrollLeft - anchorScrollLeft);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestPage = pageIndex + 1;
    }
  }

  return bestPage;
}

function resolveUpcomingPageFromProportionalScroll(
  container: HTMLDivElement,
  totalPages: number
): number {
  if (totalPages <= 1) {
    return 1;
  }

  const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
  if (maxScrollLeft <= 0) {
    return 1;
  }

  const scrollLeft = container.scrollLeft;

  if (scrollLeft <= UPCOMING_SCROLL_TARGET_TOLERANCE_PX) {
    return 1;
  }
  if (scrollLeft >= maxScrollLeft - UPCOMING_SCROLL_TARGET_TOLERANCE_PX) {
    return totalPages;
  }

  const pageIndex = Math.round((scrollLeft / maxScrollLeft) * (totalPages - 1));
  return Math.min(totalPages, Math.max(1, pageIndex + 1));
}

function getUpcomingProportionalScrollLeft(
  container: HTMLDivElement,
  page: number,
  totalPages: number
): number {
  const pageIndex = Math.max(0, Math.min(totalPages - 1, page - 1));
  const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
  if (maxScrollLeft <= 0 || totalPages <= 1) {
    return 0;
  }

  const denominator = Math.max(1, totalPages - 1);
  return Math.min(maxScrollLeft, (maxScrollLeft * pageIndex) / denominator);
}

/** Matches `TrendingFeaturedSection` shop CTA sizing and xl placement. */
const UPCOMING_SHOP_BUTTON_CLASS_NAME =
  '!w-fit !min-h-8 !translate-y-[2rem] !rounded-[0.5rem] !border-[2.5px] !border-[#dcc090] !px-2.5 !py-2 !text-[0.75rem] !font-black !uppercase !leading-none !tracking-[0.07em] sm:!w-auto sm:!min-h-9 sm:!translate-y-[2rem] sm:!rounded-[0.5rem] sm:!border-[2.5px] sm:!border-[#dcc090] sm:!px-5 sm:!py-0 sm:!text-[0.75rem] sm:!font-black sm:!leading-none sm:!tracking-[0.14em] xl:absolute xl:right-[7.5rem] xl:!translate-y-[2rem]';

function UpcomingSectionHeader() {
  const { t } = useTranslation();
  return (
    <div className="relative flex min-h-[4rem] w-full items-center justify-between gap-3 sm:justify-end">
      <div className="min-w-0 flex-1 translate-y-[2px] sm:absolute sm:left-1/2 sm:top-1/2 sm:w-max sm:max-w-[min(100%,calc(100%-7rem))] sm:-translate-x-[calc(50%+3.5rem)] sm:-translate-y-[46%]">
        <HomeSectionTitle
          title={t('home.homepage.upcoming.title')}
          centered={false}
          className="items-start text-left sm:items-center sm:text-center [&_h2]:text-left sm:[&_h2]:text-center"
          titleClassName="relative top-8 sm:top-10"
        />
      </div>
      <HomeActionButton
        href="/products"
        label={t('home.homepage.upcoming.shopCta')}
        variant="outline"
        className={UPCOMING_SHOP_BUTTON_CLASS_NAME}
      />
    </div>
  );
}

/**
 * Home page "Upcoming" section: shows products marked as upcoming from the API.
 */
export function UpcomingProductsSection() {
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const pageStartRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [pageDirection, setPageDirection] = useState<1 | -1>(1);
  const pageTransitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const programmaticScrollRafRef = useRef<number | null>(null);
  const programmaticScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSmUp = useSyncExternalStore(
    subscribeUpcomingSmViewport,
    getUpcomingSmViewportSnapshot,
    getServerUpcomingSmViewportSnapshot
  );
  const cardsPerPage = isSmUp ? UPCOMING_CARDS_PER_PAGE_SM_UP : UPCOMING_CARDS_PER_PAGE_MOBILE;

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
      setItems(list);
      setCurrentPage(1);
    } catch (err) {
      console.error('UpcomingProductsSection: failed to load upcoming products', err);
      setError('load_error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);

  useEffect(() => {
    pageStartRefs.current = [];
    setCurrentPage(1);
    scrollContainerRef.current?.scrollTo({ left: 0 });
  }, [isSmUp, items.length, cardsPerPage]);

  useEffect(() => {
    return () => {
      if (pageTransitionTimerRef.current) {
        clearTimeout(pageTransitionTimerRef.current);
      }
      if (scrollIdleTimerRef.current) {
        clearTimeout(scrollIdleTimerRef.current);
      }
      if (programmaticScrollTimerRef.current) {
        clearTimeout(programmaticScrollTimerRef.current);
      }
      if (programmaticScrollRafRef.current !== null) {
        cancelAnimationFrame(programmaticScrollRafRef.current);
      }
    };
  }, []);

  if (error) {
    return (
      <section className="flex flex-col gap-8">
        <UpcomingSectionHeader />
        <div className="flex items-center justify-center gap-4 py-8">
          <p className="text-[#414141]">{error === 'load_error' ? t('home.homepage.upcoming.loadError') : error}</p>
          <button
            type="button"
            onClick={fetchUpcoming}
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
      <section className="flex flex-col gap-8">
        <UpcomingSectionHeader />
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
        <UpcomingSectionHeader />
        <p className="py-6 text-center text-[#9d9d9d]">{t('home.homepage.upcoming.noUpcoming')}</p>
      </section>
    );
  }

  const totalPages = Math.max(1, Math.ceil(items.length / cardsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const visiblePaginationPages = getUpcomingVisiblePageNumbers(totalPages);

  const getScrollLeftForPage = (page: number, container: HTMLDivElement): number => {
    if (isSmUp) {
      return getUpcomingProportionalScrollLeft(container, page, totalPages);
    }

    const pageIndex = Math.max(0, Math.min(totalPages - 1, page - 1));
    const anchor = pageStartRefs.current[pageIndex];
    if (!anchor) {
      return 0;
    }

    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
    return Math.min(getScrollLeftForElementWithin(container, anchor), maxScrollLeft);
  };

  const resolvePageFromScrollLeft = (container: HTMLDivElement): number => {
    if (isSmUp) {
      return resolveUpcomingPageFromProportionalScroll(container, totalPages);
    }

    return resolveUpcomingPageFromMobileAnchors(container, pageStartRefs.current, totalPages);
  };

  const waitForScrollToSettle = (container: HTMLDivElement, targetScrollLeft: number) => {
    if (programmaticScrollRafRef.current !== null) {
      cancelAnimationFrame(programmaticScrollRafRef.current);
      programmaticScrollRafRef.current = null;
    }
    if (programmaticScrollTimerRef.current) {
      clearTimeout(programmaticScrollTimerRef.current);
      programmaticScrollTimerRef.current = null;
    }

    let previousScrollLeft = container.scrollLeft;
    let stableFrames = 0;
    const startedAt =
      typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();

    const releaseFlag = () => {
      isProgrammaticScrollRef.current = false;
      if (programmaticScrollRafRef.current !== null) {
        cancelAnimationFrame(programmaticScrollRafRef.current);
        programmaticScrollRafRef.current = null;
      }
      if (programmaticScrollTimerRef.current) {
        clearTimeout(programmaticScrollTimerRef.current);
        programmaticScrollTimerRef.current = null;
      }
    };

    const tick = () => {
      const current = container.scrollLeft;
      const movedTooLittle = Math.abs(current - previousScrollLeft) < 0.5;
      const reachedTarget = Math.abs(current - targetScrollLeft) <= UPCOMING_SCROLL_TARGET_TOLERANCE_PX;

      if (movedTooLittle || reachedTarget) {
        stableFrames += 1;
      } else {
        stableFrames = 0;
      }
      previousScrollLeft = current;

      if (stableFrames >= UPCOMING_SCROLL_SETTLE_STABLE_FRAMES) {
        releaseFlag();
        return;
      }
      programmaticScrollRafRef.current = requestAnimationFrame(tick);
    };

    programmaticScrollRafRef.current = requestAnimationFrame(tick);
    programmaticScrollTimerRef.current = setTimeout(releaseFlag, UPCOMING_SCROLL_SETTLE_MAX_WAIT_MS);
  };

  const handlePageChange = (page: number) => {
    const container = scrollContainerRef.current;
    const clampedPage = Math.max(1, Math.min(totalPages, page));
    const current = safePage;

    if (clampedPage !== current) {
      setPageDirection(clampedPage > current ? 1 : -1);
      setIsPageTransitioning(true);
      if (pageTransitionTimerRef.current) {
        clearTimeout(pageTransitionTimerRef.current);
      }
      pageTransitionTimerRef.current = setTimeout(() => {
        setIsPageTransitioning(false);
      }, UPCOMING_PAGE_ANIMATION_DURATION_MS);
    }

    if (!container) {
      setCurrentPage(clampedPage);
      return;
    }

    const targetScrollLeft = getScrollLeftForPage(clampedPage, container);

    isProgrammaticScrollRef.current = true;
    setCurrentPage(clampedPage);

    if (scrollIdleTimerRef.current) {
      clearTimeout(scrollIdleTimerRef.current);
      scrollIdleTimerRef.current = null;
    }

    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth',
    });

    waitForScrollToSettle(container, targetScrollLeft);
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || totalPages <= 1 || isProgrammaticScrollRef.current) {
      return;
    }

    if (scrollIdleTimerRef.current) {
      clearTimeout(scrollIdleTimerRef.current);
    }

    scrollIdleTimerRef.current = setTimeout(() => {
      if (isProgrammaticScrollRef.current) {
        return;
      }

      const nextPage = resolvePageFromScrollLeft(container);
      setCurrentPage((current) => (current === nextPage ? current : nextPage));
    }, UPCOMING_SCROLL_IDLE_UPDATE_DELAY_MS);
  };

  const scrollContainerClassName =
    'scrollbar-hide mt-3 max-sm:snap-x max-sm:snap-mandatory overflow-x-auto overflow-y-visible overscroll-x-contain pb-4 pt-[7.5rem] sm:mt-6 sm:pt-[7.5rem]';

  return (
    <section className="relative isolate flex flex-col gap-4 sm:gap-5 xl:mr-[calc(50%_-_50vw)] xl:overflow-x-clip">
      <UpcomingSectionHeader />
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={scrollContainerClassName}
      >
        <div
          className={`flex min-w-max max-lg:pr-4 items-stretch ${CATALOG_PRODUCTS_PAGE_STRIP_GAP_CLASS_NAME} ${CATALOG_PRODUCT_CARD_MOBILE_STRIP_GAP_CLASS_NAME}`}
        >
          {items.map((item, index) => {
            const pageIndex = Math.floor(index / cardsPerPage);
            const indexInPage = index % cardsPerPage;
            const isPageStart = index % cardsPerPage === 0;
            const isActivePageCard = pageIndex === safePage - 1;
            const shouldAnimateCard = isSmUp && isPageTransitioning && isActivePageCard;
            const activePageMotionClass =
              pageDirection === 1
                ? 'translate-x-[0.35rem] scale-[0.992] rotate-[0.35deg] shadow-[0_10px_26px_rgba(18,42,38,0.16)]'
                : '-translate-x-[0.35rem] scale-[0.992] -rotate-[0.35deg] shadow-[0_10px_26px_rgba(18,42,38,0.16)]';
            const pageMotionClass =
              shouldAnimateCard
                ? activePageMotionClass
                : 'translate-x-0 scale-100 rotate-0 shadow-none';
            const pageDelayClass =
              shouldAnimateCard
                ? UPCOMING_PAGE_STAGGER_DELAY_CLASSES[
                    Math.min(indexInPage, UPCOMING_PAGE_STAGGER_DELAY_CLASSES.length - 1)
                  ]
                : 'delay-0';
            const catalogProduct = toCatalogProduct({
              id: item.id,
              slug: item.slug,
              title: item.title,
              price: item.price,
              image: item.image,
              images: item.images,
              inStock: item.inStock,
              originalPrice: item.originalPrice ?? null,
              defaultVariantId: item.defaultVariantId ?? null,
              defaultVariantStock: item.defaultVariantStock ?? 0,
              defaultSku: item.defaultSku ?? '',
              categories: item.categories,
              skus: item.skus,
            });
            const section = getSectionLabel(catalogProduct);
            return (
              <div
                key={`upcoming-${index}-${item.id}`}
                ref={(el) => {
                  if (isPageStart) {
                    pageStartRefs.current[pageIndex] = el;
                  }
                }}
                className={`flex min-h-0 shrink-0 flex-col self-stretch transition-transform transition-shadow duration-300 ease-out will-change-transform ${pageMotionClass} ${pageDelayClass} ${
                  isPageStart ? 'max-sm:snap-start max-sm:snap-always' : ''
                } ${HOME_UPCOMING_MOBILE_ITEM_WRAPPER_CLASS_NAME}`}
              >
                <ProductsCatalogCard
                  product={catalogProduct}
                  sectionLabel={section}
                  sizeLabel={getSizeLabel(catalogProduct)}
                  categoryLabel={getCategoryLabel(catalogProduct, section)}
                  buyButtonLabel={t('home.homepage.upcoming.orderCta')}
                  productsCatalogPageScaleMultiplier={getProductsCatalogPageSmallerImageScaleMultiplier(
                    index
                  )}
                  imageNudgeDown={shouldNudgeCatalogProductImage(index)}
                  imageScaleBoost={getCatalogProductCardImageScaleBoost(index)}
                  imageFrameClassName={HOME_UPCOMING_MOBILE_IMAGE_FRAME_CLASS_NAME}
                  catalogHeroPullUpClassName={HOME_UPCOMING_MOBILE_HERO_PULL_UP_CLASS_NAME}
                  catalogCardTopPaddingClassName={HOME_UPCOMING_MOBILE_CARD_TOP_PADDING_CLASS_NAME}
                  catalogDetailsOffsetClassName={HOME_UPCOMING_MOBILE_DETAILS_OFFSET_CLASS_NAME}
                  catalogImageBottomMarginClassName={HOME_UPCOMING_MOBILE_IMAGE_BOTTOM_MARGIN_CLASS_NAME}
                  className={`group ${CATALOG_PRODUCT_CARD_MOBILE_ARTICLE_CLASS_NAME} max-sm:!w-full max-sm:!min-w-0 max-sm:!max-w-none`}
                  catalogStripMobilePeek={isSmUp}
                  compactLayout
                  productsCatalogPage
                  eagerProductImage
                />
              </div>
            );
          })}
      </div>
      </div>
      {totalPages === 1 ? (
        <div
          className="mt-1 flex items-center justify-center sm:mt-2"
          aria-hidden="true"
        >
          <span className="h-1.5 w-[100px] shrink-0 rounded-[12px] bg-[#122a26] sm:h-2" />
        </div>
      ) : (
        <div
          className="mt-1 flex w-full max-w-[calc(100vw-2.5rem)] flex-nowrap items-center justify-center gap-1.5 sm:mt-2 sm:max-w-none sm:flex-wrap sm:gap-4"
          role="tablist"
          aria-label={t('home.homepage.upcoming.paginationAria')}
        >
          {visiblePaginationPages.map((page) => {
            const isActive = page === safePage;
            return (
              <button
                key={page}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`${t('home.homepage.upcoming.pageAriaPrefix')} ${page}`}
                onClick={() => handlePageChange(page)}
                className={`h-1.5 min-w-[1.25rem] flex-1 rounded-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#122a26] focus-visible:ring-offset-2 sm:h-2 sm:w-[100px] sm:flex-none ${
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
