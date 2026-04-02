'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@shop/ui';

import { apiClient } from '../../../../lib/api-client';
import { useTranslation } from '../../../../lib/i18n-client';
import { formatPriceInCurrency, amountToUsd } from '../../../../lib/currency';
import { OrderDetailsSummary } from '../components/OrderDetailsSummary';
import { OrderDetailsAddresses } from '../components/OrderDetailsAddresses';
import { OrderDetailsItems } from '../components/OrderDetailsItems';
import type { OrderDetails } from '../useOrders';

export default function AdminOrderDetailsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPaymentStatus, setUpdatingPaymentStatus] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError(t('admin.orders.orderDetails.failedToLoad'));
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<OrderDetails>(`/api/v1/admin/orders/${orderId}`);
        setOrderDetails(response);
      } catch (fetchError: unknown) {
        const apiError = fetchError as { message?: string };
        setError(apiError.message || t('admin.orders.orderDetails.failedToLoad'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, t]);

  const formatCurrency = (amount: number, _orderCurrency?: string, storedAs?: string): string =>
    formatPriceInCurrency(amountToUsd(amount, storedAs ?? 'USD'), 'USD');

  const handleStatusChange = async (newStatus: string) => {
    if (!orderId || !orderDetails || updatingStatus || orderDetails.status === newStatus) {
      return;
    }

    try {
      setUpdatingStatus(true);
      await apiClient.put(`/api/v1/admin/orders/${orderId}`, { status: newStatus });
      setOrderDetails((current) => (current ? { ...current, status: newStatus } : current));
    } catch (updateError: unknown) {
      const apiError = updateError as { message?: string };
      alert(apiError.message || t('admin.orders.failedToUpdateStatus'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus: string) => {
    if (!orderId || !orderDetails || updatingPaymentStatus || orderDetails.paymentStatus === newPaymentStatus) {
      return;
    }

    try {
      setUpdatingPaymentStatus(true);
      await apiClient.put(`/api/v1/admin/orders/${orderId}`, { paymentStatus: newPaymentStatus });
      setOrderDetails((current) =>
        current ? { ...current, paymentStatus: newPaymentStatus } : current
      );
    } catch (updateError: unknown) {
      const apiError = updateError as { message?: string };
      alert(apiError.message || t('admin.orders.failedToUpdatePaymentStatus'));
    } finally {
      setUpdatingPaymentStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
            <p className="text-gray-600">{t('admin.orders.orderDetails.loadingOrderDetails')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/admin/orders')}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('admin.orders.backToAdmin')}
          </button>
          <Card className="p-6 text-center text-red-600">{error || t('admin.orders.orderDetails.failedToLoad')}</Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push('/admin/orders')}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('admin.orders.backToAdmin')}
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('admin.orders.orderDetails.title')} — {orderDetails.number}
          </h1>
        </div>

        <div className="space-y-6">
          <OrderDetailsSummary
            orderDetails={orderDetails}
            currency="USD"
            formatCurrency={formatCurrency}
            updatingStatus={updatingStatus}
            updatingPaymentStatus={updatingPaymentStatus}
            onStatusChange={handleStatusChange}
            onPaymentStatusChange={handlePaymentStatusChange}
          />
          <OrderDetailsAddresses
            orderDetails={orderDetails}
          />
          <OrderDetailsItems
            orderDetails={orderDetails}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>
    </div>
  );
}
