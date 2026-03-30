'use client';

import { useRouter } from 'next/navigation';
import { t } from '../../../lib/i18n';
import { RelatedProducts } from '../../../components/RelatedProducts';
import { ProductImageGallery } from './ProductImageGallery';
import { ProductInfoAndActions } from './ProductInfoAndActions';
import { useProductPage } from './useProductPage';
import type { ProductPageProps } from './types';

type GuestCartLine = {
  variantId: string;
  quantity: number;
  productId?: string;
  productSlug?: string;
};

function upsertGuestCartLine(
  productId: string,
  productSlug: string,
  variantId: string,
  quantityToAdd: number
): void {
  const stored = localStorage.getItem('shop_cart_guest');
  const cart = stored ? JSON.parse(stored) : [];
  const existing = cart.find(
    (i: unknown): i is GuestCartLine =>
      typeof i === 'object' && i !== null && 'variantId' in i && (i as GuestCartLine).variantId === variantId
  );
  if (existing) existing.quantity += quantityToAdd;
  else cart.push({ productId, productSlug, variantId, quantity: quantityToAdd });
  localStorage.setItem('shop_cart_guest', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const {
    product,
    loading,
    images,
    currentImageIndex,
    setCurrentImageIndex,
    thumbnailStartIndex,
    setThumbnailStartIndex,
    currency,
    language,
    isAddingToCart,
    setIsAddingToCart,
    showMessage,
    setShowMessage,
    selectedColor,
    selectedSize,
    colorOptions,
    sizeOptions,
    quantity,
    currentVariant,
    price,
    originalPrice,
    compareAtPrice,
    discountPercent,
    isOutOfStock,
    canAddToCart,
    handleColorSelect,
    handleSizeSelect,
  } = useProductPage(params);

  const handleAddToCart = async () => {
    if (!canAddToCart || !product || !currentVariant) return;
    setIsAddingToCart(true);
    try {
      upsertGuestCartLine(product.id, product.slug, currentVariant.id, quantity);
      setShowMessage(`${t(language, 'product.addedToCart')} ${quantity} ${t(language, 'product.pcs')}`);
    } catch {
      setShowMessage(t(language, 'product.errorAddingToCart'));
    } finally {
      setIsAddingToCart(false);
      setTimeout(() => setShowMessage(null), 2000);
    }
  };

  const handleBuyNow = async () => {
    if (!canAddToCart || !product || !currentVariant) return;
    setIsAddingToCart(true);
    try {
      upsertGuestCartLine(product.id, product.slug, currentVariant.id, quantity);
      router.push('/checkout');
    } catch {
      setShowMessage(t(language, 'product.errorAddingToCart'));
      setTimeout(() => setShowMessage(null), 2000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        {t(language, 'common.messages.loading')}
      </div>
    );
  }

  return (
    <div className="overflow-visible bg-[#efefef]">
      <div className="mx-auto max-w-[1920px] overflow-visible px-4 pb-16 pt-10 sm:px-6 lg:px-[120px] lg:pb-24 lg:pt-[104px]">
        <div className="grid items-start gap-10 overflow-visible xl:grid-cols-[minmax(0,640px)_minmax(0,1fr)] xl:gap-[52px]">
          <div className="min-w-0 overflow-visible">
          <ProductImageGallery
            images={images}
            product={product}
            language={language}
            currentImageIndex={currentImageIndex}
            onImageIndexChange={setCurrentImageIndex}
            thumbnailStartIndex={thumbnailStartIndex}
            onThumbnailStartIndexChange={setThumbnailStartIndex}
          />
          </div>

          <ProductInfoAndActions
            product={product}
            price={price}
            originalPrice={originalPrice}
            compareAtPrice={compareAtPrice}
            discountPercent={discountPercent}
            currency={currency}
            language={language}
            isOutOfStock={isOutOfStock}
            canAddToCart={canAddToCart}
            isAddingToCart={isAddingToCart}
            showMessage={showMessage}
            currentVariant={currentVariant}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            colorOptions={colorOptions}
            sizeOptions={sizeOptions}
            onColorSelect={handleColorSelect}
            onSizeSelect={handleSizeSelect}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        </div>

        <div className="mt-16 lg:mt-[128px]">
          <RelatedProducts categorySlug={product.categories?.[0]?.slug} currentProductId={product.id} />
        </div>
      </div>
    </div>
  );
}
