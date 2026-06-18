import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminInputAmdToUsd } from '../../../lib/currency';
import { resolveCartLineCollectionPriceAmd } from '../../cart/cart-line-pricing';
import { useSizeCatalogPriceByTitle } from '@/lib/size-catalog/use-size-catalog-price-by-title';
import { apiClient } from '../../../lib/api-client';
import { useTranslation } from '../../../lib/i18n-client';
import { clearGuestCart } from '../checkoutUtils';
import type { CheckoutFormData, Cart, CartItem } from '../types';
import { DEFAULT_SHIPPING_COUNTRY } from '../../../lib/shipping-address-display';
import type { DeliveryLocationOption } from './useDeliveryLocations';

interface UseOrderSubmissionProps {
  cart: Cart | null;
  deliveryPrice: number | null;
  setError: (error: string | null) => void;
  deliveryLocations: DeliveryLocationOption[];
  /** Normalized coupon code when applied (server validates again on checkout) */
  appliedCouponCode: string | null;
}

function submitExternalPaymentForm(action: string, fields: Record<string, string>): void {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = action;
  form.style.display = 'none';

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

function regionLabelForOrder(value: string, locations: DeliveryLocationOption[]): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  const loc = locations.find((l) => l.id === trimmed);
  return loc ? loc.city.trim() : trimmed;
}

function countryForOrder(value: string, locations: DeliveryLocationOption[]): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return DEFAULT_SHIPPING_COUNTRY;
  }
  const loc = locations.find((l) => l.id === trimmed);
  const country = loc?.country?.trim();
  return country && country.length > 0 ? country : DEFAULT_SHIPPING_COUNTRY;
}

export function useOrderSubmission({
  cart,
  deliveryPrice,
  setError,
  deliveryLocations,
  appliedCouponCode,
}: UseOrderSubmissionProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const categoryPriceByTitle = useSizeCatalogPriceByTitle();

  const submitOrder = async (data: CheckoutFormData) => {
    setError(null);
    setIsPlacingOrder(true);

    try {
      if (!cart) {
        throw new Error(t('checkout.errors.cartEmpty'));
      }

      const items = cart.items.map((item: CartItem) => {
        const title = item.variant.sizeCatalogTitle?.trim();
        const version = item.variant.sizeCatalogVersion?.trim();
        const img = item.variant.sizeCatalogImageUrl?.trim();
        const categoryTitle = item.variant.sizeCatalogCategoryTitle?.trim();
        const resolvedCategoryPriceAmd = resolveCartLineCollectionPriceAmd(item, categoryPriceByTitle);
        const hasSizeCatalogPick = Boolean(title);
        const hasCollectionContext = Boolean(categoryTitle) || resolvedCategoryPriceAmd > 0;
        const cPlain = item.variant.customizePlain?.trim();
        const cHtml = item.variant.customizeHtml?.trim();
        const hasSavedCustomize = Boolean(cPlain || cHtml);
        const customSizeRequest = item.variant.customSizeRequest;
        return {
          productId: item.variant.product.id,
          variantId: item.variant.id,
          quantity: item.quantity,
          ...(item.variant.earlyAccess === true ? { earlyAccess: true } : {}),
          ...(hasSizeCatalogPick
            ? {
                sizeCatalogTitle: title,
                ...(version ? { sizeCatalogVersion: version } : {}),
                ...(img ? { sizeCatalogImageUrl: img } : {}),
                ...(categoryTitle ? { sizeCatalogCategoryTitle: categoryTitle } : {}),
                ...(hasSavedCustomize && resolvedCategoryPriceAmd > 0
                  ? { sizeCatalogCategoryPriceAmd: resolvedCategoryPriceAmd }
                  : {}),
              }
            : hasCollectionContext
              ? {
                  ...(categoryTitle ? { sizeCatalogCategoryTitle: categoryTitle } : {}),
                  ...(hasSavedCustomize && resolvedCategoryPriceAmd > 0
                    ? { sizeCatalogCategoryPriceAmd: resolvedCategoryPriceAmd }
                    : {}),
                }
              : {}),
          ...(hasSavedCustomize
            ? {
                ...(cPlain ? { customizePlain: cPlain } : {}),
                ...(cHtml ? { customizeHtml: cHtml } : {}),
              }
            : {}),
          ...(customSizeRequest
            ? {
                customSizeRequest: {
                  name: customSizeRequest.name,
                  phone: customSizeRequest.phone,
                  email: customSizeRequest.email,
                  description: customSizeRequest.description,
                  imageDataUrl: customSizeRequest.imageDataUrl,
                  imageFileName: customSizeRequest.imageFileName,
                },
              }
            : {}),
        };
      });

      const shippingAddress =
        data.shippingMethod === 'delivery' &&
        data.shippingAddress?.trim() &&
        data.shippingRegion?.trim()
          ? {
              address: data.shippingAddress.trim(),
              state: regionLabelForOrder(data.shippingRegion, deliveryLocations),
              country:
                data.shippingCountry?.trim() ||
                countryForOrder(data.shippingRegion, deliveryLocations),
            }
          : undefined;

      const shippingAmount =
        data.shippingMethod === 'delivery' && deliveryPrice !== null ? adminInputAmdToUsd(deliveryPrice) : 0;

      const response = await apiClient.post<{
        order: {
          id: string;
          number: string;
          status: string;
          paymentStatus: string;
          total: number;
          currency: string;
        };
        payment: {
          provider: string;
          paymentUrl: string | null;
          expiresAt: string | null;
          initToken?: string | null;
        };
        nextAction: string;
      }>('/api/v1/orders/checkout', {
        items,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        shippingMethod: data.shippingMethod,
        ...(shippingAddress ? { shippingAddress } : {}),
        shippingAmount: shippingAmount,
        paymentMethod: data.paymentMethod,
        ...(appliedCouponCode ? { couponCode: appliedCouponCode } : {}),
      });

      const resolvedProvider = response.payment?.provider?.trim().toLowerCase() || data.paymentMethod;

      if (resolvedProvider === 'arca') {
        const initToken = response.payment?.initToken;
        if (!initToken) {
          throw new Error(t('checkout.errors.failedToCreateOrder'));
        }
        const arcaInit = await apiClient.post<{
          redirectUrl: string;
          providerOrderId: string;
        }>('/api/v1/payments/arca/init', {
          orderNumber: response.order.number,
          initToken,
        });
        window.location.href = arcaInit.redirectUrl;
        return;
      }

      if (resolvedProvider === 'idram') {
        const initToken = response.payment?.initToken;
        if (!initToken) {
          throw new Error(t('checkout.errors.failedToCreateOrder'));
        }
        const idramInit = await apiClient.post<{
          formAction: string;
          formData: Record<string, string>;
        }>('/api/v1/payments/idram/init', {
          orderNumber: response.order.number,
          initToken,
        });
        submitExternalPaymentForm(idramInit.formAction, idramInit.formData);
        return;
      }

      if (response.payment?.paymentUrl) {
        window.location.href = response.payment.paymentUrl;
        return;
      }

      if (resolvedProvider === 'cash_on_delivery') {
        clearGuestCart();
      }

      const orderNumber = encodeURIComponent(response.order.number);
      router.push(`/checkout/thank-you?orderNumber=${orderNumber}`);
    } catch (err: unknown) {
      setIsPlacingOrder(false);
      const error = err as { message?: string };
      setError(error.message || t('checkout.errors.failedToCreateOrder'));
    }
  };

  return { submitOrder, isPlacingOrder };
}




