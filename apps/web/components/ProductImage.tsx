'use client';

import Image from 'next/image';

/** Fixed product-card frame ratio (responsive via width). */
export const PRODUCT_IMAGE_ASPECT_4_3_CLASS_NAME = 'aspect-[4/3]';

export const PRODUCT_IMAGE_ASPECT_SQUARE_CLASS_NAME = 'aspect-square';

export type ProductImageAspectRatio = '4/3' | '1/1';

const ASPECT_CLASS_BY_RATIO: Record<ProductImageAspectRatio, string> = {
  '4/3': PRODUCT_IMAGE_ASPECT_4_3_CLASS_NAME,
  '1/1': PRODUCT_IMAGE_ASPECT_SQUARE_CLASS_NAME,
};

const PRODUCT_IMAGE_WRAPPER_BASE_CLASS_NAME =
  'relative w-full shrink-0 overflow-hidden';

/** Fills the frame; center crop when asset exceeds the ratio. */
export const PRODUCT_IMAGE_OBJECT_CLASS_NAME = 'h-full w-full object-cover object-center';

export interface ProductImageProps {
  src: string;
  alt: string;
  sizes?: string;
  aspectRatio?: ProductImageAspectRatio;
  className?: string;
  unoptimized?: boolean;
  loading?: 'eager' | 'lazy';
  onError?: () => void;
}

/**
 * Stable product image frame: fixed aspect ratio, cover crop, no layout shift.
 */
export function ProductImage({
  src,
  alt,
  sizes = '100vw',
  aspectRatio = '4/3',
  className,
  unoptimized = true,
  loading,
  onError,
}: ProductImageProps) {
  const wrapperClassName = [
    PRODUCT_IMAGE_WRAPPER_BASE_CLASS_NAME,
    ASPECT_CLASS_BY_RATIO[aspectRatio],
    className ?? '',
  ]
    .join(' ')
    .trim();

  return (
    <div className={wrapperClassName}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={PRODUCT_IMAGE_OBJECT_CLASS_NAME}
        unoptimized={unoptimized}
        loading={loading}
        onError={onError}
      />
    </div>
  );
}

export interface ProductImagePlaceholderProps {
  aspectRatio?: ProductImageAspectRatio;
  className?: string;
  label?: string;
}

/** Empty state — same dimensions as {@link ProductImage}. */
export function ProductImagePlaceholder({
  aspectRatio = '4/3',
  className,
  label = 'No Image',
}: ProductImagePlaceholderProps) {
  const wrapperClassName = [
    PRODUCT_IMAGE_WRAPPER_BASE_CLASS_NAME,
    ASPECT_CLASS_BY_RATIO[aspectRatio],
    'flex items-center justify-center rounded-[1rem] bg-[#f1f1ef] text-sm font-medium text-[#9d9d9d]',
    className ?? '',
  ]
    .join(' ')
    .trim();

  return <div className={wrapperClassName}>{label}</div>;
}
