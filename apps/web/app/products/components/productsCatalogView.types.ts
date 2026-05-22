import type { CatalogProduct } from './catalogProductLabels';

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export interface ProductsCatalogViewProps {
  products: CatalogProduct[];
}

export interface CatalogSectionViewModel {
  title: string;
  items: CatalogProduct[];
  totalPages: number;
  currentPage: number;
  pageItems: CatalogProduct[];
}
