import { GALLERY_TOP_OFFSET_CLASSES, HERO_IMAGE_BOX_SIZE_CLASSES } from './gallery/galleryFrame.constants';
import { PRODUCT_INFO_COLUMN_CLASS } from './productInfoTabContent.constants';
import {
  PRODUCT_PAGE_BACKDROP_CLASS,
  PRODUCT_PAGE_CONTAINER_CLASS,
  PRODUCT_PAGE_GALLERY_COLUMN_CLASS,
  PRODUCT_PAGE_GRID_CLASS,
  SKELETON_PULSE_CLASS,
} from './productPageShell.constants';

const SKELETON_THUMBNAIL_COUNT = 4;

/**
 * PDP layout shell shown while the product is fetched from the API.
 * Reserves the above-the-fold structure so the Footer does not dominate the viewport.
 */
export function ProductPageSkeleton() {
  return (
    <div className={PRODUCT_PAGE_BACKDROP_CLASS} aria-hidden>
      <div className={PRODUCT_PAGE_CONTAINER_CLASS}>
        <div className={PRODUCT_PAGE_GRID_CLASS}>
          <div className={`${PRODUCT_PAGE_GALLERY_COLUMN_CLASS} ${GALLERY_TOP_OFFSET_CLASSES}`}>
            <div className="rounded-[12px] bg-white p-4 shadow-[0_4px_22.5px_rgba(0,0,0,0.06)] sm:p-5">
              <div className={`${HERO_IMAGE_BOX_SIZE_CLASSES} ${SKELETON_PULSE_CLASS}`} />
              <div className="mt-3 flex justify-center gap-2 sm:mt-4 sm:gap-3">
                {Array.from({ length: SKELETON_THUMBNAIL_COUNT }).map((_, index) => (
                  <div key={index} className={`size-9 ${SKELETON_PULSE_CLASS} sm:size-10`} />
                ))}
              </div>
            </div>
          </div>

          <div className={PRODUCT_INFO_COLUMN_CLASS}>
            <div className="flex w-full max-w-[763px] flex-col gap-4 pt-0 xl:pt-16">
              <div className={`h-8 w-3/4 max-w-md ${SKELETON_PULSE_CLASS}`} />
              <div className={`h-5 w-1/3 max-w-[10rem] ${SKELETON_PULSE_CLASS}`} />
              <div className={`mt-4 h-[180px] w-full ${SKELETON_PULSE_CLASS}`} />
              <div className={`mt-8 h-12 w-full max-w-sm ${SKELETON_PULSE_CLASS}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
