'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { PageLoadingCenter } from '../../../components/loading/PageLoadingCenter';
import { getStoredLanguage, type LanguageCode } from '../../../lib/language';
import { getProductPreview, type ProductPreviewSnapshot } from '../../../lib/product-preview-cache';
import { useIsomorphicLayoutEffect } from '../../../lib/utils/use-isomorphic-layout-effect';
import { THUMBNAILS_PER_VIEW } from './constants';
import {
  GALLERY_CARD_BASE_CLASS,
  GALLERY_IMAGE_FIT_CLASSES,
  GALLERY_SECTION_GAP_CLASSES,
  GALLERY_TOP_OFFSET_CLASSES,
  HERO_IMAGE_BOX_SIZE_CLASSES,
  HERO_PULL_ABOVE_CARD,
  THUMBNAIL_IMAGE_BOX_SIZE_CLASSES,
} from './gallery/galleryFrame.constants';
import { PRODUCT_INFO_COLUMN_CLASS } from './productInfoTabContent.constants';
import {
  PRODUCT_PAGE_BACKDROP_CLASS,
  PRODUCT_PAGE_CONTAINER_CLASS,
  PRODUCT_PAGE_GALLERY_COLUMN_CLASS,
  PRODUCT_PAGE_GRID_CLASS,
  SKELETON_PULSE_CLASS,
} from './productPageShell.constants';
import { ProductPagePreviewInfo } from './ProductPagePreviewInfo';
import { ProductPageSkeleton } from './ProductPageSkeleton';

const PRODUCTS_PATH_PREFIX = '/products/';

interface ProductPagePreviewProps {
  /** Provided by the page client; `loading.tsx` has no params so the path is used. */
  slug?: string;
}

/** `/products/<slug>` and `/products/<slug>:<variantId>` → `<slug>`. */
function resolveSlugFromPathname(pathname: string | null): string {
  if (!pathname?.startsWith(PRODUCTS_PATH_PREFIX)) {
    return '';
  }
  const rawSegment = pathname.slice(PRODUCTS_PATH_PREFIX.length).split('/')[0] ?? '';
  try {
    return decodeURIComponent(rawSegment).split(':')[0] ?? '';
  } catch {
    return rawSegment.split(':')[0] ?? '';
  }
}

function ProductPreviewGallery({ snapshot }: { snapshot: ProductPreviewSnapshot }) {
  const thumbnails = snapshot.images.slice(0, THUMBNAILS_PER_VIEW);

  return (
    <div className={`overflow-visible ${GALLERY_TOP_OFFSET_CLASSES}`}>
      <div className={GALLERY_CARD_BASE_CLASS}>
        <div className={`flex flex-col items-center overflow-visible ${GALLERY_SECTION_GAP_CLASSES}`}>
          <div className={`relative z-10 flex w-full justify-center ${HERO_PULL_ABOVE_CARD}`}>
            <div className={`relative mx-auto w-full max-w-full ${HERO_IMAGE_BOX_SIZE_CLASSES}`}>
              {snapshot.image ? (
                <img
                  src={snapshot.image}
                  alt={snapshot.title}
                  decoding="async"
                  fetchPriority="high"
                  draggable={false}
                  className={GALLERY_IMAGE_FIT_CLASSES}
                />
              ) : (
                <div className={`size-full ${SKELETON_PULSE_CLASS}`} />
              )}
            </div>
          </div>

          {thumbnails.length > 0 ? (
            <div className="flex items-center justify-center gap-2 sm:gap-3" aria-hidden>
              {thumbnails.map((image) => (
                <div key={image} className={`relative overflow-hidden ${THUMBNAIL_IMAGE_BOX_SIZE_CLASSES}`}>
                  <img src={image} alt="" draggable={false} className={GALLERY_IMAGE_FIT_CLASSES} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Instant PDP shell built from the catalog card snapshot: real title, hero image,
 * price, collection badge and size/tab chrome paint before the server payload arrives.
 * Falls back to the full skeleton when the page is opened without a card snapshot.
 */
export function ProductPagePreview({ slug }: ProductPagePreviewProps) {
  const pathname = usePathname();
  const [snapshot, setSnapshot] = useState<ProductPreviewSnapshot | null>(null);
  const [language, setLanguage] = useState<LanguageCode>('en');

  useIsomorphicLayoutEffect(() => {
    const previewSlug = slug?.trim() || resolveSlugFromPathname(pathname);
    setLanguage(getStoredLanguage());
    setSnapshot(previewSlug ? getProductPreview(previewSlug) : null);
  }, [pathname, slug]);

  if (!snapshot) {
    return (
      <>
        <ProductPageSkeleton />
        <PageLoadingCenter reserveLayoutSpace={false} />
      </>
    );
  }

  return (
    <div className={PRODUCT_PAGE_BACKDROP_CLASS} aria-busy>
      <div className={PRODUCT_PAGE_CONTAINER_CLASS}>
        <div className={PRODUCT_PAGE_GRID_CLASS}>
          <div className={PRODUCT_PAGE_GALLERY_COLUMN_CLASS}>
            <ProductPreviewGallery snapshot={snapshot} />
          </div>
          <div className={PRODUCT_INFO_COLUMN_CLASS}>
            <ProductPagePreviewInfo snapshot={snapshot} language={language} />
          </div>
        </div>
      </div>
    </div>
  );
}
