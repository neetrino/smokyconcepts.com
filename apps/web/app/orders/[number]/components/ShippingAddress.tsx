'use client';

import { Card } from '@shop/ui';
import { useTranslation } from '../../../../lib/i18n-client';
import { resolveShippingCountryLabel } from '../../../../lib/shipping-address-display';
import type { Order } from '../types';

interface ShippingAddressProps {
  shippingAddress: Order['shippingAddress'];
}

export function ShippingAddress({ shippingAddress }: ShippingAddressProps) {
  const { t } = useTranslation();
  const country = resolveShippingCountryLabel(shippingAddress);

  if (!shippingAddress) {
    return null;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('orders.shippingAddress.title')}</h2>
      <div className="text-gray-600">
        {shippingAddress.firstName && shippingAddress.lastName && (
          <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
        )}
        {country && (
          <p>{t('orders.shippingAddress.country').replace('{country}', country)}</p>
        )}
        {shippingAddress.state && (
          <p>{t('orders.shippingAddress.region').replace('{region}', shippingAddress.state)}</p>
        )}
        {shippingAddress.city && (
          <p>
            {shippingAddress.city}
            {shippingAddress.postalCode && `, ${shippingAddress.postalCode}`}
          </p>
        )}
        {(shippingAddress.addressLine1 || shippingAddress.address) && (
          <p>{shippingAddress.addressLine1 || shippingAddress.address}</p>
        )}
        {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
        {shippingAddress.phone && (
          <p className="mt-2">
            {t('orders.shippingAddress.phone').replace('{phone}', shippingAddress.phone)}
          </p>
        )}
      </div>
    </Card>
  );
}




