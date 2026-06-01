import type { LanguageCode } from '../../../lib/language';
import type { SizeCatalogItemDto } from '@/lib/types/size-catalog';
import type { AttributeGroupValue, Product, ProductVariant } from './types';
import type { CustomOrderDraft } from './CustomizeSizeOrderFallback';
import type { CustomizeFormatState } from './utils/build-customize-preview-html';

export type ProductTabKey = 'description' | 'details' | 'shipping' | 'customize';

export interface ProductOptionValue extends AttributeGroupValue {
  colors?: string[] | string | null;
}

/**
 * PDP actions — add/buy handlers are wired to `useProductCartActions` on the parent page
 * (fast snapshot + optional POST, no extra GET before add).
 */
export interface ProductInfoAndActionsProps {
  product: Product;
  /** Last applied customize (cart). */
  appliedCustomize: { plain: string; html: string | null } | null;
  onCustomizeApplied: (value: { plain: string; html: string | null } | null) => void;
  /** Rich preview HTML for cart — built from draft text + toolbar format on the parent. */
  getCustomizeSanitizedHtml: () => string;
  /** Show Figma black-body preview in the hero gallery while customize text is entered. */
  showCustomizeHeroPreview: boolean;
  /** @deprecated Use showCustomizeHeroPreview */
  showCustomizePackPreview?: boolean;
  /** Live / applied HTML rendered on the pack preview. */
  customizePreviewHtml?: string | null;
  customizeFormat: CustomizeFormatState;
  onCustomizeFormatChange: (next: CustomizeFormatState) => void;
  /** Plain line next to Apply — drives editor seed when it does not match applied rich HTML. */
  customizeDraftText: string;
  onCustomizeDraftTextChange: (value: string) => void;
  customizeTextMaxLength: number;
  price: number;
  language: LanguageCode;
  isOutOfStock: boolean;
  canAddToCart: boolean;
  isAddingToCart: boolean;
  showMessage: string | null;
  currentVariant: ProductVariant | null;
  selectedColor: string | null;
  selectedSize: string | null;
  colorOptions: ProductOptionValue[];
  sizeOptions: ProductOptionValue[];
  onColorSelect: (color: string) => void;
  onSizeSelect: (size: string) => void;
  /** Select variant by size collection + version from size catalog modal item. */
  onCatalogVariantSelect?: (sizeCollectionTitle: string, version: string) => void;
  /** Add to cart — stay on page and open cart drawer. */
  onAddToCart: () => Promise<void>;
  /** Sync size-catalog selection to parent for cart / checkout snapshot */
  onSelectedCatalogSizeChange?: (item: SizeCatalogItemDto | null) => void;
  /** Sync custom-size request selection to parent for checkout payload */
  onSelectedCustomSizeRequestChange?: (request: CustomOrderDraft | null) => void;
  /** Fires when the Customize tab is selected — parent loads fonts / toolbar only then. */
  onCustomizeTabActiveChange?: (active: boolean) => void;
}
