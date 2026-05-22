'use client';

import { useRouter } from 'next/navigation';
import { Card, Button } from '@shop/ui';
import Link from 'next/link';
import { useTranslation } from '../../lib/i18n-client';
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
    shippingRegionSummary,
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
          <div className="rounded-2xl border border-gray-200 bg-white p-3.5 lg:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-wide text-gray-900 uppercase">
                {t('checkout.productsStrip.title')}
              </h2>
              <span className="text-[11px] font-medium text-gray-500">{itemsCountLabel}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {cart.items.map((item) => {
                const product = item.variant.product;
                const productImage = product.image;

                return (
                  <Link
                    key={item.id}
                    href={`/products/${product.slug}`}
                    className="group min-w-[64px] max-w-[64px]"
                    aria-label={product.title}
                  >
                    <div className="h-10 w-10 mx-auto overflow-hidden rounded-lg border border-gray-200 bg-[#faf9f7]">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
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
                    <p className="mt-1 line-clamp-1 text-center text-[10px] font-medium leading-4 text-gray-600 group-hover:text-gray-900">
                      {product.title}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

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
              orderSummary={orderSummary}
              shippingMethod={shippingMethod}
              shippingRegion={shippingRegionSummary}
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
        shippingRegion={shippingRegionSummary}
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
