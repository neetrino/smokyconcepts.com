'use client';

import { useLayoutEffect, useMemo, type RefObject } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { SizeModalMotionState } from '@/lib/size-modal-animation';
import {
  sizeModalBlockClass,
  sizeModalBlockTransitionDelay,
} from '@/lib/size-modal-animation';
import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';
import {
  SIZE_CARD_STAGGER_BASE_MS,
  SIZE_CARD_STAGGER_MS,
  SIZE_CATALOG_PAGE_CARD_STAGGER_BASE_MS,
} from './sizeCatalogPicker.constants';
import { useCatalogPageRevealOnScroll } from './useCatalogPageRevealOnScroll';
import { useScrollerClientWidth } from './useScrollerClientWidth';
import { useSizeCatalogHorizontalScroll } from './useSizeCatalogHorizontalScroll';
import { useSizeCatalogItemsPerRow } from './useSizeCatalogItemsPerRow';

function chunkItemsIntoPages<T>(items: T[], pageSize: number): T[][] {
  if (pageSize <= 0) {
    return [items];
  }
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += pageSize) {
    pages.push(items.slice(i, i + pageSize));
  }
  return pages;
}

function CatalogSizeCard({
  item,
  selected,
  onSelect,
  enterDelayMs,
  playEnterAnimation,
}: {
  item: SizeCatalogItemDto;
  selected: boolean;
  onSelect: () => void;
  enterDelayMs: number;
  playEnterAnimation: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={playEnterAnimation ? { animationDelay: `${enterDelayMs}ms` } : undefined}
      className={`flex h-[98px] w-[94px] shrink-0 flex-col items-center rounded-[10px] bg-white pt-1 transition-shadow ${
        playEnterAnimation ? 'animate-size-catalog-card-in' : ''
      } ${
        selected
          ? 'border-[2px] border-solid border-[#dcc090] shadow-none'
          : 'border border-transparent shadow-[0px_2px_8px_rgba(0,0,0,0.06)]'
      }`}
    >
      <div className="relative h-[54px] w-[40px] shrink-0 overflow-hidden">
        <img src={item.imageUrl} alt="" className="h-full w-full object-contain" />
      </div>
      <p className="mt-1 line-clamp-2 px-0.5 text-center font-montserrat text-[12px] font-medium leading-tight text-[#414141]">
        {item.title}
      </p>
    </button>
  );
}

function SizeBandScrollArrow({
  direction,
  enabled,
  language,
  onPress,
}: {
  direction: 'previous' | 'next';
  enabled: boolean;
  language: LanguageCode;
  onPress: () => void;
}) {
  const Icon = direction === 'previous' ? ChevronLeft : ChevronRight;
  const ariaKey =
    direction === 'previous'
      ? 'product.size_catalog_scroll_previous_aria'
      : 'product.size_catalog_scroll_next_aria';
  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={onPress}
      className={`flex shrink-0 items-center justify-center self-center bg-transparent p-1 text-[#414141] transition-opacity ${
        enabled ? 'cursor-pointer hover:opacity-70' : 'cursor-not-allowed opacity-30'
      }`}
      aria-label={t(language, ariaKey)}
    >
      <Icon className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" strokeWidth={2.25} aria-hidden />
    </button>
  );
}

function CatalogSizePagePanel({
  chunk,
  pageIdx,
  pageWidthPx,
  itemsPerRow,
  staggerStartIndex,
  priorCount,
  selectedItemId,
  suppressEnterAnimation,
  onSelectItem,
}: {
  chunk: SizeCatalogItemDto[];
  pageIdx: number;
  pageWidthPx: number;
  itemsPerRow: number;
  staggerStartIndex: number;
  priorCount: number;
  selectedItemId: string | null;
  suppressEnterAnimation: boolean;
  onSelectItem: (item: SizeCatalogItemDto) => void;
}) {
  const useScrollReveal = pageIdx > 0;
  const { pageRef, revealTick } = useCatalogPageRevealOnScroll(useScrollReveal);
  const slideStyle = { width: pageWidthPx, minWidth: pageWidthPx, flexShrink: 0 } as const;

  const playEnterAnimation = !suppressEnterAnimation && (!useScrollReveal || revealTick > 0);

  return (
    <div ref={pageRef} style={slideStyle} className="box-border snap-start">
      <div
        className={`grid grid-cols-3 justify-items-center gap-x-2 gap-y-5 sm:gap-x-4 sm:gap-y-6 md:grid-cols-4 lg:grid-cols-7 ${
          itemsPerRow > 0 && chunk.length > itemsPerRow ? 'grid-rows-2' : 'grid-rows-1'
        }`}
      >
        {chunk.map((item, i) => {
          const enterDelayMs = useScrollReveal
            ? SIZE_CATALOG_PAGE_CARD_STAGGER_BASE_MS + i * SIZE_CARD_STAGGER_MS
            : SIZE_CARD_STAGGER_BASE_MS + (staggerStartIndex + priorCount + i) * SIZE_CARD_STAGGER_MS;
          const cardKey = useScrollReveal ? `${item.id}-${revealTick}` : item.id;
          return (
            <CatalogSizeCard
              key={cardKey}
              item={item}
              selected={selectedItemId === item.id}
              enterDelayMs={enterDelayMs}
              playEnterAnimation={playEnterAnimation}
              onSelect={() => onSelectItem(item)}
            />
          );
        })}
      </div>
    </div>
  );
}

function CategorySizeCatalogPages({
  items,
  itemsPerRow,
  pageWidthPx,
  selectedItemId,
  staggerStartIndex,
  suppressEnterAnimation,
  onSelectItem,
}: {
  items: SizeCatalogItemDto[];
  itemsPerRow: number;
  pageWidthPx: number;
  selectedItemId: string | null;
  staggerStartIndex: number;
  suppressEnterAnimation: boolean;
  onSelectItem: (item: SizeCatalogItemDto) => void;
}) {
  const pageSize = itemsPerRow * 2;
  const pages = useMemo(() => chunkItemsIntoPages(items, pageSize), [items, pageSize]);

  return (
    <div className="flex flex-row snap-x snap-mandatory">
      {pages.map((chunk, pageIdx) => {
        const priorCount = pages.slice(0, pageIdx).reduce((acc, c) => acc + c.length, 0);
        return (
          <CatalogSizePagePanel
            key={`page-${pageIdx}-${chunk[0]?.id ?? 'empty'}`}
            chunk={chunk}
            pageIdx={pageIdx}
            pageWidthPx={pageWidthPx}
            itemsPerRow={itemsPerRow}
            staggerStartIndex={staggerStartIndex}
            priorCount={priorCount}
            selectedItemId={selectedItemId}
            suppressEnterAnimation={suppressEnterAnimation}
            onSelectItem={onSelectItem}
          />
        );
      })}
    </div>
  );
}

function CatalogCategorySizeBandView({
  category,
  selectedItemId,
  language,
  onSelectItem,
  sectionHeadingDelayMs,
  staggerStartIndex,
  itemsPerRow,
  scrollerRef,
  pageWidthPx,
  hasOverflow,
  canScrollLeft,
  canScrollRight,
  scrollByDirection,
  modalMotion,
  suppressEnterAnimation,
}: {
  category: SizeCatalogCategoryDto;
  selectedItemId: string | null;
  language: LanguageCode;
  onSelectItem: (item: SizeCatalogItemDto) => void;
  sectionHeadingDelayMs: number;
  staggerStartIndex: number;
  modalMotion: SizeModalMotionState;
  suppressEnterAnimation: boolean;
  itemsPerRow: number;
  scrollerRef: RefObject<HTMLDivElement>;
  pageWidthPx: number;
  hasOverflow: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  scrollByDirection: (dir: -1 | 1) => void;
}) {
  return (
    <section aria-label={category.title}>
      <div className="flex min-h-0 items-center gap-2 sm:gap-3">
        {hasOverflow ? (
          <SizeBandScrollArrow
            direction="previous"
            enabled={canScrollLeft}
            language={language}
            onPress={() => scrollByDirection(-1)}
          />
        ) : null}
        <h3
          className={`font-montserrat text-[22px] font-extrabold leading-none text-[#414141] sm:text-[24px] ${sizeModalBlockClass(modalMotion)} ${
            hasOverflow ? 'min-w-0 flex-1 truncate' : 'w-full'
          }`}
          style={{
            transitionDelay: sizeModalBlockTransitionDelay(
              Math.max(0, sectionHeadingDelayMs),
              0,
              modalMotion
            ),
          }}
        >
          {category.title}
        </h3>
        {hasOverflow ? (
          <SizeBandScrollArrow
            direction="next"
            enabled={canScrollRight}
            language={language}
            onPress={() => scrollByDirection(1)}
          />
        ) : null}
      </div>
      <div className="relative mt-[36px] min-h-0 w-full">
        <div
          ref={scrollerRef}
          className="scrollbar-hide w-full min-w-0 scroll-smooth overflow-x-auto overflow-y-hidden"
        >
          {pageWidthPx > 0 ? (
            <CategorySizeCatalogPages
              items={category.items}
              itemsPerRow={itemsPerRow}
              pageWidthPx={pageWidthPx}
              selectedItemId={selectedItemId}
              staggerStartIndex={staggerStartIndex}
              suppressEnterAnimation={suppressEnterAnimation}
              onSelectItem={onSelectItem}
            />
          ) : (
            <div className="min-h-[220px]" aria-hidden />
          )}
        </div>
      </div>
    </section>
  );
}

export function CatalogCategorySizeBand({
  category,
  selectedItemId,
  language,
  onSelectItem,
  sectionHeadingDelayMs,
  staggerStartIndex,
  modalMotion,
  suppressEnterAnimation = false,
}: {
  category: SizeCatalogCategoryDto;
  selectedItemId: string | null;
  language: LanguageCode;
  onSelectItem: (item: SizeCatalogItemDto) => void;
  sectionHeadingDelayMs: number;
  staggerStartIndex: number;
  modalMotion: SizeModalMotionState;
  suppressEnterAnimation?: boolean;
}) {
  const itemsPerRow = useSizeCatalogItemsPerRow();
  const resyncToken = `${category.id}:${category.items.length}:${itemsPerRow}`;
  const { scrollerRef, hasOverflow, canScrollLeft, canScrollRight, scrollByDirection } =
    useSizeCatalogHorizontalScroll(resyncToken);
  const pageWidthPx = useScrollerClientWidth(scrollerRef, resyncToken);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (el) {
      el.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [itemsPerRow]);

  return (
    <CatalogCategorySizeBandView
      category={category}
      selectedItemId={selectedItemId}
      language={language}
      onSelectItem={onSelectItem}
      sectionHeadingDelayMs={sectionHeadingDelayMs}
      staggerStartIndex={staggerStartIndex}
      itemsPerRow={itemsPerRow}
      scrollerRef={scrollerRef}
      pageWidthPx={pageWidthPx}
      hasOverflow={hasOverflow}
      canScrollLeft={canScrollLeft}
      canScrollRight={canScrollRight}
      scrollByDirection={scrollByDirection}
      modalMotion={modalMotion}
      suppressEnterAnimation={suppressEnterAnimation}
    />
  );
}
