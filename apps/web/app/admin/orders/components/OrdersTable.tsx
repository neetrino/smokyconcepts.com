'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import { Card } from '@shop/ui';
import {
  ADMIN_ORDERS_TABLE_CLASS,
  ADMIN_ORDERS_TABLE_MIN_WIDTH_CLASS,
  ADMIN_ORDERS_TABLE_SCROLL_CLASS,
  ADMIN_ORDERS_TABLE_TH_FIRST_CLASS,
  ADMIN_ORDERS_TABLE_TH_LAST_CLASS,
  ADMIN_ORDERS_TABLE_TH_MIDDLE_CLASS,
} from '../constants/ordersTable.constants';
import { OrderRow } from './OrderRow';
import { OrdersPagination } from './OrdersPagination';
import type { Order } from '../useOrders';

interface OrdersTableProps {
  orders: Order[];
  isOrderNew?: (createdAt: string) => boolean;
  newBadgeLabel?: string;
  loading: boolean;
  selectedIds: Set<string>;
  updatingStatuses: Set<string>;
  updatingPaymentStatuses: Set<string>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  meta: { total: number; page: number; limit: number; totalPages: number } | null;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onSort: (column: string) => void;
  onViewDetails: (orderId: string, orderNumber: string) => void;
  onPrefetchOrderDetails?: (orderId: string) => void;
  onStatusChange: (orderId: string, newStatus: string) => void;
  onPaymentStatusChange: (orderId: string, newPaymentStatus: string) => void;
  onPageChange: (newPage: number) => void;
}

export function OrdersTable({
  orders,
  isOrderNew,
  newBadgeLabel,
  loading,
  selectedIds,
  updatingStatuses,
  updatingPaymentStatuses,
  sortBy,
  sortOrder,
  page,
  meta,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  onViewDetails,
  onPrefetchOrderDetails,
  onStatusChange,
  onPaymentStatusChange,
  onPageChange,
}: OrdersTableProps) {
  const { t } = useTranslation();
  const headerTextClass =
    'whitespace-nowrap px-3 py-4 text-left text-[11px] font-black uppercase tracking-[0.1em] text-[#dcc090]';

  if (loading) {
    return (
      <Card className="border-[#dcc090]/30 bg-white/90 p-6 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#122a26] mx-auto mb-4"></div>
          <p className="text-[#414141]/70">{t('admin.orders.loadingOrders')}</p>
        </div>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="border-[#dcc090]/30 bg-white/90 p-6 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
        <div className="text-center py-8">
          <p className="text-[#414141]/70">{t('admin.orders.noOrders')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-[#dcc090]/30 bg-white/85 p-2 shadow-[0_18px_50px_rgba(18,42,38,0.08)] sm:p-3">
      <div className={`rounded-[1.15rem] ${ADMIN_ORDERS_TABLE_SCROLL_CLASS}`}>
        <table className={`${ADMIN_ORDERS_TABLE_CLASS} ${ADMIN_ORDERS_TABLE_MIN_WIDTH_CLASS}`}>
          <colgroup>
            <col className="w-12" />
            <col className="w-[6.5rem]" />
            <col className="w-[23%]" />
            <col className="w-[11%]" />
            <col className="w-[13%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[10.5%]" />
          </colgroup>
          <thead className="max-lg:[&_th]:relative max-lg:[&_th]:z-0">
            <tr>
              <th className={`${ADMIN_ORDERS_TABLE_TH_FIRST_CLASS} w-12 px-3 py-4`}>
                <input
                  type="checkbox"
                  aria-label={t('admin.orders.selectAllOrders')}
                  checked={orders.length > 0 && orders.every((o) => selectedIds.has(o.id))}
                  onChange={onToggleSelectAll}
                  className="h-4 w-4 rounded border-[#dcc090]/60 bg-white text-[#122a26] focus:ring-[#dcc090]"
                />
              </th>
              <th className={`${ADMIN_ORDERS_TABLE_TH_MIDDLE_CLASS} ${headerTextClass} min-w-[6.5rem]`}>
                {t('admin.orders.orderNumber')}
              </th>
              <th className={`${ADMIN_ORDERS_TABLE_TH_MIDDLE_CLASS} ${headerTextClass} min-w-[10rem]`}>
                {t('admin.orders.customer')}
              </th>
              <th
                className={`${ADMIN_ORDERS_TABLE_TH_MIDDLE_CLASS} min-w-[6.5rem] cursor-pointer select-none ${headerTextClass} transition-colors hover:bg-[#18352f]`}
                onClick={() => onSort('total')}
              >
                <div className="flex items-center gap-1">
                  {t('admin.orders.total')}
                  <div className="flex flex-col">
                    <svg
                      className={`w-3 h-3 ${sortBy === 'total' && sortOrder === 'asc' ? 'text-white' : 'text-[#dcc090]/60'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    <svg
                      className={`w-3 h-3 -mt-1 ${sortBy === 'total' && sortOrder === 'desc' ? 'text-white' : 'text-[#dcc090]/60'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </th>
              <th className={`${ADMIN_ORDERS_TABLE_TH_MIDDLE_CLASS} ${headerTextClass} min-w-[8rem]`}>
                {t('admin.orders.orderDetails.colorSize')}
              </th>
              <th className={`${ADMIN_ORDERS_TABLE_TH_MIDDLE_CLASS} ${headerTextClass} min-w-[7.5rem]`}>
                {t('admin.orders.status')}
              </th>
              <th className={`${ADMIN_ORDERS_TABLE_TH_MIDDLE_CLASS} ${headerTextClass} min-w-[7.5rem]`}>
                {t('admin.orders.payment')}
              </th>
              <th
                className={`${ADMIN_ORDERS_TABLE_TH_LAST_CLASS} min-w-[6rem] cursor-pointer select-none ${headerTextClass} transition-colors hover:bg-[#18352f]`}
                onClick={() => onSort('createdAt')}
              >
                <div className="flex items-center gap-1">
                  {t('admin.orders.date')}
                  <div className="flex flex-col">
                    <svg
                      className={`w-3 h-3 ${sortBy === 'createdAt' && sortOrder === 'asc' ? 'text-white' : 'text-[#dcc090]/60'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    <svg
                      className={`w-3 h-3 -mt-1 ${sortBy === 'createdAt' && sortOrder === 'desc' ? 'text-white' : 'text-[#dcc090]/60'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                isNew={isOrderNew?.(order.createdAt) ?? false}
                newBadgeLabel={newBadgeLabel}
                selected={selectedIds.has(order.id)}
                updatingStatus={updatingStatuses.has(order.id)}
                updatingPaymentStatus={updatingPaymentStatuses.has(order.id)}
                onToggleSelect={() => onToggleSelect(order.id)}
                onViewDetails={() => onViewDetails(order.id, order.number)}
                onPrefetchDetails={
                  onPrefetchOrderDetails ? () => onPrefetchOrderDetails(order.id) : undefined
                }
                onStatusChange={(newStatus) => onStatusChange(order.id, newStatus)}
                onPaymentStatusChange={(newPaymentStatus) =>
                  onPaymentStatusChange(order.id, newPaymentStatus)
                }
              />
            ))}
          </tbody>
        </table>
      </div>

      {meta ? (
        <OrdersPagination
          page={page}
          totalPages={meta.totalPages}
          total={meta.total}
          onPageChange={onPageChange}
        />
      ) : null}
    </Card>
  );
}
