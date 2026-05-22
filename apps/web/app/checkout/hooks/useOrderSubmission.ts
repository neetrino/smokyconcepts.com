import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminInputAmdToUsd } from '../../../lib/currency';
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
        const categoryPriceAmd = item.variant.sizeCatalogCategoryPriceAmd;
        const cPlain = item.variant.customizePlain?.trim();
        const cHtml = item.variant.customizeHtml?.trim();
        const customSizeRequest = item.variant.customSizeRequest;
        return {
          productId: item.variant.product.id,
          variantId: item.variant.id,
          quantity: item.quantity,
          ...(item.variant.earlyAccess === true ? { earlyAccess: true } : {}),
          ...(title
            ? {
                sizeCatalogTitle: title,
                ...(version ? { sizeCatalogVersion: version } : {}),
                ...(img ? { sizeCatalogImageUrl: img } : {}),
                ...(typeof categoryPriceAmd === 'number' && categoryPriceAmd >= 0
                  ? { sizeCatalogCategoryPriceAmd: Math.round(categoryPriceAmd) }
                  : {}),
              }
            : {}),
          ...(cPlain || cHtml
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

      clearGuestCart();

      if (response.payment?.paymentUrl) {
        window.location.href = response.payment.paymentUrl;
        return;
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




