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
import {
  resolveCatalogCardSizeLabelFromVariant,
} from '../catalogProductLabels';
import type { CatalogProductVariantImages, ProductsCatalogCardProps } from '../productsCatalogCard.types';

function normalizeCatalogText(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function resolveActiveVariantEntry(props: ProductsCatalogCardProps): CatalogProductVariantImages | null {
  const variants = props.product.variantImages ?? [];
  if (variants.length === 0) {
    return null;
  }

  const selectedSize = normalizeCatalogText(props.selectedSize);
  if (!selectedSize || selectedSize === 'all') {
    const defaultVariantId = (props.product.defaultVariantId ?? '').trim();
    if (defaultVariantId) {
      const defaultMatch = variants.find((variant) => variant.variantId === defaultVariantId);
      if (defaultMatch) {
        return defaultMatch;
      }
    }
    return variants[0] ?? null;
  }

  const selectedCategoryId = (props.selectedSizeCatalogCategoryId ?? '').trim();
  const selectedCategoryTitle = normalizeCatalogText(props.selectedSizeCatalogCategoryTitle);
  const hasCategoryMetadata = variants.some(
    (variant) => Boolean(variant.sizeCatalogCategoryId) || Boolean(variant.sizeCatalogCategoryTitle)
  );
  const categoryMatcher = (variant: { sizeCatalogCategoryId: string | null; sizeCatalogCategoryTitle: string | null }) =>
    !hasCategoryMetadata ||
    !selectedCategoryId ||
    variant.sizeCatalogCategoryId === selectedCategoryId ||
    normalizeCatalogText(variant.sizeCatalogCategoryTitle) === selectedCategoryTitle;

  return (
    variants.find((variant) => {
      const sizeMatches =
        variant.sizeLabels.some((label) => normalizeCatalogText(label) === selectedSize) ||
        normalizeCatalogText(variant.sizeCatalogCategoryTitle) === selectedSize;
      return sizeMatches && categoryMatcher(variant);
    }) ?? variants.find((variant) => categoryMatcher(variant)) ?? null
  );
}

function resolveActiveVariantImages(props: ProductsCatalogCardProps): string[] {
  return resolveActiveVariantEntry(props)?.images ?? [];
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

  const activeVariantEntry = useMemo(
    () => resolveActiveVariantEntry(props),
    [
      product.defaultVariantId,
      product.variantImages,
      props.selectedSize,
      props.selectedSizeCatalogCategoryId,
      props.selectedSizeCatalogCategoryTitle,
    ]
  );

  const displayPrice = activeVariantEntry?.price ?? product.price ?? 0;
  const displayOriginalPrice = activeVariantEntry?.originalPrice ?? product.originalPrice ?? null;
  const displayVariantId = activeVariantEntry?.variantId ?? product.defaultVariantId ?? null;
  const displayVariantStock = activeVariantEntry?.stock ?? product.defaultVariantStock ?? 0;
  const displaySku = activeVariantEntry?.sku ?? product.defaultSku ?? '';

  const displaySizeLabel = useMemo(
    () =>
      resolveCatalogCardSizeLabelFromVariant(activeVariantEntry, props.selectedSize, sizeLabel),
    [activeVariantEntry, props.selectedSize, sizeLabel]
  );

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
  const { isAddingToCart, addToCart } = useAddToCart({
    productId: product.id,
    productSlug: product.slug,
    title: product.title,
    price: displayPrice,
    image: activeImage,
    originalPrice: displayOriginalPrice,
    inStock: product.inStock,
    defaultVariantId: displayVariantId,
    defaultVariantStock: displayVariantStock,
    defaultSku: displaySku,
    sizeLabel: displaySizeLabel,
    categoryLabel,
  });
  const activeImageMeasureKey = `${product.id}-${activeImageIndex}-${activeImage ?? ''}`;
  const activeImageMeasureKeyRef = useRef(activeImageMeasureKey);
  useEffect(() => {
    activeImageMeasureKeyRef.current = activeImageMeasureKey;
  }, [activeImageMeasureKey]);

  const presentation = buildCatalogCardPresentation({
    ...props,
    sizeLabel: displaySizeLabel,
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

  const formattedPrice = formatCatalogPrice(displayPrice, displayCurrency);
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
    sizeLabel: displaySizeLabel,
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
