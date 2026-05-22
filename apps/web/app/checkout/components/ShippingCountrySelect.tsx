'use client';

import { UseFormRegister } from 'react-hook-form';
import { useTranslation } from '../../../lib/i18n-client';
import type { CheckoutFormData } from '../types';

interface ShippingCountrySelectProps {
  register: UseFormRegister<CheckoutFormData>;
  value: string;
  countries: string[];
  error?: string;
  disabled: boolean;
  loading: boolean;
  onAfterChange?: () => void;
}

export function ShippingCountrySelect({
  register,
  value,
  countries,
  error,
  disabled,
  loading,
  onAfterChange,
}: ShippingCountrySelectProps) {
  const { t } = useTranslation();
  const reg = register('shippingCountry');

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="checkout-shipping-country">
        {t('checkout.form.country')}
      </label>
      <select
        id="checkout-shipping-country"
        name={reg.name}
        ref={reg.ref}
        value={value}
        onBlur={reg.onBlur}
        onChange={(e) => {
          reg.onChange(e);
          onAfterChange?.();
        }}
        disabled={disabled || loading}
        className={`w-full px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:cursor-not-allowed ${
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'
        }`}
      >
        <option value="">
          {loading ? t('checkout.shipping.loading') : t('checkout.placeholders.selectCountry')}
        </option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
