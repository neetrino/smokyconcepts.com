import { PRODUCT_INFO_COLUMN_CLASS } from './productInfoTabContent.constants';

/** Matches gallery hero height while product data is loading. */
const SKELETON_HERO_HEIGHT_CLASS = 'h-[270px] w-full sm:h-[440px] lg:h-[480px]';

const SKELETON_PULSE_CLASS = 'animate-pulse rounded-lg bg-[#e4e2dc]';

/**
 * PDP layout shell shown while the product is fetched from the API.
 * Reserves the above-the-fold structure so the Footer does not dominate the viewport.
 */
export function ProductPageSkeleton() {
  return (
    <div className="overflow-x-hidden overflow-y-visible bg-[#efefef]" aria-hidden>
      <div className="mx-auto max-w-[1920px] overflow-x-hidden overflow-y-visible px-4 pb-16 pt-2 sm:px-6 lg:px-[120px] lg:pb-24 lg:pt-5">
        <div className="grid min-h-0 items-start gap-8 overflow-visible xl:grid-cols-[minmax(0,640px)_minmax(0,1fr)] xl:items-stretch xl:gap-11">
          <div className="flex min-h-0 min-w-0 flex-col gap-5 overflow-visible pt-5 sm:gap-6 sm:pt-14 lg:pt-16">
            <div className="rounded-[12px] bg-white p-4 shadow-[0_4px_22.5px_rgba(0,0,0,0.06)] sm:p-5">
              <div className={`${SKELETON_HERO_HEIGHT_CLASS} ${SKELETON_PULSE_CLASS}`} />
              <div className="mt-3 flex justify-center gap-2 sm:mt-4 sm:gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
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
