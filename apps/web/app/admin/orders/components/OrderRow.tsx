'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import { useCurrencyRatesReady } from '../../../../components/hooks/useCurrency';
import { ADMIN_PRICE_CURRENCY, type CurrencyCode } from '../../../../lib/currency';
import {
  formatOrderListShippingDisplay,
  formatOrderListTotalDisplay,
} from '@/lib/orders/order-summary-display';
import {
  getAdminOrderPaymentRowSelectClassNames,
  getAdminOrderStatusRowSelectClassNames,
  getColorValue,
} from '../utils/orderUtils';
import type { Order } from '../useOrders';
import { AdminNewBadge } from '../../components/AdminNewBadge';
import { formatAdminDate } from '../../utils/formatAdminDate';

interface OrderRowProps {
  order: Order;
  isNew?: boolean;
  newBadgeLabel?: string;
  selected: boolean;
  updatingStatus: boolean;
  updatingPaymentStatus: boolean;
  onToggleSelect: () => void;
  onViewDetails: () => void;
  onPrefetchDetails?: () => void;
  onStatusChange: (newStatus: string) => void;
  onPaymentStatusChange: (newPaymentStatus: string) => void;
}

export function OrderRow({
  order,
  isNew = false,
  newBadgeLabel = 'New',
  selected,
  updatingStatus,
  updatingPaymentStatus,
  onToggleSelect,
  onViewDetails,
  onPrefetchDetails,
  onStatusChange,
  onPaymentStatusChange,
}: OrderRowProps) {
  const { t } = useTranslation();
  useCurrencyRatesReady();

  const shippingDisplay = formatOrderListShippingDisplay(order, ADMIN_PRICE_CURRENCY as CurrencyCode);

  const orderTotalDisplay = formatOrderListTotalDisplay(order, ADMIN_PRICE_CURRENCY as CurrencyCode);

  const previews = order.colorSizePreviews || [];

  return (
    <tr className="group">
      <td className="rounded-l-xl border-y border-l border-[#dcc090]/25 bg-white/95 px-3 py-3 transition-all duration-200 group-hover:border-[#dcc090] group-hover:bg-[#fffaf0] group-hover:shadow-[0_10px_22px_rgba(18,42,38,0.07)]">
        <input
          type="checkbox"
          aria-label={t('admin.orders.selectOrder').replace('{number}', order.number)}
          checked={selected}
          onChange={onToggleSelect}
          className="h-4 w-4 rounded border-[#dcc090]/60 text-[#122a26] focus:ring-[#dcc090]"
        />
      </td>
      <td
        className="cursor-pointer border-y border-[#dcc090]/25 bg-white/95 px-3 py-3 transition-all duration-200 group-hover:border-[#dcc090] group-hover:bg-[#fffaf0]"
        onClick={onViewDetails}
        onPointerEnter={onPrefetchDetails}
      >
        <div className="inline-flex items-center rounded-full bg-[#122a26] px-2.5 py-1 text-xs font-bold text-[#dcc090]">
          #{order.number}
        </div>
      </td>
      <td
        className="cursor-pointer border-y border-[#dcc090]/25 bg-white/95 px-3 py-3 transition-all duration-200 group-hover:border-[#dcc090] group-hover:bg-[#fffaf0]"
        onClick={onViewDetails}
        onPointerEnter={onPrefetchDetails}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="truncate text-sm font-bold text-[#122a26]">
            {[order.customerFirstName, order.customerLastName].filter(Boolean).join(' ') ||
              t('admin.orders.unknownCustomer')}
          </div>
          {isNew ? <AdminNewBadge label={newBadgeLabel} /> : null}
        </div>
        {order.customerPhone && (
          <div className="mt-0.5 truncate text-xs text-[#414141]/55">{order.customerPhone}</div>
        )}
        <div className="mt-1 inline-flex max-w-full rounded-full bg-[#dcc090]/18 px-2 py-0.5 text-[11px] font-semibold text-[#122a26] transition-colors group-hover:bg-[#dcc090]/35">
          {t('admin.orders.viewOrderDetails')}
        </div>
      </td>
      <td className="whitespace-nowrap border-y border-[#dcc090]/25 bg-white/95 px-3 py-3 transition-all duration-200 group-hover:border-[#dcc090] group-hover:bg-[#fffaf0]">
        <div className="flex flex-col">
          <span className="text-sm font-black text-[#122a26]">{orderTotalDisplay}</span>
          {shippingDisplay ? (
            <span className="text-xs text-[#414141]/60">
              {t('orders.orderSummary.shipping')}: {shippingDisplay}
            </span>
          ) : null}
        </div>
      </td>
      <td className="border-y border-[#dcc090]/25 bg-white/95 px-3 py-3 text-xs text-[#414141]/60 transition-all duration-200 group-hover:border-[#dcc090] group-hover:bg-[#fffaf0]">
        {previews.length > 0 ? (
          <div className="flex max-w-full flex-wrap items-center gap-1">
            {previews.map((preview) => {
              const swatchColor = preview.colorHex || (preview.colorLabel ? getColorValue(preview.colorLabel) : undefined);
              return (
                <span
                  key={`${order.id}-${preview.label}-${preview.imageUrl || ''}-${preview.colorHex || ''}`}
                  className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#dcc090]/35 bg-[#dcc090]/12 px-2 py-1 text-[11px] font-medium text-[#414141]/75"
                  title={preview.label}
                >
                  {preview.imageUrl ? (
                    <img
                      src={preview.imageUrl}
                      alt={preview.label}
                      className="h-4 w-4 rounded border border-[#dcc090]/35 object-cover"
                    />
                  ) : null}
                  {swatchColor ? (
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-[#dcc090]/35"
                      style={{ backgroundColor: swatchColor }}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="max-w-[120px] truncate">{preview.label}</span>
                </span>
              );
            })}
            {order.colorSizePreviewsHasMore && order.colorSizePreviewsHasMore > 0 ? (
              <span className="text-xs text-[#414141]/55">+{order.colorSizePreviewsHasMore}</span>
            ) : null}
          </div>
        ) : (
          <span className="block max-w-[220px] truncate" title={order.colorSizeSummary || undefined}>
            {order.colorSizeSummary || '—'}
          </span>
        )}
      </td>
      <td className="min-w-[7.5rem] whitespace-nowrap border-y border-[#dcc090]/25 bg-white/95 px-3 py-3 transition-all duration-200 group-hover:border-[#dcc090] group-hover:bg-[#fffaf0]">
        <div className="flex items-center gap-2">
          {updatingStatus ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#122a26]"></div>
              <span className="text-xs text-[#414141]/55">{t('admin.orders.updating')}</span>
            </div>
          ) : (
            <select
              value={order.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className={getAdminOrderStatusRowSelectClassNames(order.status)}
            >
              <option value="pending">{t('admin.orders.pending')}</option>
              <option value="processing">{t('admin.orders.processing')}</option>
              <option value="completed">{t('admin.orders.completed')}</option>
              <option value="cancelled">{t('admin.orders.cancelled')}</option>
            </select>
          )}
        </div>
      </td>
      <td className="min-w-[7.5rem] whitespace-nowrap border-y border-[#dcc090]/25 bg-white/95 px-3 py-3 transition-all duration-200 group-hover:border-[#dcc090] group-hover:bg-[#fffaf0]">
        <div className="flex items-center gap-2">
          {updatingPaymentStatus ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#122a26]"></div>
              <span className="text-xs text-[#414141]/55">{t('admin.orders.updating')}</span>
            </div>
          ) : (
            <select
              value={order.paymentStatus}
              onChange={(e) => onPaymentStatusChange(e.target.value)}
              className={getAdminOrderPaymentRowSelectClassNames(order.paymentStatus)}
            >
              <option value="paid">{t('admin.orders.paid')}</option>
              <option value="pending">{t('admin.orders.pendingPayment')}</option>
              <option value="failed">{t('admin.orders.failed')}</option>
              <option value="refunded">{t('admin.orders.refunded')}</option>
            </select>
          )}
        </div>
      </td>
      <td className="whitespace-nowrap rounded-r-xl border-y border-r border-[#dcc090]/25 bg-white/95 px-3 py-3 text-xs font-semibold text-[#414141]/60 transition-all duration-200 group-hover:border-[#dcc090] group-hover:bg-[#fffaf0] group-hover:shadow-[0_10px_22px_rgba(18,42,38,0.07)]">
        {formatAdminDate(order.createdAt)}
      </td>
    </tr>
  );
}
