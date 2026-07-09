'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import { Card } from '@shop/ui';
import { ADMIN_PRICE_CURRENCY, type CurrencyCode } from '../../../../lib/currency';
import {
  computeOrderSummaryDisplay,
  formatOrderTotalDisplay,
} from '@/lib/orders/order-summary-display';
import type { OrderDetails } from '../useOrders';
import {
  getAdminOrderPaymentSummarySelectClassNames,
  getAdminOrderStatusSummarySelectClassNames,
} from '../utils/orderUtils';
import { formatAdminDateTime } from '../../utils/formatAdminDate';

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

  /** Keeps summary column label rows the same height so values line up across the row. */
  const summaryControlHeaderClass =
    'mb-1 flex min-h-[2.75rem] flex-col justify-end';

  const adminCurrency = ADMIN_PRICE_CURRENCY as CurrencyCode;
  const summaryLines = (orderDetails.items ?? []).map((item) => ({
    price: item.unitPrice ?? (item.quantity > 0 ? item.total / item.quantity : item.total),
    quantity: item.quantity,
    sizeCatalogCategoryPriceAmd: item.sizeCatalogCategoryPriceAmd,
    variantBasePriceAmd: item.variantBasePriceAmd,
  }));
  const summaryOptions = {
    amountsAlreadyUsd: true,
    shippingPriceAmd: orderDetails.shippingPriceAmd,
  } as const;
  const summary = orderDetails.totals
    ? computeOrderSummaryDisplay(
        orderDetails.totals,
        orderDetails.collectionPriceAmount,
        adminCurrency,
        summaryLines,
        summaryOptions
      )
    : computeOrderSummaryDisplay(
        {
          subtotal: orderDetails.subtotal ?? orderDetails.total,
          discount: orderDetails.discountAmount ?? 0,
          shipping: orderDetails.shippingAmount ?? 0,
          tax: orderDetails.taxAmount ?? 0,
          total: orderDetails.total,
          currency: orderDetails.currency,
          collectionPriceAmount: orderDetails.collectionPriceAmount,
        },
        orderDetails.collectionPriceAmount,
        adminCurrency,
        summaryLines,
        summaryOptions
      );
  const summaryValue = formatOrderTotalDisplay(summary, adminCurrency);

  return (
    <Card className="p-4 md:p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div>
          <div className={summaryControlHeaderClass}>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
              {t('admin.orders.orderDetails.total')}
            </p>
          </div>
          <div className="mt-1 text-3xl font-extrabold leading-none text-[#001b4d]">{summaryValue}</div>
        </div>

        <div>
          <div className={summaryControlHeaderClass}>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
              {t('admin.orders.orderDetails.status')}
            </p>
          </div>
          {updatingStatus ? (
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-900" />
              {t('admin.orders.updating')}
            </div>
          ) : (
            <select
              value={orderDetails.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className={getAdminOrderStatusSummarySelectClassNames(orderDetails.status)}
            >
              <option value="pending">{t('admin.orders.pending')}</option>
              <option value="processing">{t('admin.orders.processing')}</option>
              <option value="completed">{t('admin.orders.completed')}</option>
              <option value="cancelled">{t('admin.orders.cancelled')}</option>
            </select>
          )}
        </div>

        <div>
          <div className={summaryControlHeaderClass}>
            <div className="flex flex-row flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
                {t('admin.orders.orderDetails.payment')}
              </p>
              {paymentMethodLogoPath ? (
                <img src={paymentMethodLogoPath} alt="" className="h-6 w-auto shrink-0" />
              ) : null}
              <span className="text-sm font-medium text-gray-900">{paymentMethodLabel}</span>
            </div>
          </div>
          {updatingPaymentStatus ? (
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-900" />
              {t('admin.orders.updating')}
            </div>
          ) : (
            <select
              value={orderDetails.paymentStatus}
              onChange={(e) => onPaymentStatusChange(e.target.value)}
              className={getAdminOrderPaymentSummarySelectClassNames(orderDetails.paymentStatus)}
            >
              <option value="paid">{t('admin.orders.paid')}</option>
              <option value="pending">{t('admin.orders.pendingPayment')}</option>
              <option value="failed">{t('admin.orders.failed')}</option>
            </select>
          )}
        </div>

        <div>
          <div className={summaryControlHeaderClass}>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
              {t('admin.orders.orderDetails.placed')}
            </p>
          </div>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {formatAdminDateTime(orderDetails.createdAt)}
          </p>
        </div>
      </div>
    </Card>
  );
}
