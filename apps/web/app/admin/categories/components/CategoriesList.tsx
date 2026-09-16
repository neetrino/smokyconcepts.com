'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../../../lib/i18n-client';
import { buildCategoryTree, reorderSiblingIds } from '../utils';
import { CategoryItem } from './CategoryItem';
import { CategoriesPagination } from './CategoriesPagination';
import type { Category, CategoryWithLevel } from '../types';

interface CategoriesListProps {
  categories: Category[];
  reordering: boolean;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string, categoryTitle: string) => void;
  onReorderSiblings: (orderedIds: string[]) => Promise<void>;
}

const ITEMS_PER_PAGE = 20;

export function CategoriesList({
  categories,
  reordering,
  onEdit,
  onDelete,
  onReorderSiblings,
}: CategoriesListProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);

  const totalPages = Math.ceil(categoryTree.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCategories = categoryTree.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [categories.length]);

  const handleDrop = async (targetCategoryId: string) => {
    if (!draggingId || reordering) {
      setDraggingId(null);
      setDropTargetId(null);
      return;
    }

    const dragged = categories.find((category) => category.id === draggingId);
    const target = categories.find((category) => category.id === targetCategoryId);
    if (!dragged || !target) {
      setDraggingId(null);
      setDropTargetId(null);
      return;
    }

    const draggedParentId = dragged.parentId ?? null;
    const targetParentId = target.parentId ?? null;
    if (draggedParentId !== targetParentId) {
      setDraggingId(null);
      setDropTargetId(null);
      return;
    }

    const siblingIds = categories
      .filter((category) => (category.parentId ?? null) === draggedParentId)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || a.title.localeCompare(b.title))
      .map((category) => category.id);

    const nextOrder = reorderSiblingIds(siblingIds, draggingId, targetCategoryId);
    setDraggingId(null);
    setDropTargetId(null);

    if (!nextOrder) {
      return;
    }

    await onReorderSiblings(nextOrder);
  };

  if (categoryTree.length === 0) {
    return <p className="py-2 text-sm text-[#414141]/60">{t('admin.categories.noCategories')}</p>;
  }

  return (
    <>
      <p className="mb-3 text-xs text-[#414141]/55">{t('admin.categories.dragToSortHint')}</p>
      <div className={`space-y-2 ${reordering ? 'pointer-events-none opacity-70' : ''}`}>
        {paginatedCategories.map((category: CategoryWithLevel) => {
          const parentCategory = category.parentId
            ? categories.find((c) => c.id === category.parentId)
            : null;

          return (
            <CategoryItem
              key={category.id}
              category={category}
              parentCategory={parentCategory || null}
              isDragging={draggingId === category.id}
              isDropTarget={dropTargetId === category.id && draggingId !== category.id}
              onEdit={onEdit}
              onDelete={onDelete}
              onDragStart={setDraggingId}
              onDragOver={setDropTargetId}
              onDragEnd={() => {
                setDraggingId(null);
                setDropTargetId(null);
              }}
              onDrop={handleDrop}
            />
          );
        })}
      </div>

      <CategoriesPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={categoryTree.length}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
