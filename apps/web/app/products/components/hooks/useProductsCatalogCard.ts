'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAddToCart } from '../../../../components/hooks/useAddToCart';
import { useCurrency } from '../../../../components/hooks/useCurrency';
import { formatCatalogPrice } from '../../../../lib/currency';
import {
  getCatalogProductsSmViewportSnapshot,
  getServerCatalogProductsSmViewportSnapshot,
  subscribeCatalogProductsSmViewport,
} from '../catalogProductCardMobilePresentation';
import { buildCatalogCardPresentation } from '../productsCatalogCardPresentation';
import { MAX_IMAGE_DOT_COUNT, resolveOpaqueCompensationScale } from '../productsCatalogCardImage.utils';
import type { ProductsCatalogCardProps } from '../productsCatalogCard.types';

function normalizeCatalogText(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

/** Admin "display" variant gallery — shown on catalog cards before a size is picked. */
function resolveDefaultVariantImages(product: ProductsCatalogCardProps['product']): string[] {
  const variants = product.variantImages ?? [];
  if (variants.length === 0) {
    return [];
  }

  const defaultVariantId = (product.defaultVariantId ?? '').trim();
  if (defaultVariantId) {
    const defaultMatch = variants.find((variant) => variant.variantId === defaultVariantId);
    if (defaultMatch && defaultMatch.images.length > 0) {
      return defaultMatch.images;
    }
  }

  return variants.find((variant) => variant.images.length > 0)?.images ?? [];
}

function resolveActiveVariantImages(props: ProductsCatalogCardProps): string[] {
  const selectedSize = normalizeCatalogText(props.selectedSize);
  if (!selectedSize || selectedSize === 'all') {
    return resolveDefaultVariantImages(props.product);
  }
  const selectedCategoryId = (props.selectedSizeCatalogCategoryId ?? '').trim();
  const selectedCategoryTitle = normalizeCatalogText(props.selectedSizeCatalogCategoryTitle);
  const variants = props.product.variantImages ?? [];
  const hasCategoryMetadata = variants.some(
    (variant) => Boolean(variant.sizeCatalogCategoryId) || Boolean(variant.sizeCatalogCategoryTitle)
  );
  const categoryMatcher = (variant: { sizeCatalogCategoryId: string | null; sizeCatalogCategoryTitle: string | null }) =>
    !hasCategoryMetadata ||
    !selectedCategoryId ||
    variant.sizeCatalogCategoryId === selectedCategoryId ||
    normalizeCatalogText(variant.sizeCatalogCategoryTitle) === selectedCategoryTitle;
  const matchedVariant = variants.find((variant) => {
    const sizeMatches =
      variant.sizeLabels.some((label) => normalizeCatalogText(label) === selectedSize) ||
      normalizeCatalogText(variant.sizeCatalogCategoryTitle) === selectedSize;
    const categoryMatches =
      categoryMatcher(variant);
    return sizeMatches && categoryMatches && variant.images.length > 0;
  }) ?? variants.find((variant) => categoryMatcher(variant) && variant.images.length > 0);
  return matchedVariant?.images ?? [];
}

export function useProductsCatalogCard(props: ProductsCatalogCardProps) {
  const {
    product,
    sizeLabel,
    categoryLabel,
    shouldBlockProductNavigation,
    compactLayout = false,
    legacyHomeCartIcon = false,
    catalogStripMobilePeek = false,
    trendingSectionCard = false,
    unifiedNavCta = false,
  } = props;

  const showUnifiedNavCta = trendingSectionCard || unifiedNavCta;

  const isSmUp = useSyncExternalStore(
    subscribeCatalogProductsSmViewport,
    getCatalogProductsSmViewportSnapshot,
    getServerCatalogProductsSmViewportSnapshot
  );
  const displayCurrency = useCurrency();
  const isAmdCurrency = displayCurrency === 'AMD';
  const router = useRouter();
  const { isAddingToCart, addToCart } = useAddToCart({
    productId: product.id,
    productSlug: product.slug,
    title: product.title,
    price: product.price ?? 0,
    image: product.image,
    originalPrice: product.originalPrice ?? null,
    inStock: product.inStock,
    defaultVariantId: product.defaultVariantId ?? null,
    defaultVariantStock: product.defaultVariantStock ?? 0,
    defaultSku: product.defaultSku ?? '',
    sizeLabel,
    categoryLabel,
  });

  const productImages = useMemo(() => {
    const variantImages = resolveActiveVariantImages(props);
    const rawImages = variantImages.length > 0
      ? variantImages
      : product.images && product.images.length > 0
        ? product.images
        : [product.image];
    return rawImages.filter(
      (image, index, images): image is string => Boolean(image) && images.indexOf(image) === index
    );
  }, [
    product.defaultVariantId,
    product.image,
    product.images,
    product.variantImages,
    props.selectedSize,
    props.selectedSizeCatalogCategoryId,
    props.selectedSizeCatalogCategoryTitle,
  ]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [activeImageAspectRatio, setActiveImageAspectRatio] = useState<number | null>(null);
  const [activeImageOpaqueCompensation, setActiveImageOpaqueCompensation] = useState(1);
  const visibleDotCount = Math.min(productImages.length, MAX_IMAGE_DOT_COUNT);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [
    product.id,
    props.selectedSize,
    props.selectedSizeCatalogCategoryId,
    props.selectedSizeCatalogCategoryTitle,
  ]);

  useEffect(() => {
    setActiveImageIndex((previous) => {
      if (productImages.length === 0) {
        return 0;
      }
      return previous >= productImages.length ? 0 : previous;
    });
  }, [product.id, productImages.length]);

  useEffect(() => {
    setImageError(false);
  }, [activeImageIndex, product.id]);

  useEffect(() => {
    setActiveImageAspectRatio(null);
    setActiveImageOpaqueCompensation(1);
  }, [activeImageIndex, product.id, product.image, productImages.length]);

  const activeImage = productImages[activeImageIndex] ?? product.image;
  const activeImageMeasureKey = `${product.id}-${activeImageIndex}-${activeImage ?? ''}`;
  const activeImageMeasureKeyRef = useRef(activeImageMeasureKey);
  useEffect(() => {
    activeImageMeasureKeyRef.current = activeImageMeasureKey;
  }, [activeImageMeasureKey]);

  const presentation = buildCatalogCardPresentation({
    ...props,
    isSmUp,
    activeImageAspectRatio,
    activeImageOpaqueCompensation,
  });

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    addToCart();
  };

  const handleBuyNow = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    await addToCart({ openDrawer: false });
    router.push('/checkout');
  };

  const handleProductLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (shouldBlockProductNavigation?.()) {
      event.preventDefault();
    }
  };

  const handleShopNavigate = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (shouldBlockProductNavigation?.()) {
      return;
    }
    router.push(`/products/${product.slug}`);
  };

  const handleImageLoadComplete = (imageElement: HTMLImageElement) => {
    const naturalWidth = imageElement.naturalWidth;
    const naturalHeight = imageElement.naturalHeight;
    if (naturalWidth > 0 && naturalHeight > 0) {
      setActiveImageAspectRatio(naturalHeight / naturalWidth);
    }
    const measureKey = activeImageMeasureKey;
    const opaqueScale = resolveOpaqueCompensationScale(imageElement, activeImage);
    if (activeImageMeasureKeyRef.current === measureKey) {
      setActiveImageOpaqueCompensation(opaqueScale);
    }
  };

  const formattedPrice = formatCatalogPrice(product.price ?? 0, displayCurrency);
  const amountText = isAmdCurrency ? formattedPrice.replace(/\s?֏$/, '') : formattedPrice;

  return {
    presentation,
    product,
    compactLayout,
    legacyHomeCartIcon,
    catalogStripMobilePeek,
    activeImage,
    activeImageIndex,
    imageError,
    visibleDotCount,
    setActiveImageIndex,
    handleAddToCart,
    handleBuyNow,
    handleProductLinkClick,
    handleShopNavigate,
    handleImageLoadComplete,
    setImageError,
    isAddingToCart,
    amountText,
    isAmdCurrency,
    sizeLabel,
    categoryLabel,
    className: props.className,
    productsCatalogPage: props.productsCatalogPage,
    catalogBuyOnlyCta: props.catalogBuyOnlyCta ?? false,
    imageFrameClassName: props.imageFrameClassName,
    eagerProductImage: props.eagerProductImage,
    buyButtonLabel: props.buyButtonLabel,
    trendingSectionCard,
    unifiedNavCta,
    showUnifiedNavCta,
  };
}
