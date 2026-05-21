'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { CustomizeSizeModal } from '../[slug]/CustomizeSizeModal';
import type { CustomOrderDraft } from '../[slug]/CustomizeSizeOrderFallback';
import { apiClient } from '../../../lib/api-client';
import { getStoredLanguage, type LanguageCode } from '../../../lib/language';
import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';
import { preloadSizeCatalogCategories } from '@/lib/size-catalog-image-cache';
import { CatalogForProductLineRow } from './CatalogForProductLineRow';
import { ProductsCatalogMobileFilterSheet } from './ProductsCatalogMobileFilterSheet';
import { ProductsCatalogCard } from './ProductsCatalogCard';
import {
  CATALOG_MOBILE_PAGINATION_ROW_CLASS_NAME,
  CATALOG_PRODUCT_CARD_MOBILE_ARTICLE_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_IMAGE_FRAME_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_MOBILE_ITEM_WRAPPER_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_MOBILE_CARDS_PER_PAGE,
  CATALOG_PRODUCTS_PAGE_STRIP_FLEX_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_PAGINATION_WRAPPER_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_SECTION_STRIP_SCROLL_CLASS_NAME,
  CATALOG_SCROLL_IDLE_UPDATE_DELAY_MS,
  getCatalogProductCardImageScaleBoost,
  getCatalogProductsSmViewportSnapshot,
  getProductsCatalogPageSmallerImageScaleMultiplier,
  getServerCatalogProductsSmViewportSnapshot,
  subscribeCatalogProductsSmViewport,
} from './catalogProductCardMobilePresentation';
import {
  CATALOG_SELECT_SIZE_AUTOOPEN_QUERY,
  CATALOG_SELECT_SIZE_AUTOOPEN_VALUE,
} from '@/lib/constants/products-catalog.constants';
import {
  type CatalogProduct,
  CATALOG_SECTION_PAGE_SIZE,
  filterSizeCatalogByProducts,
  getProductSectionLabels,
  getCategoryLabel,
  getColorLabel,
  getSizeLabel,
  productMatchesCategoryFilter,
  productMatchesSizeFilter,
  shouldNudgeCatalogProductImage,
  resolveSectionLabelFromCollectionValue,
} from './catalogProductLabels';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

const SECTION_ORDER = ['Classic', 'Premium', 'Atelier', 'Special'] as const;

/** rAF frames where scrollLeft must stay constant before treating smooth scroll as settled. */
const CATALOG_SCROLL_SETTLE_STABLE_FRAMES = 4;
/** Safety cap so programmatic-scroll flag is always released even if scroll never reports settling. */
const CATALOG_SCROLL_SETTLE_MAX_WAIT_MS = 1500;
/** Tolerance (px) when matching live scrollLeft to the target page anchor. */
const CATALOG_SCROLL_TARGET_TOLERANCE_PX = 2;

/** Scroll offset of `element` within `container` (works when `offsetParent` chain differs). */
function getScrollLeftForElementWithin(container: HTMLElement, element: HTMLElement): number {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  return container.scrollLeft + (elementRect.left - containerRect.left);
}

function resolveSectionPageFromScrollAnchors(
  container: HTMLDivElement,
  pageStartAnchors: Array<HTMLDivElement | null | undefined>
): number {
  const scrollLeft = container.scrollLeft;
  let bestPage = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let pageIndex = 0; pageIndex < pageStartAnchors.length; pageIndex += 1) {
    const anchor = pageStartAnchors[pageIndex];
    if (!anchor) {
      continue;
    }
    const anchorScrollLeft = getScrollLeftForElementWithin(container, anchor);
    const distance = Math.abs(scrollLeft - anchorScrollLeft);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestPage = pageIndex;
    }
  }

  return bestPage;
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'default', label: 'Sort By' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

/** Applied when a filter control has a non-default selection (desktop selects + sort). */
const FILTER_CONTROL_ACTIVE =
  'border-[#122a26] bg-[#eef3f2] text-[#122a26] ring-2 ring-[#122a26]/40 ring-offset-2 ring-offset-[#f5f4f1]';
const FILTER_CONTROL_INACTIVE_BORDER = 'border-transparent bg-white text-[#414141]';
/** Size opener stays on gold; only border/ring indicate active. */
const SIZE_FILTER_BUTTON_ACTIVE =
  'border-[#122a26] bg-[#c9b07a] text-[#122a26] ring-2 ring-[#122a26]/40 ring-offset-2 ring-offset-[#f5f4f1]';

/** Matches Tailwind `max-lg` so JS scroll offset stays in sync with strip card breakpoints. */
const CATALOG_STRIP_PEEK_MEDIA_QUERY = '(max-width: 1023px)';

/**
 * Horizontal scroll offset so ~half of the first strip card sits left of the viewport (mobile hint).
 */
function getCatalogStripPeekStartScroll(container: HTMLElement): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  if (!window.matchMedia(CATALOG_STRIP_PEEK_MEDIA_QUERY).matches) {
    return 0;
  }

  const first = container.querySelector<HTMLElement>('[data-catalog-strip-card]');
  if (!first) {
    return 0;
  }

  const halfCard = Math.round(first.offsetWidth / 2);
  const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);

  return Math.min(halfCard, maxScroll);
}

interface ProductsCatalogViewProps {
  products: CatalogProduct[];
}

function sortProducts(products: CatalogProduct[], sortBy: SortOption): CatalogProduct[] {
  const items = [...products];

  switch (sortBy) {
    case 'price-asc':
      return items.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return items.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return items.sort((a, b) => a.title.localeCompare(b.title));
    case 'name-desc':
      return items.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return items;
  }
}

function ChevronIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M7 8.5L10 11.5L13 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Figma-faithful catalog layout for the products landing page.
 */
export function ProductsCatalogView({ products }: ProductsCatalogViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionScrollRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sectionPageStartRefs = useRef<Record<string, Array<HTMLDivElement | null>>>({});
  const sectionScrollIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionProgrammaticScrollRef = useRef<Record<string, boolean>>({});
  const sectionScrollSettleRafRef = useRef<Record<string, number | null>>({});
  const sectionScrollSettleTimerRef = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
  const isSmUp = useSyncExternalStore(
    subscribeCatalogProductsSmViewport,
    getCatalogProductsSmViewportSnapshot,
    getServerCatalogProductsSmViewportSnapshot
  );
  const cardsPerPage = isSmUp ? CATALOG_SECTION_PAGE_SIZE : CATALOG_PRODUCTS_PAGE_MOBILE_CARDS_PER_PAGE;
  const [catalogSizeModalOpen, setCatalogSizeModalOpen] = useState(false);
  const [sizeCatalogCategories, setSizeCatalogCategories] = useState<SizeCatalogCategoryDto[]>([]);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') ?? 'all');
  const [sectionPages, setSectionPages] = useState<Record<string, number>>({});

  const selectedCollection = searchParams.get('category') ?? 'all';
  const selectedColor = searchParams.get('color') ?? 'all';
  const selectedSizeCatalogCategoryId = searchParams.get('sizeCat')?.trim() ?? '';
  const selectedSort = (searchParams.get('sort') as SortOption | null) ?? 'default';

  const selectedSizeCatalogCategoryTitle = useMemo(() => {
    const id = selectedSizeCatalogCategoryId.trim();
    if (!id) {
      return null;
    }
    for (const category of sizeCatalogCategories) {
      const hit = category.items.find((item) => item.categoryId === id);
      if (hit?.categoryTitle?.trim()) {
        return hit.categoryTitle.trim();
      }
    }
    return null;
  }, [sizeCatalogCategories, selectedSizeCatalogCategoryId]);
  const selectedSectionTitle = resolveSectionLabelFromCollectionValue(selectedCollection);
  const isCollectionFilterActive = selectedCollection !== 'all';
  const isColorFilterActive = selectedColor !== 'all';
  const isSizeFilterActive = selectedSize !== 'all';
  const isSortFilterActive = selectedSort !== 'default';
  const activeProductFiltersCount =
    (isCollectionFilterActive ? 1 : 0) +
    (isColorFilterActive ? 1 : 0) +
    (isSizeFilterActive ? 1 : 0) +
    (isSortFilterActive ? 1 : 0);

  useEffect(() => {
    setSelectedSize(searchParams.get('size') ?? 'all');
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get(CATALOG_SELECT_SIZE_AUTOOPEN_QUERY) !== CATALOG_SELECT_SIZE_AUTOOPEN_VALUE) {
      return;
    }
    setCatalogSizeModalOpen(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete(CATALOG_SELECT_SIZE_AUTOOPEN_QUERY);
    const nextPath = params.toString() ? `/products?${params.toString()}` : '/products';
    router.replace(nextPath, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    setLanguage(getStoredLanguage());
    const handleLanguageUpdate = () => {
      setLanguage(getStoredLanguage());
    };
    window.addEventListener('language-updated', handleLanguageUpdate);
    return () => window.removeEventListener('language-updated', handleLanguageUpdate);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiClient.get<{ data: SizeCatalogCategoryDto[] }>('/api/v1/size-catalog');
        if (!cancelled) {
          const data = Array.isArray(res.data) ? res.data : [];
          setSizeCatalogCategories(data);
          void preloadSizeCatalogCategories(data);
        }
      } catch {
        if (!cancelled) {
          setSizeCatalogCategories([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const collectionOptions = useMemo(() => {
    const items = SECTION_ORDER.filter((section) =>
      products.some((product) => getProductSectionLabels(product).includes(section))
    );

    return ['all', ...items];
  }, [products]);

  const colorOptions = useMemo(() => {
    return Array.from(new Set(products.map((product) => getColorLabel(product)))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [products]);

  const sizeCatalogForModal = useMemo(
    () => filterSizeCatalogByProducts(sizeCatalogCategories, products),
    [sizeCatalogCategories, products]
  );

  const selectedCatalogItemId = useMemo(() => {
    if (selectedSize === 'all') {
      return null;
    }
    const sizeNeedle = selectedSize.trim().toLowerCase();
    const categoryNeedle = selectedSizeCatalogCategoryId.trim();
    for (const category of sizeCatalogCategories) {
      const exactTitleHit = category.items.find((item) => {
        const titleMatch = item.title.trim().toLowerCase() === sizeNeedle;
        if (!titleMatch) {
          return false;
        }
        if (!categoryNeedle) {
          return true;
        }
        return item.categoryId === categoryNeedle;
      });
      if (exactTitleHit) {
        return exactTitleHit.id;
      }
      const bandTitleHit = category.items.find((item) => {
        const bandMatch = item.categoryTitle.trim().toLowerCase() === sizeNeedle;
        if (!bandMatch) {
          return false;
        }
        if (!categoryNeedle) {
          return true;
        }
        return item.categoryId === categoryNeedle;
      });
      if (bandTitleHit) {
        return bandTitleHit.id;
      }
    }
    return null;
  }, [sizeCatalogCategories, selectedSize, selectedSizeCatalogCategoryId]);

  const visibleProducts = useMemo(() => {
    const gateByCollection = selectedCollection !== 'all';
    const filtered = products.filter((product) => {
      const colorLabel = getColorLabel(product);

      if (gateByCollection && !productMatchesCategoryFilter(product, selectedCollection)) {
        return false;
      }
      if (selectedColor !== 'all' && colorLabel !== selectedColor) return false;
      if (
        !productMatchesSizeFilter(
          product,
          selectedSize,
          selectedSizeCatalogCategoryId || null,
          selectedSizeCatalogCategoryTitle
        )
      ) {
        return false;
      }

      return true;
    });

    return sortProducts(filtered, selectedSort);
  }, [
    products,
    selectedCollection,
    selectedColor,
    selectedSize,
    selectedSizeCatalogCategoryId,
    selectedSizeCatalogCategoryTitle,
    selectedSort,
  ]);

  const sectionItemsByTitle = useMemo(() => {
    return visibleProducts.reduce<Record<string, CatalogProduct[]>>((accumulator, product) => {
      getProductSectionLabels(product).forEach((title) => {
        if (!accumulator[title]) {
          accumulator[title] = [];
        }

        accumulator[title].push(product);
      });

      return accumulator;
    }, {});
  }, [visibleProducts]);

  const catalogStripSectionTitles = useMemo(() => {
    return selectedCollection !== 'all' && selectedSectionTitle
      ? [selectedSectionTitle]
      : [...SECTION_ORDER];
  }, [selectedCollection, selectedSectionTitle]);

  useEffect(() => {
    setSectionPages((currentPages) => {
      let hasChanges = false;
      const nextPages: Record<string, number> = {};

      SECTION_ORDER.forEach((title) => {
        const items = sectionItemsByTitle[title] ?? [];
        if (items.length === 0) {
          return;
        }

        const totalPages = Math.max(1, Math.ceil(items.length / cardsPerPage));
        const normalizedPage = Math.min(currentPages[title] ?? 0, totalPages - 1);
        nextPages[title] = normalizedPage;

        if (currentPages[title] !== normalizedPage) {
          hasChanges = true;
        }
      });

      if (Object.keys(currentPages).length !== Object.keys(nextPages).length) {
        hasChanges = true;
      }

      return hasChanges ? nextPages : currentPages;
    });
  }, [cardsPerPage, sectionItemsByTitle]);

  const sections = useMemo(() => {
    const orderedSectionTitles =
      selectedCollection !== 'all' && selectedSectionTitle
        ? [selectedSectionTitle]
        : SECTION_ORDER;

    return orderedSectionTitles.map((title) => {
      const items = sectionItemsByTitle[title] ?? [];
      if (items.length === 0) {
        return null;
      }

      const totalPages = Math.max(1, Math.ceil(items.length / cardsPerPage));
      const currentPage = Math.min(sectionPages[title] ?? 0, totalPages - 1);
      const startIndex = currentPage * cardsPerPage;

      return {
        title,
        items,
        totalPages,
        currentPage,
        pageItems: items.slice(startIndex, startIndex + cardsPerPage),
      };
    }).filter((section): section is NonNullable<typeof section> => Boolean(section));
  }, [cardsPerPage, sectionItemsByTitle, sectionPages, selectedCollection, selectedSectionTitle]);

  useEffect(() => {
    setSectionPages({});
    for (const title of catalogStripSectionTitles) {
      const element = sectionScrollRefs.current[title];
      if (element) {
        element.scrollLeft = 0;
      }
    }
  }, [cardsPerPage, catalogStripSectionTitles]);

  const applyStripPeekStartScroll = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    for (const title of catalogStripSectionTitles) {
      if ((sectionItemsByTitle[title]?.length ?? 0) === 0) {
        continue;
      }

      const element = sectionScrollRefs.current[title];
      if (!element) {
        continue;
      }

      if (!isSmUp || !window.matchMedia(CATALOG_STRIP_PEEK_MEDIA_QUERY).matches) {
        element.scrollLeft = 0;
        continue;
      }

      element.scrollLeft = getCatalogStripPeekStartScroll(element);
    }
  }, [catalogStripSectionTitles, isSmUp, sectionItemsByTitle]);

  useLayoutEffect(() => {
    applyStripPeekStartScroll();
    const frame = requestAnimationFrame(() => {
      applyStripPeekStartScroll();
    });

    return () => cancelAnimationFrame(frame);
  }, [applyStripPeekStartScroll]);

  useEffect(() => {
    window.addEventListener('resize', applyStripPeekStartScroll);
    return () => window.removeEventListener('resize', applyStripPeekStartScroll);
  }, [applyStripPeekStartScroll]);

  const updateQuery = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'all' || value === 'default') {
        params.delete(key);
        return;
      }

      params.set(key, value);
    });

    router.replace(params.toString() ? `/products?${params.toString()}` : '/products', { scroll: false });
  };

  const applyCatalogSizeFilter = (item: SizeCatalogItemDto) => {
    const packTitle = item.title.trim();
    const bandTitle = item.categoryTitle.trim();
    const sizeQueryValue = bandTitle || packTitle;
    const categoryId = item.categoryId.trim();
    setSelectedSize(sizeQueryValue ? sizeQueryValue : 'all');
    setCatalogSizeModalOpen(false);
    setMobileFilterOpen(false);
    if (!sizeQueryValue) {
      updateQuery({ size: 'all', sizeCat: 'all' });
      return;
    }
    updateQuery({ size: sizeQueryValue, sizeCat: categoryId || 'all' });
  };

  const clearFilters = () => {
    setSelectedSize('all');
    setCatalogSizeModalOpen(false);
    setMobileFilterOpen(false);
    router.replace('/products', { scroll: false });
  };

  const waitForSectionScrollToSettle = (
    title: string,
    container: HTMLDivElement,
    targetScrollLeft: number
  ) => {
    const existingRaf = sectionScrollSettleRafRef.current[title];
    if (existingRaf !== null && existingRaf !== undefined) {
      cancelAnimationFrame(existingRaf);
      sectionScrollSettleRafRef.current[title] = null;
    }
    const existingTimer = sectionScrollSettleTimerRef.current[title];
    if (existingTimer) {
      clearTimeout(existingTimer);
      sectionScrollSettleTimerRef.current[title] = null;
    }

    let previousScrollLeft = container.scrollLeft;
    let stableFrames = 0;

    const releaseFlag = () => {
      sectionProgrammaticScrollRef.current[title] = false;
      const rafId = sectionScrollSettleRafRef.current[title];
      if (rafId !== null && rafId !== undefined) {
        cancelAnimationFrame(rafId);
        sectionScrollSettleRafRef.current[title] = null;
      }
      const timerId = sectionScrollSettleTimerRef.current[title];
      if (timerId) {
        clearTimeout(timerId);
        sectionScrollSettleTimerRef.current[title] = null;
      }
    };

    const tick = () => {
      const current = container.scrollLeft;
      const movedTooLittle = Math.abs(current - previousScrollLeft) < 0.5;
      const reachedTarget = Math.abs(current - targetScrollLeft) <= CATALOG_SCROLL_TARGET_TOLERANCE_PX;

      if (movedTooLittle || reachedTarget) {
        stableFrames += 1;
      } else {
        stableFrames = 0;
      }
      previousScrollLeft = current;

      if (stableFrames >= CATALOG_SCROLL_SETTLE_STABLE_FRAMES) {
        releaseFlag();
        return;
      }
      sectionScrollSettleRafRef.current[title] = requestAnimationFrame(tick);
    };

    sectionScrollSettleRafRef.current[title] = requestAnimationFrame(tick);
    sectionScrollSettleTimerRef.current[title] = setTimeout(releaseFlag, CATALOG_SCROLL_SETTLE_MAX_WAIT_MS);
  };

  const handleSectionPageChange = (title: string, pageIndex: number) => {
    const container = sectionScrollRefs.current[title];
    if (container) {
      let targetScrollLeft = 0;

      if (!isSmUp) {
        const anchor = sectionPageStartRefs.current[title]?.[pageIndex];
        targetScrollLeft = anchor ? getScrollLeftForElementWithin(container, anchor) : 0;
      } else {
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        const sectionMeta = sections.find((section) => section.title === title);
        const totalPages = sectionMeta?.totalPages ?? 1;
        const startLeft = getCatalogStripPeekStartScroll(container);
        const span = Math.max(0, maxScrollLeft - startLeft);
        const denominator = Math.max(1, totalPages - 1);
        targetScrollLeft =
          maxScrollLeft <= 0
            ? 0
            : Math.min(maxScrollLeft, startLeft + (span * pageIndex) / denominator);
      }

      sectionProgrammaticScrollRef.current[title] = true;

      if (sectionScrollIdleTimerRef.current) {
        clearTimeout(sectionScrollIdleTimerRef.current);
        sectionScrollIdleTimerRef.current = null;
      }

      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth',
      });

      waitForSectionScrollToSettle(title, container, targetScrollLeft);
    }

    setSectionPages((currentPages) => {
      if (currentPages[title] === pageIndex) {
        return currentPages;
      }

      return {
        ...currentPages,
        [title]: pageIndex,
      };
    });
  };

  const handleSectionScroll = (title: string) => {
    const container = sectionScrollRefs.current[title];
    const section = sections.find((item) => item.title === title);

    if (!container || !section || section.totalPages <= 1) {
      return;
    }

    if (sectionProgrammaticScrollRef.current[title]) {
      return;
    }

    const commitPage = (nextPage: number) => {
      setSectionPages((currentPages) => {
        if (currentPages[title] === nextPage) {
          return currentPages;
        }

        return {
          ...currentPages,
          [title]: nextPage,
        };
      });
    };

    if (!isSmUp) {
      if (sectionScrollIdleTimerRef.current) {
        clearTimeout(sectionScrollIdleTimerRef.current);
      }

      sectionScrollIdleTimerRef.current = setTimeout(() => {
        if (sectionProgrammaticScrollRef.current[title]) {
          return;
        }
        const anchors = sectionPageStartRefs.current[title] ?? [];
        const nextPage = resolveSectionPageFromScrollAnchors(container, anchors);
        commitPage(nextPage);
      }, CATALOG_SCROLL_IDLE_UPDATE_DELAY_MS);
      return;
    }

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const startLeft = getCatalogStripPeekStartScroll(container);
    const span = Math.max(0, maxScrollLeft - startLeft);
    const scrollLeft = container.scrollLeft;
    const adjustedLeft = Math.max(0, scrollLeft - startLeft);

    let nextPage: number;
    if (span <= 0 || section.totalPages <= 1) {
      nextPage = 0;
    } else if (scrollLeft <= startLeft + CATALOG_SCROLL_TARGET_TOLERANCE_PX) {
      nextPage = 0;
    } else if (scrollLeft >= maxScrollLeft - CATALOG_SCROLL_TARGET_TOLERANCE_PX) {
      nextPage = section.totalPages - 1;
    } else {
      nextPage = Math.round((adjustedLeft / span) * (section.totalPages - 1));
    }

    commitPage(Math.max(0, Math.min(section.totalPages - 1, nextPage)));
  };

  useEffect(() => {
    return () => {
      if (sectionScrollIdleTimerRef.current) {
        clearTimeout(sectionScrollIdleTimerRef.current);
      }
      const rafMap = sectionScrollSettleRafRef.current;
      for (const key of Object.keys(rafMap)) {
        const rafId = rafMap[key];
        if (rafId !== null && rafId !== undefined) {
          cancelAnimationFrame(rafId);
        }
      }
      const timerMap = sectionScrollSettleTimerRef.current;
      for (const key of Object.keys(timerMap)) {
        const timerId = timerMap[key];
        if (timerId) {
          clearTimeout(timerId);
        }
      }
    };
  }, []);

  return (
    <div className="min-h-full bg-[#f5f4f1]">
      <ProductsCatalogMobileFilterSheet
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        selectedCollection={selectedCollection}
        selectedColor={selectedColor}
        selectedSort={selectedSort}
        selectedSize={selectedSize}
        collectionOptions={collectionOptions}
        colorOptions={colorOptions}
        sortOptions={SORT_OPTIONS}
        onCollectionChange={(value) => updateQuery({ category: value })}
        onColorChange={(value) => updateQuery({ color: value })}
        onSortChange={(value) => updateQuery({ sort: value })}
        onOpenSizeCatalog={() => {
          setMobileFilterOpen(false);
          setCatalogSizeModalOpen(true);
        }}
        onClearAll={clearFilters}
      />

      <div className="mx-auto max-w-[120rem] px-4 pb-20 pt-12 sm:px-8 lg:pl-[7.5rem] lg:pr-0 lg:pt-[5.25rem]">
        <div className="font-montserrat">
          <div className="flex flex-col gap-8">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-[1.75rem] font-normal leading-none text-[#414141] sm:text-[2rem]">
                <span className="hidden font-extrabold lg:inline">Product Line: </span>
                <span className="font-semibold">Smoky Covers</span>
              </h1>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                aria-label={
                  activeProductFiltersCount > 0
                    ? `Filter, ${activeProductFiltersCount} filter${activeProductFiltersCount === 1 ? '' : 's'} applied`
                    : 'Open filters'
                }
                className="relative mt-0.5 min-h-[2.5rem] shrink-0 overflow-visible rounded-md bg-[#DBC097] px-7 py-2 text-sm font-black uppercase leading-none tracking-[0.14em] text-[#1A1D1C] transition-[colors,box-shadow] hover:bg-[#d2b68c] active:bg-[#c9ac82] lg:hidden"
              >
                Filter
                {activeProductFiltersCount > 0 ? (
                  <span
                    className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[0.6875rem] font-bold leading-none text-white tabular-nums"
                    aria-hidden
                  >
                    {activeProductFiltersCount}
                  </span>
                ) : null}
              </button>
            </div>

            <div className="hidden lg:block">
              <CatalogForProductLineRow />
            </div>

            <div className="hidden gap-3 lg:grid lg:grid-cols-[12.5rem_11rem_11.75rem_4.75rem_1fr_11rem] lg:items-center lg:pr-[7.5rem]">
              <label className="relative block">
                <select
                  value={selectedCollection}
                  onChange={(event) => updateQuery({ category: event.target.value })}
                  className={`h-10 w-full appearance-none rounded-[0.375rem] border-2 px-4 pr-10 text-[0.9375rem] font-semibold leading-none shadow-[0_4px_22.5px_rgba(0,0,0,0.1)] outline-none transition-[box-shadow,ring,border-color,background-color,color] focus:shadow-[0_4px_24px_rgba(18,42,38,0.18)] ${
                    isCollectionFilterActive ? FILTER_CONTROL_ACTIVE : FILTER_CONTROL_INACTIVE_BORDER
                  }`}
                >
                  <option value="all">Collections</option>
                  {collectionOptions.filter((option) => option !== 'all').map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#414141]">
                  <ChevronIcon />
                </span>
              </label>

              <label className="relative block">
                <select
                  value={selectedColor}
                  onChange={(event) => updateQuery({ color: event.target.value })}
                  className={`h-10 w-full appearance-none rounded-[0.375rem] border-2 px-4 pr-10 text-[0.9375rem] font-semibold leading-none shadow-[0_4px_22.5px_rgba(0,0,0,0.1)] outline-none transition-[box-shadow,ring,border-color,background-color,color] focus:shadow-[0_4px_24px_rgba(18,42,38,0.18)] ${
                    isColorFilterActive ? FILTER_CONTROL_ACTIVE : FILTER_CONTROL_INACTIVE_BORDER
                  }`}
                >
                  <option value="all">Color</option>
                  {colorOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#414141]">
                  <ChevronIcon />
                </span>
              </label>

              <button
                type="button"
                onClick={() => setCatalogSizeModalOpen(true)}
                className={`h-10 w-full whitespace-nowrap rounded-[0.5rem] border-2 px-4 text-left text-[0.9375rem] font-semibold leading-none transition-[box-shadow,ring,border-color,background-color,color] ${
                  isSizeFilterActive ? SIZE_FILTER_BUTTON_ACTIVE : 'border-transparent bg-[#dcc090] text-[#122a26]'
                }`}
              >
                {selectedSize === 'all' ? 'Select size' : selectedSize}
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="h-10 whitespace-nowrap rounded-[0.5rem] border-2 border-[#dcc090] px-2 text-[0.5625rem] font-black uppercase leading-none tracking-[0.01em] text-[#dcc090] transition-colors hover:bg-[#dcc090]/10"
              >
                Clear All
              </button>

              <div className="hidden lg:block" />

              <label className="relative block">
                <select
                  value={selectedSort}
                  onChange={(event) => updateQuery({ sort: event.target.value })}
                  className={`h-10 w-full appearance-none rounded-[0.375rem] border-2 px-4 pr-10 text-[0.9375rem] font-extrabold leading-none shadow-[0_4px_22.5px_rgba(0,0,0,0.1)] outline-none transition-[box-shadow,ring,border-color,background-color,color] focus:shadow-[0_4px_24px_rgba(18,42,38,0.18)] ${
                    isSortFilterActive ? FILTER_CONTROL_ACTIVE : FILTER_CONTROL_INACTIVE_BORDER
                  }`}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#414141]">
                  <ChevronIcon />
                </span>
              </label>
            </div>
          </div>

          <div className="mt-10 space-y-16 lg:mt-10 lg:space-y-20">
            {sections.length > 0 ? (
              sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-[2rem] font-extrabold leading-none text-[#414141] sm:text-[2.25rem]">
                    {section.title}
                  </h2>

                  <div
                    ref={(element) => {
                      sectionScrollRefs.current[section.title] = element;
                    }}
                    onScroll={() => {
                      handleSectionScroll(section.title);
                    }}
                    className={CATALOG_PRODUCTS_PAGE_SECTION_STRIP_SCROLL_CLASS_NAME}
                  >
                    <div className={CATALOG_PRODUCTS_PAGE_STRIP_FLEX_CLASS_NAME}>
                      {section.items.map((product, index) => {
                        const isMobileStripPageStart = index % cardsPerPage === 0;
                        const mobileStripPageIndex = Math.floor(index / cardsPerPage);
                        return (
                          <div
                            key={`${section.title}-${product.id}-${index}`}
                            ref={(element) => {
                              if (!isMobileStripPageStart) {
                                return;
                              }
                              const pageAnchors = sectionPageStartRefs.current[section.title] ?? [];
                              pageAnchors[mobileStripPageIndex] = element;
                              sectionPageStartRefs.current[section.title] = pageAnchors;
                            }}
                            className={`${CATALOG_PRODUCTS_PAGE_MOBILE_ITEM_WRAPPER_CLASS_NAME}${
                              isMobileStripPageStart ? ' max-sm:snap-start max-sm:snap-always' : ''
                            }`}
                          >
                          <ProductsCatalogCard
                            product={product}
                            sectionLabel={section.title}
                            sizeLabel={getSizeLabel(product)}
                            categoryLabel={getCategoryLabel(product, section.title)}
                            productsCatalogPageScaleMultiplier={getProductsCatalogPageSmallerImageScaleMultiplier(
                              index
                            )}
                            imageNudgeDown={shouldNudgeCatalogProductImage(index)}
                            imageScaleBoost={getCatalogProductCardImageScaleBoost(index)}
                            imageFrameClassName={CATALOG_PRODUCTS_PAGE_IMAGE_FRAME_CLASS_NAME}
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

                  {section.totalPages > 1 ? (
                    <div className={CATALOG_PRODUCTS_PAGE_PAGINATION_WRAPPER_CLASS_NAME}>
                      <div
                        className={`${CATALOG_MOBILE_PAGINATION_ROW_CLASS_NAME} sm:max-w-none sm:justify-center sm:gap-4`}
                        role="tablist"
                        aria-label={`${section.title} pages`}
                      >
                        {Array.from({ length: section.totalPages }).map((_, pageIndex) => (
                          <button
                            key={`${section.title}-page-${pageIndex}`}
                            type="button"
                            onClick={() => handleSectionPageChange(section.title, pageIndex)}
                            role="tab"
                            aria-selected={section.currentPage === pageIndex}
                            className={`h-2 min-w-[1.25rem] shrink rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#122a26] focus-visible:ring-offset-2 max-sm:h-1.5 max-sm:flex-1 sm:w-[6.25rem] sm:flex-none ${
                              section.currentPage === pageIndex
                                ? 'bg-[#122a26]'
                                : 'bg-[#d9d9d9] hover:bg-[#c9c9c9]'
                            }`}
                            aria-label={`Open ${section.title} page ${pageIndex + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </section>
              ))
            ) : (
              <div className="rounded-[2rem] bg-white px-6 py-12 text-center shadow-[0_4px_22.5px_rgba(0,0,0,0.08)]">
                <p className="text-xl font-semibold text-[#414141]">No products matched the selected filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CustomizeSizeModal
        isOpen={catalogSizeModalOpen}
        onClose={() => setCatalogSizeModalOpen(false)}
        language={language}
        sizeCategories={sizeCatalogForModal}
        selectedSizeItemId={selectedCatalogItemId}
        onSelectSizeCatalogItem={applyCatalogSizeFilter}
        onSelectCustomSizeRequest={(_draft: CustomOrderDraft) => {
          setCatalogSizeModalOpen(false);
        }}
      />
    </div>
  );
}
