'use client';

import { useTranslation } from '../../../lib/i18n-client';

interface ShippingCountryFieldProps {
  country: string | undefined;
}

export function ShippingCountryField({ country }: ShippingCountryFieldProps) {
  const { t } = useTranslation();
  const display = country?.trim() || '—';

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="checkout-shipping-country">
        {t('checkout.form.country')}
      </label>
      <div
        id="checkout-shipping-country"
        className="w-full min-h-[42px] flex items-center px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
        aria-readonly="true"
      >
        {display}
      </div>
    </div>
  );
}
