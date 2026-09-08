import type { Product } from '../types';

/** Total stock across colors, falling back to the product-level stock. */
export function getProductTotalStock(product: Product): number {
  if (product.colorStocks && product.colorStocks.length > 0) {
    return product.colorStocks.reduce((sum, colorStock) => sum + (colorStock.stock || 0), 0);
  }
  return product.stock ?? 0;
}

function compare(a: number | string, b: number | string, direction: number): number {
  if (a === b) {
    return 0;
  }
  return a > b ? direction : -direction;
}

/**
 * Sorts the loaded page by title/price/stock.
 * `createdAt` is sorted by the API, so the list is returned untouched.
 */
export function sortProductsClientSide(products: Product[], sortBy: string): Product[] {
  if (!sortBy || sortBy.startsWith('createdAt')) {
    return products;
  }

  const [field, directionRaw] = sortBy.split('-');
  const direction = directionRaw === 'asc' ? 1 : -1;
  const sorted = [...products];

  if (field === 'price') {
    return sorted.sort((a, b) => compare(a.price ?? 0, b.price ?? 0, direction));
  }

  if (field === 'title') {
    return sorted.sort((a, b) =>
      compare((a.title || '').toLowerCase(), (b.title || '').toLowerCase(), direction),
    );
  }

  if (field === 'stock') {
    return sorted.sort((a, b) =>
      compare(getProductTotalStock(a), getProductTotalStock(b), direction),
    );
  }

  return sorted;
}
