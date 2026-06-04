'use client';

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useLayoutEffect,
  useCallback,
  useSyncExternalStore,
} from 'react';
import { getStoredLanguage, type LanguageCode } from '../lib/language';
import { t } from '../lib/i18n';
import { useRelatedProducts } from './hooks/useRelatedProducts';
import { ProductsCatalogCard } from '../app/products/components/ProductsCatalogCard';
import {
  CATALOG_SECTION_PAGE_SIZE,
  getCategoryLabel,
  getSectionLabel,
  getSizeLabel,
  shouldNudgeCatalogProductImage,
  toCatalogProduct,
} from '../app/products/components/catalogProductLabels';
import {
  CATALOG_STRIP_PAGINATION_DOT_CLASS_NAME,
  CATALOG_STRIP_PAGINATION_ROW_CLASS_NAME,
  CATALOG_MOBILE_STRIP_PROGRAMMATIC_SCROLL_RELEASE_MS,
  CATALOG_PRODUCT_CARD_MOBILE_ARTICLE_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_DESKTOP_CARD_TOP_PADDING_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_DESKTOP_DETAILS_OFFSET_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_DESKTOP_HERO_PULL_UP_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_DESKTOP_STRIP_LEADING_INSET_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_MOBILE_CARDS_PER_PAGE,
  CATALOG_PRODUCTS_PAGE_MOBILE_ITEM_WRAPPER_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_PAGINATION_WRAPPER_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_SECTION_STRIP_SCROLL_CLASS_NAME,
  CATALOG_PRODUCTS_PAGE_STRIP_FLEX_CLASS_NAME,
  CATALOG_SCROLL_IDLE_UPDATE_DELAY_MS,
  PRODUCTS_CATALOG_LANDING_MOBILE_IMAGE_BOTTOM_MARGIN_CLASS_NAME,
  getCatalogProductCardImageScaleBoost,
  getCatalogProductsPageMobileNonFirstPageScrollClassName,
  getCatalogProductsSmViewportSnapshot,
  getCatalogStripMobileImageFrameClassName,
  getCatalogStripMobileImageScaleMultiplier,
  getServerCatalogProductsSmViewportSnapshot,
  subscribeCatalogProductsSmViewport,
} from '../app/products/components/catalogProductCardMobilePresentation';
import {
  CATALOG_SCROLL_TARGET_TOLERANCE_PX,
  CATALOG_STRIP_PEEK_MEDIA_QUERY,
  getCatalogStripPeekStartScroll,
  resolveMobileStripPageFromScroll,
  scrollMobileStripToPageAnchor,
} from '../app/products/components/catalogStripScroll';

interface RelatedProductsProps {
  categorySlug?: string;
  currentProductId: string;
}

/**
 * Related products on the PDP — horizontal strip; mobile scroll-only, pagination on hover-capable `sm+`.
 */
export function RelatedProducts({ categorySlug, currentProductId }: RelatedProductsProps) {
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [currentPage, setCurrentPage] = useState(0);
  const sectionScrollRef = useRef<HTMLDivElement | null>(null);
  const pageStartRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollEndCleanupRef = useRef<(() => void) | null>(null);
  const programmaticScrollRef = useRef(false);
  const { products, loading } = useRelatedProducts({ categorySlug, currentProductId, language });

  const isSmUp = useSyncExternalStore(
    subscribeCatalogProductsSmViewport,
    getCatalogProductsSmViewportSnapshot,
    getServerCatalogProductsSmViewportSnapshot
  );
  const cardsPerPage = isSmUp ? CATALOG_SECTION_PAGE_SIZE : CATALOG_PRODUCTS_PAGE_MOBILE_CARDS_PER_PAGE;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(products.length / cardsPerPage)),
    [products.length, cardsPerPage]
  );

  useEffect(() => {
    setLanguage(getStoredLanguage());

    const handleLanguageUpdate = () => {
      setLanguage(getStoredLanguage());
    };

    window.addEventListener('language-updated', handleLanguageUpdate);
    return () => {
      window.removeEventListener('language-updated', handleLanguageUpdate);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(0);
    pageStartRefs.current = [];
  }, [products.length, categorySlug, currentProductId, cardsPerPage]);

  const applyStripPeekStartScroll = useCallback(() => {
    const container = sectionScrollRef.current;
    if (!container || products.length === 0) {
      return;
    }

    if (!isSmUp || !window.matchMedia(CATALOG_STRIP_PEEK_MEDIA_QUERY).matches) {
      container.scrollLeft = 0;
      return;
    }

    container.scrollLeft = getCatalogStripPeekStartScroll(container);
  }, [isSmUp, products.length]);

  useLayoutEffect(() => {
    applyStripPeekStartScroll();
    const frame = requestAnimationFrame(applyStripPeekStartScroll);
    return () => cancelAnimationFrame(frame);
  }, [applyStripPeekStartScroll]);

  useEffect(() => {
    window.addEventListener('resize', applyStripPeekStartScroll);
    return () => window.removeEventListener('resize', applyStripPeekStartScroll);
  }, [applyStripPeekStartScroll]);

  useEffect(() => {
    const container = sectionScrollRef.current;
    scrollEndCleanupRef.current?.();
    scrollEndCleanupRef.current = null;

    if (!container || isSmUp || totalPages <= 1) {
      return undefined;
    }

    const onScrollEnd = () => {
      if (programmaticScrollRef.current) {
        return;
      }
      setCurrentPage((previous) => {
        const nextPage = resolveMobileStripPageFromScroll(container, pageStartRefs.current, totalPages);
        return previous === nextPage ? previous : nextPage;
      });
    };

    container.addEventListener('scrollend', onScrollEnd, { passive: true });
    scrollEndCleanupRef.current = () => {
      container.removeEventListener('scrollend', onScrollEnd);
    };

    return () => {
      scrollEndCleanupRef.current?.();
      scrollEndCleanupRef.current = null;
    };
  }, [isSmUp, totalPages, products.length, cardsPerPage]);

  useEffect(() => {
    return () => {
      if (scrollIdleTimerRef.current) {
        clearTimeout(scrollIdleTimerRef.current);
      }
      scrollEndCleanupRef.current?.();
    };
  }, []);

  const handleSectionPageChange = (pageIndex: number) => {
    const container = sectionScrollRef.current;
    if (!container) {
      return;
    }

    let targetScrollLeft = 0;

    if (!isSmUp) {
      const anchor = pageStartRefs.current[pageIndex];
      targetScrollLeft = scrollMobileStripToPageAnchor(container, anchor);
    } else {
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const startLeft = getCatalogStripPeekStartScroll(container);
      const span = Math.max(0, maxScrollLeft - startLeft);
      const denominator = Math.max(1, totalPages - 1);
      targetScrollLeft =
        maxScrollLeft <= 0 ? 0 : Math.min(maxScrollLeft, startLeft + (span * pageIndex) / denominator);
    }

    programmaticScrollRef.current = true;
    if (scrollIdleTimerRef.current) {
      clearTimeout(scrollIdleTimerRef.current);
      scrollIdleTimerRef.current = null;
    }

    container.scrollTo({
      left: targetScrollLeft,
      behavior: isSmUp ? 'smooth' : 'auto',
    });

    setCurrentPage(pageIndex);

    window.setTimeout(() => {
      programmaticScrollRef.current = false;
    }, isSmUp ? 450 : CATALOG_MOBILE_STRIP_PROGRAMMATIC_SCROLL_RELEASE_MS);
  };

  const handleSectionScroll = () => {
    const container = sectionScrollRef.current;
    if (!container || totalPages <= 1) {
      return;
    }

    const commitPage = (nextPage: number) => {
      setCurrentPage((previous) => (previous === nextPage ? previous : nextPage));
    };

    if (!isSmUp) {
      if (scrollIdleTimerRef.current) {
        clearTimeout(scrollIdleTimerRef.current);
      }

      scrollIdleTimerRef.current = setTimeout(() => {
        if (programmaticScrollRef.current) {
          return;
        }
        commitPage(resolveMobileStripPageFromScroll(container, pageStartRefs.current, totalPages));
      }, CATALOG_SCROLL_IDLE_UPDATE_DELAY_MS);
      return;
    }

    if (programmaticScrollRef.current) {
      return;
    }

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const startLeft = getCatalogStripPeekStartScroll(container);
    const span = Math.max(0, maxScrollLeft - startLeft);
    const scrollLeft = container.scrollLeft;
    const adjustedLeft = Math.max(0, scrollLeft - startLeft);

    let nextPage: number;
    if (span <= 0 || totalPages <= 1) {
      nextPage = 0;
    } else if (scrollLeft <= startLeft + CATALOG_SCROLL_TARGET_TOLERANCE_PX) {
      nextPage = 0;
    } else if (scrollLeft >= maxScrollLeft - CATALOG_SCROLL_TARGET_TOLERANCE_PX) {
      nextPage = totalPages - 1;
    } else {
      nextPage = Math.round((adjustedLeft / span) * (totalPages - 1));
    }

    commitPage(Math.max(0, Math.min(totalPages - 1, nextPage)));
  };

  const isFirstPage = currentPage === 0;
  const mobileNonFirstPageScrollClassName =
    getCatalogProductsPageMobileNonFirstPageScrollClassName(isFirstPage);

  return (
    <section className="relative isolate mt-20 w-full overflow-visible border-t border-[#e8e8e8] py-12 max-sm:py-8 sm:py-16">
      <h2 className="relative z-10 font-montserrat text-[1.75rem] font-extrabold leading-tight text-[#414141] max-sm:mb-0 sm:text-[2.5rem] sm:leading-none">
        {t(language, 'product.related_products_title')}
      </h2>

      {loading ? (
        <RelatedProductsStripSkeleton />
      ) : products.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-[#9d9d9d]">{t(language, 'product.noRelatedProducts')}</p>
        </div>
      ) : (
        <div className="max-lg:mr-0 lg:-mr-[120px]">
        <div
          ref={sectionScrollRef}
          onScroll={handleSectionScroll}
          className={`${CATALOG_PRODUCTS_PAGE_SECTION_STRIP_SCROLL_CLASS_NAME} ${mobileNonFirstPageScrollClassName}`}
        >
          <div className={CATALOG_PRODUCTS_PAGE_STRIP_FLEX_CLASS_NAME}>
            <div
              className={CATALOG_PRODUCTS_PAGE_DESKTOP_STRIP_LEADING_INSET_CLASS_NAME}
              aria-hidden="true"
            />
            {products.map((product, index) => {
              const catalogProduct = toCatalogProduct({
                id: product.id,
                slug: product.slug,
                title: product.title,
                price: product.price,
                image: product.image,
                images: product.images,
                inStock: product.inStock,
                originalPrice: product.originalPrice ?? null,
                defaultVariantId: product.defaultVariantId ?? null,
                defaultVariantStock: product.defaultVariantStock ?? 0,
                defaultSku: product.defaultSku ?? '',
                categories: product.categories ?? [],
                skus: product.skus,
              });
              const section = getSectionLabel(catalogProduct);
              const isMobileStripPageStart = index % cardsPerPage === 0;
              const mobileStripPageIndex = Math.floor(index / cardsPerPage);

              return (
                <div
                  key={product.id}
                  ref={(element) => {
                    if (!isMobileStripPageStart) {
                      return;
                    }
                    pageStartRefs.current[mobileStripPageIndex] = element;
                  }}
                  className={CATALOG_PRODUCTS_PAGE_MOBILE_ITEM_WRAPPER_CLASS_NAME}
                >
                  <ProductsCatalogCard
                    product={catalogProduct}
                    sectionLabel={section}
                    sizeLabel={getSizeLabel(catalogProduct)}
                    categoryLabel={getCategoryLabel(catalogProduct, section)}
                    productsCatalogPageScaleMultiplier={getCatalogStripMobileImageScaleMultiplier(
                      index,
                      isSmUp
                    )}
                    imageNudgeDown={shouldNudgeCatalogProductImage(index)}
                    imageScaleBoost={getCatalogProductCardImageScaleBoost(index)}
                    imageFrameClassName={getCatalogStripMobileImageFrameClassName(index)}
                    catalogHeroPullUpClassName={CATALOG_PRODUCTS_PAGE_DESKTOP_HERO_PULL_UP_CLASS_NAME}
                    catalogCardTopPaddingClassName={CATALOG_PRODUCTS_PAGE_DESKTOP_CARD_TOP_PADDING_CLASS_NAME}
                    catalogDetailsOffsetClassName={CATALOG_PRODUCTS_PAGE_DESKTOP_DETAILS_OFFSET_CLASS_NAME}
                    catalogImageBottomMarginClassName={
                      PRODUCTS_CATALOG_LANDING_MOBILE_IMAGE_BOTTOM_MARGIN_CLASS_NAME
                    }
                    className={`group ${CATALOG_PRODUCT_CARD_MOBILE_ARTICLE_CLASS_NAME} max-sm:!w-full max-sm:!min-w-0 max-sm:!max-w-none`}
                    catalogStripMobilePeek={isSmUp}
                    compactLayout
                    productsCatalogPage
                    catalogBuyOnlyCta
                    eagerProductImage
                  />
                </div>
              );
            })}
          </div>
        </div>
        </div>
      )}

      {!loading && products.length > 0 && totalPages > 1 ? (
        <div className={CATALOG_PRODUCTS_PAGE_PAGINATION_WRAPPER_CLASS_NAME}>
          <div
            className={CATALOG_STRIP_PAGINATION_ROW_CLASS_NAME}
            role="tablist"
            aria-label="Related products pages"
          >
            {Array.from({ length: totalPages }).map((_, pageIndex) => (
              <button
                key={`related-page-${pageIndex}`}
                type="button"
                role="tab"
                aria-selected={currentPage === pageIndex}
                onClick={() => handleSectionPageChange(pageIndex)}
                className={`${CATALOG_STRIP_PAGINATION_DOT_CLASS_NAME} ${
                  currentPage === pageIndex
                    ? 'bg-[#122a26]'
                    : 'bg-[#d9d9d9] [@media(hover:hover)]:hover:bg-[#c9c9c9]'
                }`}
                aria-label={`Open related products page ${pageIndex + 1}`}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function RelatedProductsStripSkeleton() {
  return (
    <div className={CATALOG_PRODUCTS_PAGE_SECTION_STRIP_SCROLL_CLASS_NAME}>
      <div className={CATALOG_PRODUCTS_PAGE_STRIP_FLEX_CLASS_NAME}>
        {Array.from({ length: CATALOG_PRODUCTS_PAGE_MOBILE_CARDS_PER_PAGE }).map((_, index) => (
          <div
            key={index}
            className={`${CATALOG_PRODUCTS_PAGE_MOBILE_ITEM_WRAPPER_CLASS_NAME} h-[20rem] max-sm:h-[22rem] w-full shrink-0 animate-pulse rounded-[1.125rem] bg-white/80 shadow-[0_4px_22.5px_rgba(0,0,0,0.08)]`}
          />
        ))}
      </div>
    </div>
  );
}
