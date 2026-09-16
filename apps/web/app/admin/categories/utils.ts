import type { Category, CategoryWithLevel } from './types';

/** Parses a non-negative AMD integer from admin collection price inputs. */
export function parsePriceAmd(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

const MAX_SAFE_POSITION = Number.MAX_SAFE_INTEGER;

function compareByPosition(a: Category, b: Category): number {
  const positionA = typeof a.position === 'number' ? a.position : MAX_SAFE_POSITION;
  const positionB = typeof b.position === 'number' ? b.position : MAX_SAFE_POSITION;
  if (positionA !== positionB) {
    return positionA - positionB;
  }
  return a.title.localeCompare(b.title);
}

/**
 * Build category tree with hierarchy levels, ordered by position within each parent.
 */
export function buildCategoryTree(categories: Category[]): CategoryWithLevel[] {
  type CategoryWithLevelInternal = Category & { level: number; children?: CategoryWithLevelInternal[] };

  const categoryMap = new Map<string, CategoryWithLevelInternal>();
  const rootCategories: CategoryWithLevelInternal[] = [];

  categories.forEach((cat) => {
    const { children: _children, ...catWithoutChildren } = cat;
    categoryMap.set(cat.id, { ...catWithoutChildren, level: 0 });
  });

  categories.forEach((cat) => {
    const categoryNode = categoryMap.get(cat.id)!;
    if (cat.parentId && categoryMap.has(cat.parentId)) {
      const parent = categoryMap.get(cat.parentId)!;
      if (!parent.children) {
        parent.children = [];
      }
      categoryNode.level = (parent.level || 0) + 1;
      parent.children.push(categoryNode);
    } else {
      rootCategories.push(categoryNode);
    }
  });

  rootCategories.sort(compareByPosition);
  categoryMap.forEach((node) => {
    if (node.children) {
      node.children.sort(compareByPosition);
    }
  });

  const flattenTree = (
    nodes: CategoryWithLevelInternal[],
    result: CategoryWithLevel[] = []
  ): CategoryWithLevel[] => {
    nodes.forEach((node) => {
      result.push({ ...node, level: node.level });
      if (node.children) {
        flattenTree(node.children, result);
      }
    });
    return result;
  };

  return flattenTree(rootCategories);
}

/**
 * Reorder a sibling list so `draggedId` moves to the index of `targetId`.
 */
export function reorderSiblingIds(
  siblingIds: string[],
  draggedId: string,
  targetId: string
): string[] | null {
  if (draggedId === targetId) {
    return null;
  }

  const fromIndex = siblingIds.indexOf(draggedId);
  const toIndex = siblingIds.indexOf(targetId);
  if (fromIndex < 0 || toIndex < 0) {
    return null;
  }

  const next = [...siblingIds];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) {
    return null;
  }
  next.splice(toIndex, 0, moved);
  return next;
}
