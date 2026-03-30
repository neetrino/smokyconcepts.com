'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import { ProductsCatalogCard } from './ProductsCatalogCard';
import {
  type CatalogProduct,
  CATALOG_SECTION_PAGE_SIZE,
  getProductSectionLabels,
  getCategoryLabel,
  getColorLabel,
  getSizeLabel,
  shouldNudgeCatalogProductImage,
} from './catalogProductLabels';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
const FOR_PREVIEW_IMAGE_PATH = '/assets/home/products/compact-figma.svg';
const FOR_PREVIEW_MARK_PATH = '/assets/home/icons/pack-mark-figma.png';
const ITEMS_PER_SECTION_PAGE = CATALOG_SECTION_PAGE_SIZE;

const SECTION_ORDER = ['Classic', 'Special', 'Atelier', 'Premium'] as const;

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'default', label: 'Sort By' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

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
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const sectionScrollRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') ?? 'all');
  const [sectionPages, setSectionPages] = useState<Record<string, number>>({});

  const selectedCollection = searchParams.get('category') ?? 'all';
  const selectedColor = searchParams.get('color') ?? 'all';
  const selectedSort = (searchParams.get('sort') as SortOption | null) ?? 'default';
  const isCategoryFilteredView = selectedCollection !== 'all';

  useEffect(() => {
    setSelectedSize(searchParams.get('size') ?? 'all');
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!sizeMenuRef.current?.contains(event.target as Node)) {
        setShowSizeMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const sizeOptions = useMemo(() => {
    return Array.from(new Set(products.map((product) => getSizeLabel(product))));
  }, [products]);

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const sectionLabels = getProductSectionLabels(product);
      const colorLabel = getColorLabel(product);
      const sizeLabel = getSizeLabel(product);

      if (selectedCollection !== 'all' && !sectionLabels.includes(selectedCollection)) return false;
      if (selectedColor !== 'all' && colorLabel !== selectedColor) return false;
      if (selectedSize !== 'all' && sizeLabel !== selectedSize) return false;

      return true;
    });

    return sortProducts(filtered, selectedSort);
  }, [products, selectedCollection, selectedColor, selectedSize, selectedSort]);

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

  useEffect(() => {
    setSectionPages((currentPages) => {
      let hasChanges = false;
      const nextPages: Record<string, number> = {};

      SECTION_ORDER.forEach((title) => {
        const items = sectionItemsByTitle[title] ?? [];
        if (items.length === 0) {
          return;
        }

        const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_SECTION_PAGE));
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
  }, [sectionItemsByTitle]);

  const sections = useMemo(() => {
    return SECTION_ORDER.map((title) => {
      const items = sectionItemsByTitle[title] ?? [];
      if (items.length === 0) {
        return null;
      }

      const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_SECTION_PAGE));
      const currentPage = Math.min(sectionPages[title] ?? 0, totalPages - 1);
      const startIndex = currentPage * ITEMS_PER_SECTION_PAGE;

      return {
        title,
        items,
        totalPages,
        currentPage,
        pageItems: items.slice(startIndex, startIndex + ITEMS_PER_SECTION_PAGE),
      };
    }).filter((section): section is NonNullable<typeof section> => Boolean(section));
  }, [sectionItemsByTitle, sectionPages]);

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

  const clearFilters = () => {
    setSelectedSize('all');
    setShowSizeMenu(false);
    router.replace('/products', { scroll: false });
  };

  const handleSectionPageChange = (title: string, pageIndex: number) => {
    if (!isCategoryFilteredView) {
      const container = sectionScrollRefs.current[title];
      if (container) {
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        const targetScrollLeft =
          pageIndex <= 0 || maxScrollLeft <= 0 || sectionPages[title] === undefined
            ? 0
            : (maxScrollLeft * pageIndex) / Math.max(1, (sections.find((section) => section.title === title)?.totalPages ?? 1) - 1);

        container.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth',
        });
      }
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

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const nextPage =
      maxScrollLeft <= 0
        ? 0
        : Math.round((container.scrollLeft / maxScrollLeft) * (section.totalPages - 1));

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

  return (
    <div className="min-h-full bg-[#f5f4f1]">
      <div className="mx-auto max-w-[120rem] px-4 pb-20 pt-12 sm:px-8 lg:pl-[7.5rem] lg:pr-0 lg:pt-[5.25rem]">
        <div className="font-montserrat">
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-[1.75rem] font-medium leading-none text-[#414141] sm:text-[2rem]">
                Product Line: <span className="font-extrabold">Smoky Covers</span>
              </h1>
            </div>

            <div className="flex items-start gap-5">
              <div className="pt-2 text-[1.75rem] font-medium leading-none text-[#414141]">For:</div>
              <div className="-mt-2 flex shrink-0 flex-col items-center">
                <div className="relative h-[5rem] w-[4.25rem]">
                  <Image
                    src={FOR_PREVIEW_IMAGE_PATH}
                    alt="Compact preview"
                    fill
                    className="object-contain"
                    sizes="68px"
                    unoptimized
                  />
                  <div className="pointer-events-none absolute inset-x-0 top-[2.65rem] flex justify-center">
                    <Image
                      src={FOR_PREVIEW_MARK_PATH}
                      alt=""
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-90"
                      unoptimized
                      aria-hidden
                    />
                  </div>
                </div>
                <span className="mt-1 text-center text-[0.375rem] font-extrabold leading-none text-[#414141]">
                  Cigarette
                  <br />
                  Packs
                </span>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[12.5rem_11rem_11.75rem_4.75rem_1fr_11rem] lg:items-center lg:pr-[7.5rem]">
              <label className="relative block">
                <select
                  value={selectedCollection}
                  onChange={(event) => updateQuery({ category: event.target.value })}
                  className="h-10 w-full appearance-none rounded-[0.375rem] bg-white px-4 pr-10 text-[0.9375rem] font-extrabold leading-none text-[#414141] shadow-[0_4px_22.5px_rgba(0,0,0,0.1)] outline-none transition-shadow focus:shadow-[0_4px_24px_rgba(18,42,38,0.18)]"
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
                  className="h-10 w-full appearance-none rounded-[0.375rem] bg-white px-4 pr-10 text-[0.9375rem] font-extrabold leading-none text-[#414141] shadow-[0_4px_22.5px_rgba(0,0,0,0.1)] outline-none transition-shadow focus:shadow-[0_4px_24px_rgba(18,42,38,0.18)]"
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

              <div className="relative" ref={sizeMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowSizeMenu((value) => !value)}
                  className="h-10 w-full whitespace-nowrap rounded-[0.5rem] bg-[#dcc090] px-4 text-left text-[1rem] font-extrabold uppercase leading-none tracking-[0.08em] text-[#122a26]"
                >
                  {selectedSize === 'all' ? 'Choose size' : selectedSize}
                </button>

                {showSizeMenu && (
                  <div className="absolute left-0 top-[calc(100%+0.75rem)] z-20 min-w-full rounded-[1rem] bg-white p-3 shadow-[0_10px_32px_rgba(18,42,38,0.14)]">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSize('all');
                        setShowSizeMenu(false);
                        updateQuery({ size: 'all' });
                      }}
                      className="mb-2 block w-full rounded-[0.75rem] px-3 py-2 text-left text-sm font-extrabold text-[#414141] transition-colors hover:bg-[#f5f4f1]"
                    >
                      All Sizes
                    </button>
                    {sizeOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setSelectedSize(option);
                          setShowSizeMenu(false);
                          updateQuery({ size: option });
                        }}
                        className="block w-full rounded-[0.75rem] px-3 py-2 text-left text-sm font-extrabold text-[#414141] transition-colors hover:bg-[#f5f4f1]"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

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
                  className="h-10 w-full appearance-none rounded-[0.375rem] bg-white px-4 pr-10 text-[0.9375rem] font-extrabold leading-none text-[#414141] shadow-[0_4px_22.5px_rgba(0,0,0,0.1)] outline-none transition-shadow focus:shadow-[0_4px_24px_rgba(18,42,38,0.18)]"
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
                      if (!isCategoryFilteredView) {
                        handleSectionScroll(section.title);
                      }
                    }}
                    className={
                      isCategoryFilteredView
                        ? 'mt-4 pt-14 pb-4'
                        : 'scrollbar-hide mt-4 overflow-x-auto pt-14 pb-4'
                    }
                  >
                    <div
                      className={
                        isCategoryFilteredView
                          ? 'grid grid-cols-2 items-start gap-x-3 gap-y-20 md:grid-cols-3 lg:grid-cols-6'
                          : 'flex min-w-max gap-7'
                      }
                    >
                      {(isCategoryFilteredView ? section.items : section.items).map((product, index) => (
                        <ProductsCatalogCard
                          key={`${section.title}-${product.id}-${index}`}
                          product={product}
                          sectionLabel={section.title}
                          sizeLabel={getSizeLabel(product)}
                          categoryLabel={getCategoryLabel(product, section.title)}
                          imageNudgeDown={shouldNudgeCatalogProductImage(index)}
                          imageScaleBoost={0.04}
                          className="lg:w-[11.75rem] xl:w-[12rem]"
                          compactLayout
                        />
                      ))}
                    </div>
                  </div>

                  {!isCategoryFilteredView && (
                    <div className="mt-4 flex items-center justify-center gap-4">
                      {Array.from({ length: section.totalPages }).map((_, pageIndex) => (
                        <button
                          key={`${section.title}-page-${pageIndex}`}
                          type="button"
                          onClick={() => handleSectionPageChange(section.title, pageIndex)}
                          className={`h-2 w-[6.25rem] rounded-full transition-colors ${
                            section.currentPage === pageIndex ? 'bg-[#122a26]' : 'bg-[#d9d9d9]'
                          }`}
                          aria-label={`Open ${section.title} page ${pageIndex + 1}`}
                        />
                      ))}
                    </div>
                  )}
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
    </div>
  );
}
