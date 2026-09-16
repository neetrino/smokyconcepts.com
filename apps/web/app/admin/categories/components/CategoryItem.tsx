'use client';

import { Button } from '@shop/ui';
import { formatPriceInCurrency } from '@/lib/currency';
import { useTranslation } from '../../../../lib/i18n-client';
import type { Category, CategoryWithLevel } from '../types';

interface CategoryItemProps {
  category: CategoryWithLevel;
  parentCategory: Category | null;
  isDragging: boolean;
  isDropTarget: boolean;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string, categoryTitle: string) => void;
  onDragStart: (categoryId: string) => void;
  onDragOver: (categoryId: string) => void;
  onDragEnd: () => void;
  onDrop: (targetCategoryId: string) => void;
}

export function CategoryItem({
  category,
  parentCategory,
  isDragging,
  isDropTarget,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: CategoryItemProps) {
  const { t } = useTranslation();
  const levelPaddingClass =
    category.level === 0
      ? 'pl-3'
      : category.level === 1
        ? 'pl-9'
        : 'pl-14';

  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${levelPaddingClass} ${
        isDragging
          ? 'border-[#dcc090] bg-[#dcc090]/20 opacity-60'
          : isDropTarget
            ? 'border-[#122a26] bg-[#dcc090]/25'
            : 'border-[#dcc090]/25 bg-white/70 hover:border-[#dcc090] hover:bg-[#dcc090]/10'
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver(category.id);
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(category.id);
      }}
    >
      <div className="flex flex-1 items-center gap-3">
        <div
          role="button"
          tabIndex={0}
          draggable
          title={t('admin.categories.dragToSort')}
          aria-label={t('admin.categories.dragToSort')}
          className="flex h-8 w-6 shrink-0 cursor-grab items-center justify-center rounded text-[#414141]/45 transition-colors hover:bg-[#dcc090]/20 hover:text-[#122a26] active:cursor-grabbing"
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', category.id);
            onDragStart(category.id);
          }}
          onDragEnd={onDragEnd}
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <circle cx="5" cy="3.5" r="1.25" />
            <circle cx="11" cy="3.5" r="1.25" />
            <circle cx="5" cy="8" r="1.25" />
            <circle cx="11" cy="8" r="1.25" />
            <circle cx="5" cy="12.5" r="1.25" />
            <circle cx="11" cy="12.5" r="1.25" />
          </svg>
        </div>
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt={category.title}
            className="h-12 w-12 rounded-lg border border-[#dcc090]/30 bg-white object-cover"
          />
        ) : null}
        <div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-[#122a26]">{category.title}</div>
            {category.requiresSizes && (
              <span className="rounded bg-[#dcc090]/35 px-2 py-0.5 text-xs text-[#122a26]">
                Sizes
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-[#414141]/55">
            {category.slug}
            {parentCategory && (
              <span className="ml-2 text-[#414141]/45">
                → Parent: {parentCategory.title}
              </span>
            )}
            {(category.priceAmd ?? 0) > 0 && (
              <span className="ml-2 text-[#122a26]/70">
                {t('admin.categories.categoryPriceAmd')}: {formatPriceInCurrency(category.priceAmd ?? 0, 'AMD')}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(category)}
          className="text-[#122a26] hover:bg-[#dcc090]/15 hover:text-[#122a26]"
        >
          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {t('admin.common.edit')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(category.id, category.title)}
          className="text-red-600 hover:bg-red-50 hover:text-red-800"
        >
          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {t('admin.common.delete')}
        </Button>
      </div>
    </div>
  );
}
