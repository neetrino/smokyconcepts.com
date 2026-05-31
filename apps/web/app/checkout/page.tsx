'use client';

import { useRouter } from 'next/navigation';
import { Card, Button } from '@shop/ui';
import { useTranslation } from '../../lib/i18n-client';
import { CheckoutProductsStrip } from './components/CheckoutProductsStrip';
import { CheckoutForm } from './CheckoutForm';
import { CheckoutModals } from './CheckoutModals';
import { CheckoutPlacingOrderOverlay } from './components/CheckoutPlacingOrderOverlay';
import { OrderSummary } from './OrderSummary';
import { useCheckout } from './useCheckout';

export default function CheckoutPage() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const {
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
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isPlacingOrder,
    setValue,
    paymentMethod,
    shippingMethod,
    selectedShippingCountry,
    deliveryCountries,
    filteredDeliveryLocations,
    loadingDeliveryLocations,
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
    handlePlaceOrder,
    onSubmit,
  } = useCheckout();
  const itemsCountLabel =
    cart && cart.itemsCount === 1
      ? t('checkout.productsStrip.itemCountSingle').replace('{count}', String(cart.itemsCount))
      : t('checkout.productsStrip.itemCountPlural').replace('{count}', String(cart?.itemsCount ?? 0));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('checkout.title')}</h1>
        <Card className="p-6 text-center">
          <p className="text-gray-600 mb-4">{t('checkout.errors.cartEmpty')}</p>
          <Button variant="gold" onClick={() => router.push('/products')}>
            {t('checkout.buttons.continueShopping')}
          </Button>
        </Card>
      </div>
    );
  }

  const isOrderInFlight = isPlacingOrder || isSubmitting;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <CheckoutPlacingOrderOverlay visible={isPlacingOrder} />
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('checkout.title')}</h1>
      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <CheckoutProductsStrip
            items={cart.items}
            itemsCountLabel={itemsCountLabel}
            onRemoveItem={(itemId) => void removeCartItem(itemId)}
            removingItemId={removingItemId}
          />

          {/* Checkout Form */}
          <div className="lg:col-span-2 lg:row-start-2">
            <CheckoutForm
              register={register}
              setValue={setValue}
              errors={errors}
              isSubmitting={isOrderInFlight}
              paymentMethod={paymentMethod}
              paymentMethods={paymentMethods}
              logoErrors={logoErrors}
              setLogoErrors={setLogoErrors}
              error={error}
              setError={setError}
              deliveryCountries={deliveryCountries}
              filteredDeliveryLocations={filteredDeliveryLocations}
              loadingDeliveryLocations={loadingDeliveryLocations}
              selectedShippingCountry={selectedShippingCountry}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 lg:row-span-2 self-start lg:sticky lg:top-24">
            <OrderSummary
              register={register}
              errors={errors}
              orderSummary={orderSummary}
              shippingMethod={shippingMethod}
              loadingDeliveryPrice={loadingDeliveryPrice}
              deliveryPrice={deliveryPrice}
              error={error}
              isSubmitting={isOrderInFlight}
              couponDraft={couponDraft}
              onCouponDraftChange={setCouponDraft}
              onApplyCoupon={applyCoupon}
              onRemoveCoupon={removeCoupon}
              couponApplying={couponApplying}
              couponFieldError={couponFieldError}
              appliedCouponCode={appliedCouponCode}
            />
          </div>
        </div>
      </form>

      <CheckoutModals
        showShippingModal={showShippingModal}
        setShowShippingModal={setShowShippingModal}
        showCardModal={showCardModal}
        setShowCardModal={setShowCardModal}
        register={register}
        setValue={setValue}
        handleSubmit={handleSubmit}
        errors={errors}
        isSubmitting={isOrderInFlight}
        shippingMethod={shippingMethod}
        paymentMethod={paymentMethod}
        deliveryCountries={deliveryCountries}
        filteredDeliveryLocations={filteredDeliveryLocations}
        selectedShippingCountry={selectedShippingCountry}
        loadingDeliveryLocations={loadingDeliveryLocations}
        cart={cart}
        orderSummary={orderSummary}
        loadingDeliveryPrice={loadingDeliveryPrice}
        deliveryPrice={deliveryPrice}
        logoErrors={logoErrors}
        setLogoErrors={setLogoErrors}
        onSubmit={onSubmit}
      />
    </div>
  );
}
