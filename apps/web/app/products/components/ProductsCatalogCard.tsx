'use client';

import { useProductsCatalogCard } from './hooks/useProductsCatalogCard';
import { ProductsCatalogCardView } from './ProductsCatalogCardView';
import type { CatalogProductCardItem, ProductsCatalogCardProps } from './productsCatalogCard.types';

export type { CatalogProductCardItem, ProductsCatalogCardProps } from './productsCatalogCard.types';

/**
 * Canonical Figma-styled product card (catalog, home, related products, legacy grids).
 */
export function ProductsCatalogCard(props: ProductsCatalogCardProps) {
  const card = useProductsCatalogCard(props);
  return <ProductsCatalogCardView {...card} />;
}
