'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useSizeModalExitAnimation } from '@/hooks/useSizeModalExitAnimation';
import {
  SIZE_MODAL_BLOCK_ENTER_DELAY_BODY_MS,
  SIZE_MODAL_BLOCK_ENTER_DELAY_HEADER_MS,
  SIZE_MODAL_EXIT_DURATION_MS,
  SIZE_MODAL_REDUCED_MOTION_EXIT_MS,
} from '@/lib/size-modal-animation.constants';
import {
  sizeModalBackdropClass,
  sizeModalBlockClass,
  sizeModalBlockEnterStyle,
  sizeModalContentClass,
  sizeModalPanelClass,
} from '@/lib/size-modal-animation';
import { formatStorePriceForDisplay } from '../lib/currency';
import { useTranslation } from '../lib/i18n-client';
import { CART_DRAWER_OPEN_EVENT } from '../app/cart/constants';
import { readGuestCartFromStorage } from '../app/cart/cart-fetcher';
import {
  getCartDisplaySubtotalUsd,
  getCartLineTotalUsd,
} from '../app/cart/cart-line-pricing';
import { handleRemoveItem, handleUpdateQuantity } from '../app/cart/cart-handlers';
import type { Cart, CartItem } from '../app/cart/types';

function resolveCartItemImage(item: CartItem): string | null {
  return (
    item.variant.product.image?.trim() ||
    item.variant.sizeCatalogImageUrl?.trim() ||
    null
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M4 10H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Right-side cart drawer opened after add-to-cart actions.
 */
export function CartDrawer() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const isLocalUpdateRef = useRef(false);

  const prefersReducedMotion = usePrefersReducedMotion();
  const exitDurationMs = prefersReducedMotion
    ? SIZE_MODAL_REDUCED_MOTION_EXIT_MS
    : SIZE_MODAL_EXIT_DURATION_MS;
  const { isMounted, isExiting, isEntered } = useSizeModalExitAnimation({
    isOpen,
    exitDurationMs,
  });
  const drawerMotion = {
    isEntered,
    isExiting,
    skipEnterAnimation: prefersReducedMotion,
  };

  const handleClose = useCallback(() => {
    if (isExiting) {
      return;
    }
    setIsOpen(false);
  }, [isExiting]);

  async function loadCart() {
    setCart(readGuestCartFromStorage());
  }

  useEffect(() => {
    const handleOpen = (event: Event) => {
      setIsOpen(true);
      void loadCart();
    };

    const handleCartUpdate = () => {
      if (isLocalUpdateRef.current) {
        isLocalUpdateRef.current = false;
        return;
      }

      if (isOpen) {
        void loadCart();
      }
    };

    window.addEventListener(CART_DRAWER_OPEN_EVENT, handleOpen);
    window.addEventListener('cart-updated', handleCartUpdate);

    return () => {
      window.removeEventListener(CART_DRAWER_OPEN_EVENT, handleOpen);
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMounted, handleClose]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMounted]);

  const itemCountLabel = useMemo(() => {
    const count = cart?.itemsCount ?? 0;
    const itemLabel = count === 1 ? 'Item' : 'Items';
    return `( ${count} ${itemLabel} )`;
  }, [cart?.itemsCount]);

  const displaySubtotalUsd = useMemo(
    () => (cart?.items.length ? getCartDisplaySubtotalUsd(cart.items) : 0),
    [cart?.items]
  );

  async function onRemoveItem(itemId: string) {
    if (!cart) return;

    isLocalUpdateRef.current = true;
    await handleRemoveItem(itemId, cart, setCart, loadCart);
  }

  async function onUpdateItemQuantity(itemId: string, quantity: number) {
    isLocalUpdateRef.current = true;
    await handleUpdateQuantity(
      itemId,
      quantity,
      cart,
      setCart,
      setUpdatingItems,
      loadCart,
      t
    );
  }

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[100] ${isExiting ? 'pointer-events-none' : ''}`}
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close cart drawer"
        className={`absolute inset-0 z-0 bg-[rgba(0,0,0,0.6)] ${sizeModalBackdropClass(drawerMotion)}`}
        onClick={handleClose}
      />

      <aside
        className={`absolute inset-y-0 right-0 z-10 flex h-full max-h-dvh w-full max-w-[30rem] flex-col overflow-hidden bg-[#efefef] shadow-[-8px_0_32px_rgba(0,0,0,0.12)] ${sizeModalPanelClass(drawerMotion)}`}
        aria-hidden={isExiting}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-5 top-5 z-20 text-[#b4b4b4] transition-colors hover:text-[#414141]"
          aria-label="Close cart drawer"
        >
          <CloseIcon />
        </button>

        <div className="flex h-full flex-col px-8 pb-6 pt-6 font-montserrat">
          <div
            className={`flex items-center gap-4 ${sizeModalBlockClass(drawerMotion)}`}
            style={sizeModalBlockEnterStyle(
              SIZE_MODAL_BLOCK_ENTER_DELAY_HEADER_MS,
              drawerMotion
            )}
          >
            <h2 className="text-[1.625rem] font-extrabold leading-none text-[#414141]">My Cart</h2>
            <span className="pt-1 text-[0.875rem] font-medium leading-none text-[#414141]">
              {itemCountLabel}
            </span>
          </div>

          <div
            className={`mt-8 flex min-h-0 flex-1 flex-col ${sizeModalContentClass(drawerMotion)}`}
            style={sizeModalBlockEnterStyle(
              SIZE_MODAL_BLOCK_ENTER_DELAY_BODY_MS,
              drawerMotion
            )}
          >
          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
            {cart && cart.items.length > 0 ? (
              <div className="space-y-8">
                {cart.items.map((item) => {
                  const itemImage = resolveCartItemImage(item);
                  return (
                  <div key={item.id} className="flex gap-5 rounded-[1rem] px-2 py-2 transition-all">
                    <Link
                      href={`/products/${item.variant.product.slug}`}
                      onClick={handleClose}
                      className="relative mt-1 block h-[6.5rem] w-[6.25rem] shrink-0 rounded-[0.875rem] bg-white"
                    >
                      {itemImage ? (
                        <Image
                          src={itemImage}
                          alt={item.variant.product.title}
                          fill
                          className="object-contain p-1"
                          sizes="100px"
                          unoptimized
                        />
                      ) : null}
                    </Link>

                    <div className="grid flex-1 grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-4">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${item.variant.product.slug}`}
                          onClick={handleClose}
                          className="block"
                        >
                          <h3 className="line-clamp-1 text-[1.125rem] font-extrabold leading-none text-[#414141]">
                            {item.variant.product.title}
                          </h3>
                        </Link>

                        <div className="mt-1.5 flex items-center gap-2">
                          {item.variant.sizeLabel?.trim() ? (
                            <span className="text-[0.625rem] font-medium leading-none text-[#9d9d9d]">
                              {item.variant.sizeLabel.trim()}
                            </span>
                          ) : null}
                          <span className="rounded-[0.375rem] bg-[#122a26] px-[0.375rem] py-[0.125rem] text-[0.625rem] font-medium leading-none text-white">
                            {item.variant.product.categoryLabel || 'Classic'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => void onRemoveItem(item.id)}
                        className="mt-[0.25rem] h-[1.375rem] rounded-[0.5rem] border-2 border-[#d83e3e] px-2 text-[0.625rem] font-extrabold leading-none text-[#d83e3e] transition-colors hover:bg-[#d83e3e]/5"
                      >
                        Remove
                      </button>

                      <div className="flex h-6 w-[4.625rem] items-center overflow-hidden rounded-[0.25rem] bg-white">
                        <button
                          type="button"
                          onClick={() => void onUpdateItemQuantity(item.id, item.quantity - 1)}
                          disabled={updatingItems.has(item.id)}
                          className="inline-flex h-full w-6 items-center justify-center text-[#122a26] disabled:opacity-50"
                          aria-label="Decrease quantity"
                        >
                          <MinusIcon />
                        </button>
                        <span className="inline-flex h-full flex-1 items-center justify-center text-[0.875rem] font-medium leading-none text-[#122a26]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => void onUpdateItemQuantity(item.id, item.quantity + 1)}
                          disabled={updatingItems.has(item.id)}
                          className="inline-flex h-full w-6 items-center justify-center text-[#122a26] disabled:opacity-50"
                          aria-label="Increase quantity"
                        >
                          <PlusIcon />
                        </button>
                      </div>

                      <div className="justify-self-end self-center -translate-y-0.5 text-[1.125rem] font-extrabold leading-none text-black">
                        {formatStorePriceForDisplay(getCartLineTotalUsd(item))}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="pt-6 text-center text-[#414141]">
                <p className="text-[1.25rem] font-extrabold leading-none">Your cart is empty</p>
                
              </div>
            )}
          </div>

          <div className="mt-5 shrink-0 pt-5">
            <h3 className="text-[1.375rem] font-extrabold leading-none text-[#414141]">Summary</h3>

            <div className="mt-6 space-y-3 text-[1rem] leading-none text-[#414141]">
              <div className="flex items-center justify-between font-medium">
                <span>Subtotal</span>
                <span>{formatStorePriceForDisplay(displaySubtotalUsd)}</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span>Shipping</span>
                <span>
                  {(cart?.totals.shipping ?? 0) > 0
                    ? formatStorePriceForDisplay(cart?.totals.shipping ?? 0)
                    : 'Not Calculated'}
                </span>
              </div>
            </div>

            <div className="mt-5 h-[2px] bg-[#d9d9d9]" />

            <div className="mt-4 flex items-center justify-between text-[1.375rem] font-extrabold leading-none text-[#414141]">
              <span>TOTAL</span>
              <span>{formatStorePriceForDisplay(displaySubtotalUsd)}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                handleClose();
                router.push('/checkout');
              }}
              className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-[0.5rem] bg-[#dcc090] text-[0.875rem] font-extrabold uppercase tracking-[0.06em] text-[#122a26] transition-opacity hover:opacity-90"
            >
              CHECKOUT
            </button>
          </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
