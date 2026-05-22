import type { CatalogProduct } from './catalogProductLabels';
import type { SortOption } from './productsCatalogView.types';

export function sortProducts(products: CatalogProduct[], sortBy: SortOption): CatalogProduct[] {
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
