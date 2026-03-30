'use client';

import { ProductsCatalogCard } from '../app/products/components/ProductsCatalogCard';
import {
  getCategoryLabel,
  getSectionLabel,
  getSizeLabel,
  toCatalogProduct,
} from '../app/products/components/catalogProductLabels';
import type { ProductLabel } from './ProductLabels';

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string | null;
  images?: string[];
  inStock: boolean;
  categories: Array<{
    id: string;
    slug: string;
    title: string;
  }>;
  brand?: {
    id: string;
    name: string;
  } | null;
  labels?: ProductLabel[];
  skus?: string[];
  colors?: string[];
  compareAtPrice?: number | null;
  originalPrice?: number | null;
  globalDiscount?: number | null;
  discountPercent?: number | null;
}

type ViewMode = 'list' | 'grid-2' | 'grid-3';

interface ProductCardProps {
  product: Product;
  viewMode?: ViewMode;
}

/**
 * Renders the shared catalog product card for legacy grids and featured sections.
 */
export function ProductCard({ product, viewMode = 'grid-3' }: ProductCardProps) {
  const catalogProduct = toCatalogProduct({
    id: product.id,
    slug: product.slug,
    title: product.title,
    price: product.price,
    image: product.image,
    images: product.images,
    inStock: product.inStock,
    categories: product.categories,
    skus: product.skus,
    colors: product.colors,
  });
  const section = getSectionLabel(catalogProduct);

  const card = (
    <ProductsCatalogCard
      product={catalogProduct}
      sectionLabel={section}
      sizeLabel={getSizeLabel(catalogProduct)}
      categoryLabel={getCategoryLabel(catalogProduct, section)}
      compactLayout
    />
  );

  if (viewMode === 'list') {
    return (
      <div className="flex w-full justify-center py-2 sm:justify-start">
        {card}
      </div>
    );
  }

  return <div className="flex justify-center">{card}</div>;
}
