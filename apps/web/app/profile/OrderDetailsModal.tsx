import { Button, Card } from '@shop/ui';
import { OrderItems } from '../orders/[number]/components/OrderItems';
import { OrderSummary } from '../orders/[number]/components/OrderSummary';
import type { Order } from '../orders/[number]/types';
import { resolveShippingCountryLabel } from '../../lib/shipping-address-display';
import { getStatusColor, getPaymentStatusColor } from './utils';
import type { OrderDetails } from './types';

interface OrderDetailsModalProps {
  selectedOrder: OrderDetails;
  orderDetailsLoading: boolean;
  orderDetailsError: string | null;
  isReordering: boolean;
  onClose: () => void;
  onReOrder: () => void;
  t: (key: string) => string;
}

export function OrderDetailsModal({
  selectedOrder,
  orderDetailsLoading,
  orderDetailsError,
  isReordering,
  onClose,
  onReOrder,
  t,
}: OrderDetailsModalProps) {
  const orderForDisplay = selectedOrder as Order;
  const shippingCountry = resolveShippingCountryLabel(selectedOrder.shippingAddress);
  const orderTotalsCurrency = selectedOrder.totals?.currency ?? 'USD';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('profile.orderDetails.title')}
                {selectedOrder.number}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {t('profile.orderDetails.placedOn')}{' '}
                {new Date(selectedOrder.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={onReOrder} disabled={isReordering} variant="primary" size="sm">
                {isReordering ? t('profile.orderDetails.adding') : t('profile.orderDetails.reorder')}
              </Button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                aria-label={t('profile.orderDetails.close')}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            {orderDetailsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
                <p className="text-gray-600">{t('profile.orderDetails.loading')}</p>
              </div>
            ) : orderDetailsError ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{orderDetailsError}</p>
                <Button onClick={onClose} variant="outline">
                  {t('profile.orderDetails.close')}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 max-sm:flex-nowrap">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('profile.orderDetails.orderStatus')}
                      </h3>
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(selectedOrder.status)}`}
                      >
                        {selectedOrder.status}
                      </span>
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}
                      >
                        {t('profile.orderDetails.payment')}: {selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </Card>

                  <OrderItems items={selectedOrder.items} orderTotalsCurrency={orderTotalsCurrency} />
                </div>

                <div className="space-y-4">
                  <OrderSummary order={orderForDisplay} showActions={false} />

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {t('profile.orderDetails.shippingMethod')}
                    </h3>
                    <div className="text-gray-700 space-y-3">
                      <div>
                        <span className="font-medium">{t('profile.orderDetails.method')}: </span>
                        <span className="capitalize">
                          {selectedOrder.shippingMethod === 'delivery'
                            ? t('profile.orderDetails.delivery')
                            : selectedOrder.shippingMethod === 'pickup'
                              ? t('profile.orderDetails.pickup')
                              : selectedOrder.shippingMethod || t('profile.orderDetails.notSpecified')}
                        </span>
                      </div>
                      {selectedOrder.shippingMethod === 'delivery' && selectedOrder.shippingAddress && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="font-medium text-gray-900 mb-2">
                            {t('profile.orderDetails.deliveryAddress')}:
                          </p>
                          <div className="text-gray-600">
                            {selectedOrder.shippingAddress.firstName &&
                              selectedOrder.shippingAddress.lastName && (
                                <p>
                                  {selectedOrder.shippingAddress.firstName}{' '}
                                  {selectedOrder.shippingAddress.lastName}
                                </p>
                              )}
                            {shippingCountry && (
                              <p>
                                {t('profile.orderDetails.country')}: {shippingCountry}
                              </p>
                            )}
                            {selectedOrder.shippingAddress.state && (
                              <p>
                                {t('profile.orderDetails.region')}: {selectedOrder.shippingAddress.state}
                              </p>
                            )}
                            {selectedOrder.shippingAddress.city && (
                              <p>
                                {selectedOrder.shippingAddress.city}
                                {selectedOrder.shippingAddress.postalCode &&
                                  `, ${selectedOrder.shippingAddress.postalCode}`}
                              </p>
                            )}
                            {(selectedOrder.shippingAddress.addressLine1 ||
                              selectedOrder.shippingAddress.address) && (
                              <p>
                                {selectedOrder.shippingAddress.addressLine1 ||
                                  selectedOrder.shippingAddress.address}
                              </p>
                            )}
                            {selectedOrder.shippingAddress.addressLine2 && (
                              <p>{selectedOrder.shippingAddress.addressLine2}</p>
                            )}
                            {selectedOrder.shippingAddress.phone && (
                              <p className="mt-2">
                                {t('profile.orderDetails.phone')}: {selectedOrder.shippingAddress.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
