'use client';

import { UseFormRegister, UseFormSetValue, UseFormHandleSubmit, FieldErrors } from 'react-hook-form';
import { ShippingAddressModal } from './components/ShippingAddressModal';
import { CardDetailsModal } from './components/CardDetailsModal';
import type { CheckoutFormData, Cart, CheckoutOrderSummaryTotals } from './types';
import type { DeliveryLocationOption } from './hooks/useDeliveryLocations';

interface CheckoutModalsProps {
  showShippingModal: boolean;
  setShowShippingModal: (show: boolean) => void;
  showCardModal: boolean;
  setShowCardModal: (show: boolean) => void;
  register: UseFormRegister<CheckoutFormData>;
  setValue: UseFormSetValue<CheckoutFormData>;
  handleSubmit: UseFormHandleSubmit<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  isSubmitting: boolean;
  shippingMethod: 'pickup' | 'delivery';
  paymentMethod: 'idram' | 'arca' | 'cash_on_delivery';
  deliveryCountries: string[];
  filteredDeliveryLocations: DeliveryLocationOption[];
  selectedShippingCountry?: string;
  loadingDeliveryLocations: boolean;
  cart: Cart | null;
  orderSummary: CheckoutOrderSummaryTotals;
  loadingDeliveryPrice: boolean;
  deliveryPrice: number | null;
  logoErrors: Record<string, boolean>;
  setLogoErrors: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onSubmit: (data: CheckoutFormData) => void;
}

export function CheckoutModals({
  showShippingModal,
  setShowShippingModal,
  showCardModal,
  setShowCardModal,
  register,
  setValue,
  handleSubmit,
  errors,
  isSubmitting,
  shippingMethod,
  paymentMethod,
  deliveryCountries,
  filteredDeliveryLocations,
  selectedShippingCountry,
  loadingDeliveryLocations,
  cart,
  orderSummary,
  loadingDeliveryPrice,
  deliveryPrice,
  logoErrors,
  setLogoErrors,
  onSubmit,
}: CheckoutModalsProps) {
  return (
    <>
      <ShippingAddressModal
        isOpen={showShippingModal}
        onClose={() => setShowShippingModal(false)}
        register={register}
        setValue={setValue}
        handleSubmit={handleSubmit}
        errors={errors}
        isSubmitting={isSubmitting}
        shippingMethod={shippingMethod}
        paymentMethod={paymentMethod}
        cart={cart}
        orderSummary={orderSummary}
        deliveryCountries={deliveryCountries}
        filteredDeliveryLocations={filteredDeliveryLocations}
        selectedShippingCountry={selectedShippingCountry}
        loadingDeliveryLocations={loadingDeliveryLocations}
        loadingDeliveryPrice={loadingDeliveryPrice}
        deliveryPrice={deliveryPrice}
        onSubmit={onSubmit}
      />

      <CardDetailsModal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        register={register}
        setValue={setValue}
        handleSubmit={handleSubmit}
        errors={errors}
        isSubmitting={isSubmitting}
        paymentMethod={paymentMethod}
        shippingMethod={shippingMethod}
        cart={cart}
        orderSummary={orderSummary}
        loadingDeliveryPrice={loadingDeliveryPrice}
        deliveryPrice={deliveryPrice}
        logoErrors={logoErrors}
        setLogoErrors={setLogoErrors}
        onSubmit={onSubmit}
      />
    </>
  );
}
