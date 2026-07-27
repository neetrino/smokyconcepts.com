'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '../../../lib/api-client';
import { useTranslation } from '../../../lib/i18n-client';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { OrderStatus } from './components/OrderStatus';
import { OrderItems } from './components/OrderItems';
import { ShippingAddress } from './components/ShippingAddress';
import { OrderSummary } from './components/OrderSummary';
import type { Order } from './types';

function resolveOrderNumberParam(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.trim() !== '') {
    return value.trim();
  }
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim() !== '') {
    return value[0].trim();
  }
  return null;
}

export default function OrderPage() {
  const params = useParams();
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orderNumber = resolveOrderNumberParam(params.number);

  useEffect(() => {
    if (!orderNumber) {
      setOrder(null);
      setError(t('orders.notFound.description'));
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchOrder() {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<Order>(`/api/v1/orders/${orderNumber}`);
        if (cancelled) {
          return;
        }
        setOrder(response);
      } catch (err: unknown) {
        if (cancelled) {
          return;
        }
        const errorMessage = err instanceof Error ? err.message : t('orders.notFound.description');
        setOrder(null);
        setError(errorMessage);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchOrder();

    return () => {
      cancelled = true;
    };
  }, [orderNumber, t]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !order) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('orders.title').replace('{number}', order.number)}
        </h1>
        <p className="text-gray-600">
          {t('orders.placedOn').replace('{date}', new Date(order.createdAt).toLocaleDateString())}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <OrderStatus
            status={order.status}
            paymentStatus={order.paymentStatus}
          />
          <OrderItems items={order.items} orderTotalsCurrency={order.totals.currency} />
          {order.shippingAddress && (
            <ShippingAddress shippingAddress={order.shippingAddress} />
          )}
        </div>

        <OrderSummary order={order} />
      </div>
    </div>
  );
}
