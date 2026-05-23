'use client';

import { useEffect } from 'react';

import { useTranslation } from '../../../../lib/i18n-client';
import { OrderDetailsSummary } from './OrderDetailsSummary';
import { OrderDetailsTotals } from './OrderDetailsTotals';
import { OrderDetailsAddresses } from './OrderDetailsAddresses';
import { OrderDetailsItems } from './OrderDetailsItems';
import type { OrderDetails } from '../useOrders';

interface OrderDetailsModalProps {
  open: boolean;
  /** Order # from list row so the title shows immediately while the request runs. */
  detailHeaderHint: string | null;
  orderDetails: OrderDetails | null;
  loading: boolean;
  error: string | null;
  currency: string;
  onClose: () => void;
  formatCurrency: (amount: number, orderCurrency?: string, storedCurrency?: string) => string;
  updatingStatus: boolean;
  updatingPaymentStatus: boolean;
  onStatusChange: (newStatus: string) => void;
  onPaymentStatusChange: (newPaymentStatus: string) => void;
}

export function OrderDetailsModal({
  open,
  detailHeaderHint,
  orderDetails,
  loading,
  error,
  currency,
  onClose,
  formatCurrency,
  updatingStatus,
  updatingPaymentStatus,
  onStatusChange,
  onPaymentStatusChange,
}: OrderDetailsModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const titleSuffix = orderDetails?.number ?? detailHeaderHint ?? '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-modal-title"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-6">
          <h2 id="order-details-modal-title" className="text-2xl font-bold text-gray-900">
            {titleSuffix
              ? `${t('admin.orders.orderDetails.title')} #${titleSuffix}`
              : t('admin.orders.orderDetails.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label={t('admin.common.close')}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {loading && !orderDetails ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
              <p className="text-gray-600">{t('admin.orders.orderDetails.loadingOrderDetails')}</p>
            </div>
          ) : null}

          {error && !orderDetails ? (
            <div className="py-6 text-center text-red-600">{error}</div>
          ) : null}

          {orderDetails ? (
            <div className="space-y-6">
              <OrderDetailsSummary
                orderDetails={orderDetails}
                currency={currency}
                formatCurrency={formatCurrency}
                updatingStatus={updatingStatus}
                updatingPaymentStatus={updatingPaymentStatus}
                onStatusChange={onStatusChange}
                onPaymentStatusChange={onPaymentStatusChange}
              />
              <OrderDetailsTotals
                orderDetails={orderDetails}
                currency={currency}
                formatCurrency={formatCurrency}
              />
              <OrderDetailsAddresses orderDetails={orderDetails} />
              <OrderDetailsItems orderDetails={orderDetails} formatCurrency={formatCurrency} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
