import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getCartCheckoutSubtotalUsd,
} from './utils/getCartBaseSubtotalUsd';
import { useSizeCatalogPriceByTitle } from '@/lib/size-catalog/use-size-catalog-price-by-title';
import { apiClient } from '../../lib/api-client';
import { useForm } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getStoredLanguage } from '../../lib/language';
import { useAuth } from '../../lib/auth/AuthContext';
import { useTranslation } from '../../lib/i18n-client';
import { usePaymentMethods } from './utils/payment-methods';
import { useCheckoutSchema } from './utils/validation-schema';
import { useDeliveryPrice } from './hooks/useDeliveryPrice';
import { useDeliveryLocations } from './hooks/useDeliveryLocations';
import { DEFAULT_SHIPPING_COUNTRY } from '../../lib/shipping-address-display';
import {
  countriesMatch,
  filterLocationsByCountry,
  getCheckoutCountries,
  resolveDefaultDeliveryCountry,
} from './utils/delivery-location-utils';
import { useCart } from './hooks/useCart';
import { handleRemoveItem } from '../cart/cart-handlers';
import { useUserProfile } from './hooks/useUserProfile';
import { useOrderSubmission } from './hooks/useOrderSubmission';
import { useOrderSummary } from './hooks/useOrderSummary';
import type { CheckoutFormData } from './types';

export function useCheckout() {
  const { isLoggedIn, isLoading } = useAuth();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState(getStoredLanguage());
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({});
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [couponDraft, setCouponDraft] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [couponDiscountUsd, setCouponDiscountUsd] = useState(0);
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponFieldError, setCouponFieldError] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  const paymentMethods = usePaymentMethods();
  const checkoutSchema = useCheckoutSchema();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    shouldFocusError: false,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      shippingMethod: 'delivery',
      paymentMethod: 'cash_on_delivery',
      shippingAddress: '',
      shippingCountry: DEFAULT_SHIPPING_COUNTRY,
      shippingRegion: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      cardHolderName: '',
    },
  });

  const paymentMethod = watch('paymentMethod');
  const shippingMethod = watch('shippingMethod');
  const shippingCountry = watch('shippingCountry');
  const shippingRegion = watch('shippingRegion');

  const { deliveryLocations, loadingDeliveryLocations } = useDeliveryLocations();

  const deliveryCountries = useMemo(
    () => getCheckoutCountries(deliveryLocations),
    [deliveryLocations],
  );

  const filteredDeliveryLocations = useMemo(
    () => filterLocationsByCountry(deliveryLocations, shippingCountry),
    [deliveryLocations, shippingCountry],
  );

  const activeDeliveryLocation = useMemo(
    () => deliveryLocations.find((l) => l.id === shippingRegion),
    [deliveryLocations, shippingRegion],
  );

  const shippingCountrySummary = shippingCountry?.trim() || activeDeliveryLocation?.country;

  useEffect(() => {
    if (deliveryCountries.length === 0) {
      return;
    }
    const current = shippingCountry?.trim() ?? '';
    const matchingOption = current
      ? deliveryCountries.find((c) => countriesMatch(current, c))
      : undefined;
    if (matchingOption) {
      if (matchingOption !== current) {
        setValue('shippingCountry', matchingOption);
      }
      return;
    }
    setValue('shippingCountry', resolveDefaultDeliveryCountry(deliveryCountries));
  }, [deliveryCountries, shippingCountry, setValue]);

  useEffect(() => {
    if (!shippingRegion?.trim()) {
      return;
    }
    const stillValid = filteredDeliveryLocations.some((l) => l.id === shippingRegion);
    if (!stillValid) {
      setValue('shippingRegion', '');
    }
  }, [shippingCountry, filteredDeliveryLocations, shippingRegion, setValue]);

  const { cart, loading, fetchCart, setCart } = useCart();
  const categoryPriceByTitle = useSizeCatalogPriceByTitle();

  const checkoutSubtotalUsd = useMemo(
    () => getCartCheckoutSubtotalUsd(cart, categoryPriceByTitle),
    [cart, categoryPriceByTitle]
  );

  const cartFingerprint = useMemo(
    () => cart?.items.map((i) => `${i.id}:${i.quantity}`).join('|') ?? '',
    [cart?.items],
  );

  useEffect(() => {
    setAppliedCouponCode(null);
    setCouponDiscountUsd(0);
    setCouponFieldError(null);
    setCouponDraft('');
  }, [cartFingerprint]);

  const { deliveryPrice, loadingDeliveryPrice } = useDeliveryPrice(
    shippingMethod,
    activeDeliveryLocation?.city,
    activeDeliveryLocation?.country,
    checkoutSubtotalUsd,
  );
  useUserProfile(isLoggedIn, isLoading, setValue, deliveryLocations);

  const { submitOrder, isPlacingOrder } = useOrderSubmission({
    cart,
    deliveryPrice,
    setError,
    deliveryLocations,
    appliedCouponCode,
  });

  const { orderSummary } = useOrderSummary({
    cart,
    shippingMethod,
    deliveryPrice,
    couponDiscountUsd,
  });

  const applyCoupon = useCallback(async () => {
    setCouponFieldError(null);
    if (!cart) {
      return;
    }
    const subtotalForCoupon = getCartCheckoutSubtotalUsd(cart, categoryPriceByTitle);
    if (subtotalForCoupon == null || subtotalForCoupon <= 0) {
      setCouponFieldError(t('checkout.coupon.cartEmpty'));
      return;
    }
    setCouponApplying(true);
    try {
      const res = await apiClient.post<{
        valid: boolean;
        discountAmountUsd?: number;
        code?: string;
        reason?: 'not_eligible_user';
      }>('/api/v1/coupons/validate', {
        code: couponDraft,
        merchandiseSubtotalUsd: subtotalForCoupon,
      });
      if (!res.valid) {
        setAppliedCouponCode(null);
        setCouponDiscountUsd(0);
        setCouponFieldError(
          res.reason === 'not_eligible_user'
            ? t('checkout.coupon.notEligibleUser')
            : t('checkout.coupon.invalid'),
        );
        return;
      }
      setAppliedCouponCode(typeof res.code === 'string' ? res.code : null);
      setCouponDiscountUsd(
        typeof res.discountAmountUsd === 'number' && Number.isFinite(res.discountAmountUsd)
          ? Math.max(0, res.discountAmountUsd)
          : 0,
      );
    } catch {
      setAppliedCouponCode(null);
      setCouponDiscountUsd(0);
      setCouponFieldError(t('checkout.coupon.invalid'));
    } finally {
      setCouponApplying(false);
    }
  }, [cart, categoryPriceByTitle, couponDraft, t]);

  const removeCoupon = useCallback(() => {
    setAppliedCouponCode(null);
    setCouponDiscountUsd(0);
    setCouponFieldError(null);
    setCouponDraft('');
  }, []);

  const removeCartItem = useCallback(
    async (itemId: string) => {
      if (!cart || removingItemId) {
        return;
      }

      setRemovingItemId(itemId);
      try {
        await handleRemoveItem(itemId, cart, setCart, fetchCart);
      } finally {
        setRemovingItemId(null);
      }
    },
    [cart, fetchCart, removingItemId, setCart],
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }

    fetchCart();

    const handleLanguageUpdate = () => {
      setLanguage(getStoredLanguage());
    };

    window.addEventListener('language-updated', handleLanguageUpdate);

    return () => {
      window.removeEventListener('language-updated', handleLanguageUpdate);
    };
  }, [isLoggedIn, isLoading, fetchCart]);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const handleValidationError = (validationErrors: FieldErrors<CheckoutFormData>) => {
      if (
        validationErrors.shippingAddress ||
        validationErrors.shippingCountry ||
        validationErrors.shippingRegion
      ) {
        setError(t('checkout.errors.fillShippingAddress'));
      }

      const firstErrorField = Object.keys(validationErrors)[0] as keyof CheckoutFormData | undefined;
      if (!firstErrorField) {
        return;
      }

      const errorElement = document.querySelector<HTMLElement>(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        requestAnimationFrame(() => {
          if ('focus' in errorElement) {
            errorElement.focus();
          }
        });
      }
    };

    void handleSubmit(
      async (data) => {
        if (data.paymentMethod === 'arca' || data.paymentMethod === 'idram') {
          setShowCardModal(true);
          return;
        }
        await submitOrder(data);
      },
      handleValidationError,
    )(e);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    await submitOrder(data);
  };

  return {
    // State
    cart,
    loading,
    error,
    setError,
    logoErrors,
    setLogoErrors,
    showShippingModal,
    setShowShippingModal,
    showCardModal,
    setShowCardModal,
    deliveryPrice,
    loadingDeliveryPrice,
    deliveryLocations,
    deliveryCountries,
    filteredDeliveryLocations,
    loadingDeliveryLocations,
    // Form
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isPlacingOrder,
    setValue,
    watch,
    // Computed
    paymentMethod,
    shippingMethod,
    selectedShippingCountry: shippingCountry,
    shippingCountry: shippingCountrySummary,
    paymentMethods,
    orderSummary,
    couponDraft,
    setCouponDraft,
    applyCoupon,
    removeCoupon,
    couponApplying,
    couponFieldError,
    appliedCouponCode,
    removingItemId,
    removeCartItem,
    // Actions
    handlePlaceOrder,
    onSubmit,
  };
}
