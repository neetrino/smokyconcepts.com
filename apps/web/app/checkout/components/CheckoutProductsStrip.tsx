'use client';

import Link from 'next/link';

import { useTranslation } from '../../../lib/i18n-client';
import type { CartItem } from '../types';

interface CheckoutProductsStripProps {
  items: CartItem[];
  itemsCountLabel: string;
  onRemoveItem: (itemId: string) => void;
  removingItemId: string | null;
}

/** Matches PDP gallery thumbnails — slightly larger for checkout strip readability. */
const CHECKOUT_PRODUCT_THUMB_SIZE_CLASSES = 'size-[40px] shrink-0 sm:size-[44px]';
const CHECKOUT_PRODUCT_THUMB_IMAGE_CLASSES = 'size-full object-contain object-center';
const CHECKOUT_PRODUCT_THUMB_SLOT_CLASSES = 'w-[72px] shrink-0 sm:w-[76px]';
/** Room for the remove badge that sits slightly outside the thumbnail bounds. */
const CHECKOUT_PRODUCT_STRIP_SCROLL_CLASSES = 'flex gap-3 overflow-x-auto pb-1 pt-2.5 pr-1.5 sm:gap-3.5';
const CHECKOUT_REMOVE_BUTTON_CLASSES =
  'absolute -right-1 -top-1 z-10 flex size-5 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-md transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-60';

function RemoveItemIcon() {
  return (
    <svg
      className="size-2.5 shrink-0"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 2.5l7 7M9.5 2.5l-7 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CheckoutProductsStrip({
  items,
  itemsCountLabel,
  onRemoveItem,
  removingItemId,
}: CheckoutProductsStripProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3.5 lg:col-span-2">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-900">
          {t('checkout.productsStrip.title')}
        </h2>
        <span className="text-[11px] font-medium text-gray-500">{itemsCountLabel}</span>
      </div>
      <div className={CHECKOUT_PRODUCT_STRIP_SCROLL_CLASSES}>
        {items.map((item) => {
          const product = item.variant.product;
          const productImage = product.image;
          const isRemoving = removingItemId === item.id;

          return (
            <div key={item.id} className={CHECKOUT_PRODUCT_THUMB_SLOT_CLASSES}>
              <div className="relative mx-auto w-fit">
                <button
                  type="button"
                  disabled={isRemoving}
                  onClick={() => onRemoveItem(item.id)}
                  className={CHECKOUT_REMOVE_BUTTON_CLASSES}
                  aria-label={t('common.removeItem')}
                >
                  <RemoveItemIcon />
                </button>
                <Link
                  href={`/products/${product.slug}`}
                  className="group block"
                  aria-label={product.title}
                >
                  <div
                    className={`flex items-center justify-center rounded-[4px] bg-white ${CHECKOUT_PRODUCT_THUMB_SIZE_CLASSES}`}
                  >
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={product.title}
                        className={CHECKOUT_PRODUCT_THUMB_IMAGE_CLASSES}
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-gray-300">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2 1.586-1.586a2 2 0 012.828 0L20 14m-6-8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-center text-[10px] font-medium leading-3 text-gray-600 group-hover:text-gray-900">
                    {product.title}
                  </p>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
