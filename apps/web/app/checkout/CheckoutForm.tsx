'use client';

import { Card, Input } from '@shop/ui';
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { useTranslation } from '../../lib/i18n-client';
import { DeliveryRegionSelect } from './components/DeliveryRegionSelect';
import { ShippingCountrySelect } from './components/ShippingCountrySelect';
import { CheckoutFormData } from './types';
import type { DeliveryLocationOption } from './hooks/useDeliveryLocations';

interface CheckoutFormProps {
  register: UseFormRegister<CheckoutFormData>;
  setValue: UseFormSetValue<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  isSubmitting: boolean;
  paymentMethod: 'idram' | 'arca' | 'cash_on_delivery';
  paymentMethods: Array<{
    id: 'idram' | 'arca' | 'cash_on_delivery';
    name: string;
    description: string;
    logo: string | null;
  }>;
  logoErrors: Record<string, boolean>;
  setLogoErrors: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  deliveryCountries: string[];
  filteredDeliveryLocations: DeliveryLocationOption[];
  loadingDeliveryLocations: boolean;
  selectedShippingCountry?: string;
}

const ARCA_SUPPORTED_LOGOS = [
  { id: 'arca', src: '/assets/payments/arca.svg', alt: 'ArCa' },
  { id: 'mastercard', src: '/assets/payments/Mastercard-logo.svg', alt: 'Mastercard' },
  { id: 'visa', src: '/assets/payments/Visa_logo_wiki.svg', alt: 'Visa' },
] as const;

export function CheckoutForm({
  register,
  setValue,
  errors,
  isSubmitting,
  paymentMethod,
  paymentMethods,
  logoErrors,
  setLogoErrors,
  error,
  setError,
  deliveryCountries,
  filteredDeliveryLocations,
  loadingDeliveryLocations,
  selectedShippingCountry,
}: CheckoutFormProps) {
  const { t } = useTranslation();
  const mobilePaymentLabels: Record<'idram' | 'arca' | 'cash_on_delivery', string> = {
    cash_on_delivery: t('checkout.payment.cashOnDeliveryShort'),
    idram: t('checkout.payment.idramShort'),
    arca: t('checkout.payment.arcaShort'),
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      <input type="hidden" {...register('shippingMethod')} />
      {/* Contact Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('checkout.contactInformation')}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('checkout.form.firstName')}
              type="text"
              {...register('firstName')}
              error={errors.firstName?.message}
              disabled={isSubmitting}
            />
            <Input
              label={t('checkout.form.lastName')}
              type="text"
              {...register('lastName')}
              error={errors.lastName?.message}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('checkout.form.email')}
              type="email"
              {...register('email')}
              error={errors.email?.message}
              disabled={isSubmitting}
            />
            <Input
              label={t('checkout.form.phone')}
              type="tel"
              placeholder={t('checkout.placeholders.phone')}
              {...register('phone')}
              error={errors.phone?.message}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </Card>

      {/* Shipping address — checkout is delivery-only (shippingMethod fixed in form defaults) */}
      <Card className="p-6" data-shipping-section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('checkout.shippingAddress')}</h2>
          {(error && error.includes('shipping address')) ||
          errors.shippingAddress ||
          errors.shippingCountry ||
          errors.shippingRegion ? (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                {error && error.includes('shipping address')
                  ? error
                  : errors.shippingAddress?.message ||
                    errors.shippingCountry?.message ||
                    errors.shippingRegion?.message}
              </p>
            </div>
          ) : null}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ShippingCountrySelect
                register={register}
                value={selectedShippingCountry ?? ''}
                countries={deliveryCountries}
                error={errors.shippingCountry?.message}
                disabled={isSubmitting}
                loading={loadingDeliveryLocations}
                onAfterChange={() => {
                  setValue('shippingRegion', '');
                  if (error && error.includes('shipping address')) {
                    setError(null);
                  }
                }}
              />
              <DeliveryRegionSelect
                register={register}
                error={errors.shippingRegion?.message}
                disabled={isSubmitting}
                locations={filteredDeliveryLocations}
                loading={loadingDeliveryLocations}
                countrySelected={Boolean(selectedShippingCountry?.trim())}
                onAfterChange={() => {
                  if (error && error.includes('shipping address')) {
                    setError(null);
                  }
                }}
              />
            </div>
            <Input
              label={t('checkout.form.address')}
              type="text"
              placeholder={t('checkout.placeholders.address')}
              {...register('shippingAddress', {
                onChange: () => {
                  if (error && error.includes('shipping address')) {
                    setError(null);
                  }
                },
              })}
              error={errors.shippingAddress?.message}
              disabled={isSubmitting}
            />
          </div>
        </Card>

      {/* Payment Method */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('checkout.paymentMethod')}</h2>
        {errors.paymentMethod && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.paymentMethod.message}</p>
          </div>
        )}
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`flex items-start sm:items-center p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all ${
                paymentMethod === method.id
                  ? 'border-[#dcc090] bg-[#dcc090]/10'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                {...register('paymentMethod', {
                  onChange: (e) => {
                    setValue(
                      'paymentMethod',
                      e.target.value as 'idram' | 'arca' | 'cash_on_delivery',
                      {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      },
                    );
                  },
                })}
                value={method.id}
                checked={paymentMethod === method.id}
                className="mr-3 mt-0.5 sm:mt-0 sm:mr-4"
                disabled={isSubmitting}
              />
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {method.id === 'arca' ? (
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    {ARCA_SUPPORTED_LOGOS.map((logo) => {
                      const logoKey = `${method.id}-${logo.id}`;

                      return (
                        <div
                          key={logo.id}
                          className="relative w-10 h-6 sm:w-14 sm:h-9 bg-white rounded border border-gray-200 flex items-center justify-center overflow-hidden"
                        >
                          {logoErrors[logoKey] ? (
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          ) : (
                            <img
                              src={logo.src}
                              alt={logo.alt}
                              className="w-full h-full object-contain p-1"
                              loading="lazy"
                              onError={() => {
                                setLogoErrors((prev) => ({ ...prev, [logoKey]: true }));
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="relative w-16 h-10 sm:w-20 sm:h-12 flex-shrink-0 bg-white rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                    {!method.logo || logoErrors[method.id] ? (
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    ) : (
                      <img
                        src={method.logo}
                        alt={method.name}
                        className="w-full h-full object-contain p-1.5"
                        loading="lazy"
                        onError={() => {
                          setLogoErrors((prev) => ({ ...prev, [method.id]: true }));
                        }}
                      />
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 whitespace-nowrap text-sm sm:text-base">
                    <span className="sm:hidden">{mobilePaymentLabels[method.id]}</span>
                    <span className="hidden sm:inline">{method.name}</span>
                  </div>
                  <div className="hidden sm:block text-sm text-gray-600">{method.description}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}



