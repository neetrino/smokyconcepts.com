export interface CatalogProductCardItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string | null;
  images?: string[];
  inStock: boolean;
  originalPrice?: number | null;
  /** From list API — required for local-only cart lines */
  defaultVariantId?: string | null;
  defaultVariantStock?: number;
  defaultSku?: string;
}

export interface ProductsCatalogCardProps {
  product: CatalogProductCardItem;
  sectionLabel: string;
  sizeLabel: string;
  categoryLabel: string;
  className?: string;
  tightenDetailsUnderImage?: boolean;
  imageScaleBoost?: number;
  imageNudgeDown?: boolean;
  compactLayout?: boolean;
  /** Slightly wider compact card (e.g. PDP related strip) without affecting home/catalog compact rows. */
  widerCompactCard?: boolean;
  /**
   * Home-only: keep the legacy outline bag asset.
   * Everywhere else uses the filled catalog cart icon (`bag-catalog.svg`).
   */
  legacyHomeCartIcon?: boolean;
  /** When true (e.g. carousel drag), product links do not navigate. */
  shouldBlockProductNavigation?: () => boolean;
  /** Omit default card drop shadow (e.g. trending carousel center hero card). */
  suppressShadow?: boolean;
  /** Optional CTA label override for section-specific wording (e.g. Upcoming => Order). */
  buyButtonLabel?: string;
  /** Merged onto the compact/non-compact product image frame (below pull-up); use for section-specific tweaks. */
  imageFrameClassName?: string;
  /**
   * When true, the hero product image loads eagerly (avoids lazy decode when the card sits in a clipped carousel track).
   */
  eagerProductImage?: boolean;
  /**
   * With `compactLayout`, below `lg` the card uses a viewport-based width so ~half of the next
   * card shows in the horizontal catalog strip (mobile / tablet scroll hint).
   */
  catalogStripMobilePeek?: boolean;
  /** Products catalog: slightly narrower card + shorter image stack (more grid gap from parent). */
  slimCatalogGrid?: boolean;
  /** `/products` — slightly less vertical gap between hero image and details. */
  productsCatalogPage?: boolean;
  /** `/products` catalog strip/grid: Buy only (no separate cart icon). */
  catalogBuyOnlyCta?: boolean;
  /** Home trending carousel — keeps legacy card geometry separate from `/products` strip tuning. */
  trendingSectionCard?: boolean;
  /**
   * Home sections (e.g. Upcoming): single CTA with `buyButtonLabel` + bag icon navigates to PDP.
   * Trending enables the same via `trendingSectionCard`.
   */
  unifiedNavCta?: boolean;
  /** `/products` only: per-card hero scale multiplier (for visual balancing by index). */
  productsCatalogPageScaleMultiplier?: number;
  /** Overrides default catalog hero pull-up below `sm` (e.g. home trending). */
  catalogHeroPullUpClassName?: string;
  /** Overrides default catalog card top padding below `sm`. */
  catalogCardTopPaddingClassName?: string;
  /** Overrides default catalog details negative margin below `sm`. */
  catalogDetailsOffsetClassName?: string;
  /** Overrides default gap under the hero image wrapper on catalog cards. */
  catalogImageBottomMarginClassName?: string;
}
