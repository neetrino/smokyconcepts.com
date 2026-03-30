export type HomeBadgeTone = 'dark' | 'gold' | 'wine' | 'charcoal';

export interface HomeSimpleCardItem {
  title: string;
  imageSrc: string;
}

export interface HomeCoverCollectionItem {
  title: string;
  slug: string;
  imageSrc?: string;
}

export interface HomePackFitItem {
  title: string;
  subtitle?: string;
  heightClassName: string;
  widthClassName: string;
  useCompactImage?: boolean;
}

export interface HomeProductItem {
  name: string;
  size: string;
  price: string;
  imageSrc: string;
  badge: string;
  badgeTone: HomeBadgeTone;
  actionLabel: string;
  compact?: boolean;
  faded?: boolean;
  /** When set, card and action link to product page */
  slug?: string;
}

export interface HomeRitualStep {
  step: string;
  title: string;
  description: string;
}
