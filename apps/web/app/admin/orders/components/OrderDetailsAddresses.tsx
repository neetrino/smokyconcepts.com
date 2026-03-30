'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import { Card } from '@shop/ui';
import type { OrderDetails } from '../useOrders';

interface OrderDetailsAddressesProps {
  orderDetails: OrderDetails;
}

export function OrderDetailsAddresses({ orderDetails }: OrderDetailsAddressesProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card className="p-4 md:p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('admin.orders.orderDetails.shippingAddress')}</h3>
        {orderDetails.shippingMethod === 'pickup' ? (
          <div className="text-sm text-gray-700 space-y-1">
            <div>
              <span className="font-medium">{t('admin.orders.orderDetails.shippingMethod')}</span>{' '}
              {t('admin.orders.orderDetails.pickup')}
            </div>
          </div>
        ) : orderDetails.shippingMethod === 'delivery' && orderDetails.shippingAddress ? (
          <div className="text-sm text-gray-700 space-y-1">
            <div className="mb-2">
              <span className="font-medium">{t('admin.orders.orderDetails.shippingMethod')}</span>{' '}
              {t('checkout.shipping.delivery')}
            </div>
            {(orderDetails.shippingAddress.address || orderDetails.shippingAddress.addressLine1) && (
              <div>
                <span className="font-medium">{t('checkout.form.address')}:</span>{' '}
                {orderDetails.shippingAddress.address || orderDetails.shippingAddress.addressLine1}
                {orderDetails.shippingAddress.addressLine2 && `, ${orderDetails.shippingAddress.addressLine2}`}
              </div>
            )}
            {orderDetails.shippingAddress.city && (
              <div>
                <span className="font-medium">{t('checkout.form.city')}:</span> {orderDetails.shippingAddress.city}
              </div>
            )}
            {orderDetails.shippingAddress.postalCode && (
              <div>
                <span className="font-medium">{t('checkout.form.postalCode')}:</span> {orderDetails.shippingAddress.postalCode}
              </div>
            )}
            {(orderDetails.shippingAddress.phone || orderDetails.shippingAddress.shippingPhone) && (
              <div className="mt-2">
                <span className="font-medium">{t('checkout.form.phoneNumber')}:</span>{' '}
                {orderDetails.shippingAddress.phone || orderDetails.shippingAddress.shippingPhone}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            <p>{t('admin.orders.orderDetails.noShippingAddress')}</p>
            {orderDetails.shippingMethod && (
              <p>
                {t('admin.orders.orderDetails.shippingMethod')}{' '}
                {orderDetails.shippingMethod === 'pickup'
                  ? t('admin.orders.orderDetails.pickup')
                  : orderDetails.shippingMethod === 'delivery'
                  ? t('checkout.shipping.delivery')
                  : orderDetails.shippingMethod}
              </p>
            )}
          </div>
        )}
      </Card>

      <Card className="p-4 md:p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('admin.orders.orderDetails.customer')}</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <div>
            {(orderDetails.customer?.firstName || '') +
              (orderDetails.customer?.lastName ? ` ${orderDetails.customer.lastName}` : '') ||
              t('admin.orders.unknownCustomer')}
          </div>
          {(orderDetails.customerPhone || orderDetails.shippingAddress?.phone || orderDetails.shippingAddress?.shippingPhone) && (
            <div>
              {orderDetails.customerPhone || orderDetails.shippingAddress?.phone || orderDetails.shippingAddress?.shippingPhone}
            </div>
          )}
          {orderDetails.customerEmail && <div>{orderDetails.customerEmail}</div>}
        </div>
      </Card>
    </div>
  );
}


