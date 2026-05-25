import type { Ref, TransitionEvent } from 'react';

import type { CatalogProduct } from '../../app/products/components/catalogProductLabels';

export interface ApiProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string | null;
  images?: string[];
  inStock?: boolean;
  categories?: Array<{ id: string; slug: string; title: string }>;
  brand?: { id: string; name: string } | null;
  skus?: string[];
  colors?: string[];
  originalPrice?: number | null;
  defaultVariantId?: string | null;
  defaultVariantStock?: number;
  defaultSku?: string;
}

export interface ProductsResponse {
  data: ApiProduct[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

export interface TrendingPage {
  key: string;
  items: CatalogProduct[];
  categoryLabel: string;
}

export interface TrendingCoverflowTrackProps {
  pages: TrendingPage[];
  currentDisplayIndex: number;
  suppressTransition: boolean;
  isXl: boolean;
  trackRef: Ref<HTMLDivElement>;
  onTrackTransitionEnd: (event: TransitionEvent<HTMLDivElement>) => void;
  dragOffsetPx?: number;
  isDragging?: boolean;
}

export interface TrendingMobilePageClusterProps {
  items: CatalogProduct[];
  catalogStartIndex: number;
  eager: boolean;
}

export interface TrendingDesktopPageClusterProps {
  items: CatalogProduct[];
  catalogStartIndex: number;
  eager: boolean;
  label: string;
  isFocal: boolean;
  freezeClusterMotion?: boolean;
}

export interface TrendingPageSliderProps {
  prevLabel: string;
  currentLabel: string;
  nextLabel: string;
  onPrev: () => void;
  onNext: () => void;
  disabled: boolean;
  prevAria: string;
  nextAria: string;
}
