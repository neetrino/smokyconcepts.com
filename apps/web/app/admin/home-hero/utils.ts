/**
 * Move an item from one index to another. Returns null when the order is unchanged.
 */
export function reorderByIndex<T>(items: T[], fromIndex: number, toIndex: number): T[] | null {
  if (fromIndex === toIndex) {
    return null;
  }
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
    return null;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  if (moved === undefined) {
    return null;
  }
  next.splice(toIndex, 0, moved);
  return next;
}

/**
 * Keep a tracked index pointing at the same item after a list move.
 */
export function remapIndexAfterMove(index: number, fromIndex: number, toIndex: number): number {
  if (index === fromIndex) {
    return toIndex;
  }
  if (fromIndex < toIndex && index > fromIndex && index <= toIndex) {
    return index - 1;
  }
  if (fromIndex > toIndex && index >= toIndex && index < fromIndex) {
    return index + 1;
  }
  return index;
}
