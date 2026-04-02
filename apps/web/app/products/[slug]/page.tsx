'use client';

import { t, getProductText } from '../../../lib/i18n';
import { RelatedProducts } from '../../../components/RelatedProducts';
import { ProductImageGallery } from './ProductImageGallery';
import { ProductInfoAndActions } from './ProductInfoAndActions';
import { useProductPage } from './useProductPage';
import { useProductCartActions } from './useProductCartActions';
import type { ProductPageProps } from './types';

export default function ProductPage({ params }: ProductPageProps) {
  const {
    product,
    loading,
    images,
    currentImageIndex,
    setCurrentImageIndex,
    thumbnailStartIndex,
    setThumbnailStartIndex,
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

  const productDisplayTitle = product
    ? getProductText(language, product.id, 'title') || product.title
    : '';

  const { handleAddToCart, handleBuyNow } = useProductCartActions({
    product,
    currentVariant,
    quantity,
    price,
    originalPrice,
    language,
    canAddToCart,
    productDisplayTitle,
    setIsAddingToCart,
    setShowMessage,
  });

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
