'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ProductLabels } from '../ProductLabels';
import type { ProductLabel } from '../ProductLabels';

interface ProductCardImageProps {
  slug: string;
  image: string | null;
  title: string;
  labels?: ProductLabel[];
  imageError: boolean;
  onImageError: () => void;
  isCompact?: boolean;
}

/**
 * Component for displaying product image with labels
 */
export function ProductCardImage({
  slug,
  image,
  title,
  labels,
  imageError,
  onImageError,
  isCompact = false,
}: ProductCardImageProps) {
  return (
    <div className="aspect-square bg-transparent relative overflow-hidden">
      <Link href={`/products/${slug}`} className="block w-full h-full">
        {image && !imageError ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            unoptimized
            onError={onImageError}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
      </Link>
      
      {/* Product Labels - stacked per corner */}
      {labels && labels.length > 0 && <ProductLabels labels={labels} />}
    </div>
  );
}




