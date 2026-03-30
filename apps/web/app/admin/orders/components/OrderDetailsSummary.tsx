'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import { Card } from '@shop/ui';
import { convertPrice, formatPriceInCurrency, type CurrencyCode } from '../../../../lib/currency';
import type { OrderDetails } from '../useOrders';

interface OrderDetailsSummaryProps {
  orderDetails: OrderDetails;
  currency: string;
  formatCurrency: (amount: number, orderCurrency?: string, fromCurrency?: CurrencyCode) => string;
  updatingStatus?: boolean;
  updatingPaymentStatus?: boolean;
  onStatusChange?: (newStatus: string) => void;
  onPaymentStatusChange?: (newPaymentStatus: string) => void;
}

export function OrderDetailsSummary({
  orderDetails,
  currency,
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
    : (orderDetails.payment?.method || orderDetails.payment?.provider || t('admin.orders.orderDetails.noPaymentInfo'));
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
        const subtotalAMD = convertPrice(orderDetails.totals.subtotal, 'USD', 'AMD');
        const discountAMD = convertPrice(orderDetails.totals.discount, 'USD', 'AMD');
        const shippingAMD = orderDetails.totals.shipping;
        const taxAMD = convertPrice(orderDetails.totals.tax, 'USD', 'AMD');
        const totalAMD = subtotalAMD - discountAMD + shippingAMD + taxAMD;
        const totalDisplay = currency === 'AMD' ? totalAMD : convertPrice(totalAMD, 'AMD', currency as CurrencyCode);
        return formatPriceInCurrency(totalDisplay, currency as CurrencyCode);
      })()
    : formatCurrency(orderDetails.total, (orderDetails.currency || 'USD') as CurrencyCode, 'USD');

  return (
    <Card className="p-4 md:p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
            {t('admin.orders.orderDetails.total')}
          </p>
          <div className="text-3xl font-extrabold leading-none text-[#001b4d]">
            {summaryValue}
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
            {t('admin.orders.orderDetails.status')}
          </p>
          <div className="relative inline-flex">
            <select
              value={orderDetails.status}
              onChange={(event) => onStatusChange(event.target.value)}
              disabled={updatingStatus}
              className={`h-9 min-w-[8.5rem] appearance-none rounded-md border-0 px-3 pr-8 text-sm font-bold outline-none ring-1 transition-shadow focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${statusSelectClassName}`}
            >
              <option value="pending">{t('admin.orders.pending')}</option>
              <option value="processing">{t('admin.orders.processing')}</option>
              <option value="completed">{t('admin.orders.completed')}</option>
              <option value="cancelled">{t('admin.orders.cancelled')}</option>
            </select>
            <svg className={`pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 ${orderDetails.status === 'completed' ? 'text-[#166534]' : orderDetails.status === 'processing' ? 'text-[#1e40af]' : orderDetails.status === 'cancelled' ? 'text-[#991b1b]' : 'text-[#7a5a00]'}`} viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
            {t('admin.orders.orderDetails.method')}
          </p>
          <div className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-200 bg-white px-2.5 text-sm font-semibold text-gray-900">
            {paymentMethodLogoPath ? (
              <img
                src={paymentMethodLogoPath}
                alt=""
                className="h-4 w-auto"
                aria-hidden
              />
            ) : null}
            <span>{paymentMethodLabel}</span>
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
            {t('admin.orders.orderDetails.payment')}
          </p>
          <div className="relative inline-flex">
            <select
              value={orderDetails.paymentStatus}
              onChange={(event) => onPaymentStatusChange(event.target.value)}
              disabled={updatingPaymentStatus}
              className={`h-9 min-w-[8.5rem] appearance-none rounded-md border-0 px-3 pr-8 text-sm font-bold outline-none ring-1 transition-shadow focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${paymentSelectClassName}`}
            >
              <option value="paid">{t('admin.orders.paid')}</option>
              <option value="pending">{t('admin.orders.pendingPayment')}</option>
              <option value="failed">{t('admin.orders.failed')}</option>
            </select>
            <svg className={`pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 ${orderDetails.paymentStatus === 'paid' ? 'text-[#166534]' : orderDetails.paymentStatus === 'failed' ? 'text-[#991b1b]' : 'text-[#7a5a00]'}`} viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </Card>
  );
}

