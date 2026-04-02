'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import { Card } from '@shop/ui';
import { amountToUsd, formatPriceInCurrency } from '../../../../lib/currency';
import type { OrderDetails } from '../useOrders';

interface OrderDetailsSummaryProps {
  orderDetails: OrderDetails;
  currency: string;
  formatCurrency: (amount: number, orderCurrency?: string, storedCurrency?: string) => string;
  updatingStatus?: boolean;
  updatingPaymentStatus?: boolean;
  onStatusChange?: (newStatus: string) => void;
  onPaymentStatusChange?: (newPaymentStatus: string) => void;
}

export function OrderDetailsSummary({
  orderDetails,
  currency: _currency,
  formatCurrency,
  updatingStatus = false,
  updatingPaymentStatus = false,
  onStatusChange = () => {},
  onPaymentStatusChange = () => {},
}: OrderDetailsSummaryProps) {
  const { t } = useTranslation();
  const rawPaymentMethod = (orderDetails.payment?.method || orderDetails.payment?.provider || '').toLowerCase();
  const paymentTranslationKey =
    rawPaymentMethod === 'cash_on_delivery'
      ? 'cashOnDelivery'
      : rawPaymentMethod === 'arca'
        ? 'arca'
        : rawPaymentMethod === 'idram'
          ? 'idram'
          : '';
  const paymentMethodLabel = paymentTranslationKey
    ? t(`checkout.payment.${paymentTranslationKey}` as never)
    : (orderDetails.payment?.method ||
        orderDetails.payment?.provider ||
        t('admin.orders.orderDetails.noPaymentInfo'));
  const paymentMethodLogoPath =
    rawPaymentMethod === 'arca'
      ? '/assets/payments/arca.svg'
      : rawPaymentMethod === 'idram'
        ? '/assets/payments/idram.svg'
        : null;

  const statusSelectClassName =
    orderDetails.status === 'completed'
      ? 'bg-[#dcfce7] text-[#166534] ring-[#9ee4b6] focus:ring-[#64cb8e]'
      : orderDetails.status === 'processing'
        ? 'bg-[#dbeafe] text-[#1e40af] ring-[#93c5fd] focus:ring-[#60a5fa]'
        : orderDetails.status === 'cancelled'
          ? 'bg-[#fee2e2] text-[#991b1b] ring-[#fca5a5] focus:ring-[#f87171]'
          : 'bg-[#fff4cc] text-[#7a5a00] ring-[#f0d98a] focus:ring-[#e1c259]';

  const paymentSelectClassName =
    orderDetails.paymentStatus === 'paid'
      ? 'bg-[#dcfce7] text-[#166534] ring-[#9ee4b6] focus:ring-[#64cb8e]'
      : orderDetails.paymentStatus === 'failed'
        ? 'bg-[#fee2e2] text-[#991b1b] ring-[#fca5a5] focus:ring-[#f87171]'
        : 'bg-[#fff4cc] text-[#7a5a00] ring-[#f0d98a] focus:ring-[#e1c259]';

  const summaryValue = orderDetails.totals
    ? (() => {
        const subtotalUsd = amountToUsd(orderDetails.totals.subtotal, orderDetails.totals.currency);
        const discountUsd = amountToUsd(orderDetails.totals.discount, orderDetails.totals.currency);
        const shippingUsd = amountToUsd(
          orderDetails.totals.shipping,
          orderDetails.totals.currency || orderDetails.currency
        );
        const taxUsd = amountToUsd(orderDetails.totals.tax, orderDetails.totals.currency);
        const totalUsd = subtotalUsd - discountUsd + shippingUsd + taxUsd;
        return formatPriceInCurrency(totalUsd, 'USD');
      })()
    : formatCurrency(orderDetails.total, 'USD', orderDetails.currency || 'USD');

  return (
    <Card className="p-4 md:p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
            {t('admin.orders.orderDetails.total')}
          </p>
          <div className="text-3xl font-extrabold leading-none text-[#001b4d]">{summaryValue}</div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
            {t('admin.orders.orderDetails.status')}
          </p>
          {updatingStatus ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-900" />
              {t('admin.orders.updating')}
            </div>
          ) : (
            <select
              value={orderDetails.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className={`mt-1 w-full rounded-lg px-3 py-2 text-sm font-semibold ring-1 ring-inset focus:outline-none focus:ring-2 ${statusSelectClassName}`}
            >
              <option value="pending">{t('admin.orders.pending')}</option>
              <option value="processing">{t('admin.orders.processing')}</option>
              <option value="completed">{t('admin.orders.completed')}</option>
              <option value="cancelled">{t('admin.orders.cancelled')}</option>
            </select>
          )}
        </div>

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
            {t('admin.orders.orderDetails.payment')}
          </p>
          <div className="mt-1 flex items-center gap-2">
            {paymentMethodLogoPath ? (
              <img src={paymentMethodLogoPath} alt="" className="h-6 w-auto" />
            ) : null}
            <span className="text-sm font-medium text-gray-900">{paymentMethodLabel}</span>
          </div>
          {updatingPaymentStatus ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-900" />
              {t('admin.orders.updating')}
            </div>
          ) : (
            <select
              value={orderDetails.paymentStatus}
              onChange={(e) => onPaymentStatusChange(e.target.value)}
              className={`mt-2 w-full rounded-lg px-3 py-2 text-sm font-semibold ring-1 ring-inset focus:outline-none focus:ring-2 ${paymentSelectClassName}`}
            >
              <option value="paid">{t('admin.orders.paid')}</option>
              <option value="pending">{t('admin.orders.pendingPayment')}</option>
              <option value="failed">{t('admin.orders.failed')}</option>
            </select>
          )}
        </div>

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
            {t('admin.orders.orderDetails.placed')}
          </p>
          <p className="text-sm font-medium text-gray-900">
            {new Date(orderDetails.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
}
