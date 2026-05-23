'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CATALOG_SCROLL_CATEGORY_QUERY } from '@/lib/constants/products-catalog.constants';
import { resolveSectionLabelFromCollectionValue } from '../catalogProductLabels';
import type { CatalogSectionViewModel } from '../productsCatalogView.types';

/** Sticky site header clearance when scrolling to a catalog section. */
const CATALOG_SECTION_SCROLL_MARGIN_TOP_CLASS = 'scroll-mt-24';

interface UseProductsCatalogCategoryScrollParams {
  sections: CatalogSectionViewModel[];
}

/**
 * Scrolls to a catalog section from `?scrollCategory=` (home cover collections).
 * Does not filter products; strips the param after scrolling.
 */
export function useProductsCatalogCategoryScroll({ sections }: UseProductsCatalogCategoryScrollParams) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionAnchorRefs = useRef<Record<string, HTMLElement | null>>({});
  const lastScrolledSlugRef = useRef<string | null>(null);

  const scrollCategorySlug = searchParams.get(CATALOG_SCROLL_CATEGORY_QUERY)?.trim() ?? '';
  const scrollSectionTitle = scrollCategorySlug
    ? resolveSectionLabelFromCollectionValue(scrollCategorySlug)
    : null;

  const registerSectionAnchorRef = useCallback((title: string, element: HTMLElement | null) => {
    sectionAnchorRefs.current[title] = element;
  }, []);

  const stripScrollCategoryFromUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(CATALOG_SCROLL_CATEGORY_QUERY);
    const nextPath = params.toString() ? `/products?${params.toString()}` : '/products';
    router.replace(nextPath, { scroll: false });
  }, [router, searchParams]);

  useLayoutEffect(() => {
    if (!scrollCategorySlug || !scrollSectionTitle) {
      lastScrolledSlugRef.current = null;
      return;
    }

    const hasTargetSection = sections.some((section) => section.title === scrollSectionTitle);
    if (!hasTargetSection) {
      return;
    }

    if (lastScrolledSlugRef.current === scrollCategorySlug) {
      return;
    }

    const anchor = sectionAnchorRefs.current[scrollSectionTitle];
    if (!anchor) {
      return;
    }

    const scrollToSection = () => {
      anchor.scrollIntoView({ behavior: 'auto', block: 'start' });
      lastScrolledSlugRef.current = scrollCategorySlug;
      stripScrollCategoryFromUrl();
    };

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(scrollToSection);
    });

    return () => cancelAnimationFrame(frame);
  }, [scrollCategorySlug, scrollSectionTitle, sections, stripScrollCategoryFromUrl]);

  return {
    registerSectionAnchorRef,
    catalogSectionScrollMarginClassName: CATALOG_SECTION_SCROLL_MARGIN_TOP_CLASS,
  };
}
