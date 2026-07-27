'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import { Card } from '@shop/ui';
import type { useOrders } from '../useOrders';
import type { OrderTypeFilter } from '../useOrders';

interface OrdersFiltersProps {
  statusFilter: string;
  paymentStatusFilter: string;
  orderTypeFilter: OrderTypeFilter;
  searchQuery: string;
  updateMessage: { type: 'success' | 'error'; text: string } | null;
  setStatusFilter: (value: string) => void;
  setPaymentStatusFilter: (value: string) => void;
  setOrderTypeFilter: (value: OrderTypeFilter) => void;
  setSearchQuery: (value: string) => void;
  setPage: (value: number | ((prev: number) => number)) => void;
  router: ReturnType<typeof useOrders>['router'];
  searchParams: ReturnType<typeof useOrders>['searchParams'];
  totalOrders: number | null;
}

export function OrdersFilters({
  statusFilter,
  paymentStatusFilter,
  orderTypeFilter,
  searchQuery,
  updateMessage,
  setStatusFilter,
  setPaymentStatusFilter,
  setOrderTypeFilter,
  setSearchQuery,
  setPage,
  router,
  searchParams,
  totalOrders,
}: OrdersFiltersProps) {
  const { t } = useTranslation();

  const pushFilters = (params: URLSearchParams) => {
    const newUrl = params.toString() ? `/supersudo/orders?${params.toString()}` : '/supersudo/orders';
    router.push(newUrl, { scroll: false });
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (newStatus) {
      params.set('status', newStatus);
    } else {
      params.delete('status');
    }
    pushFilters(params);
  };

  const handlePaymentStatusChange = (newPaymentStatus: string) => {
    setPaymentStatusFilter(newPaymentStatus);
    setPage(1);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (newPaymentStatus) {
      params.set('paymentStatus', newPaymentStatus);
    } else {
      params.delete('paymentStatus');
    }
    pushFilters(params);
  };

  const handleOrderTypeChange = (newOrderType: OrderTypeFilter) => {
    setOrderTypeFilter(newOrderType);
    setPage(1);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (newOrderType === 'all') {
      params.delete('orderType');
    } else {
      params.set('orderType', newOrderType);
    }
    pushFilters(params);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearchQuery(newSearch);
    setPage(1);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (newSearch.trim()) {
      params.set('search', newSearch.trim());
    } else {
      params.delete('search');
    }
    pushFilters(params);
  };

  return (
    <Card className="mb-6 border-[#dcc090]/30 bg-white/90 p-4 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-full bg-[#dcc090]/20 p-1 text-xs">
          <button
            type="button"
            onClick={() => handleOrderTypeChange('all')}
            className={`px-3 py-1 rounded-full transition-all ${
              orderTypeFilter === 'all' ? 'bg-[#122a26] text-[#dcc090] shadow-sm' : 'text-[#414141]/70 hover:text-[#122a26]'
            }`}
          >
            {t('admin.orders.allOrders')}
          </button>
          <button
            type="button"
            onClick={() => handleOrderTypeChange('orders')}
            className={`px-3 py-1 rounded-full transition-all ${
              orderTypeFilter === 'orders' ? 'bg-[#122a26] text-[#dcc090] shadow-sm' : 'text-[#414141]/70 hover:text-[#122a26]'
            }`}
          >
            {t('admin.orders.ordersOnly')}
          </button>
          <button
            type="button"
            onClick={() => handleOrderTypeChange('custom')}
            className={`px-3 py-1 rounded-full transition-all ${
              orderTypeFilter === 'custom' ? 'bg-[#122a26] text-[#dcc090] shadow-sm' : 'text-[#414141]/70 hover:text-[#122a26]'
            }`}
          >
            {t('admin.orders.customOrders')}
          </button>
          <button
            type="button"
            onClick={() => handleOrderTypeChange('early')}
            className={`px-3 py-1 rounded-full transition-all ${
              orderTypeFilter === 'early' ? 'bg-[#122a26] text-[#dcc090] shadow-sm' : 'text-[#414141]/70 hover:text-[#122a26]'
            }`}
          >
            {t('admin.orders.earlyAccessOrders')}
          </button>
          <button
            type="button"
            onClick={() => handleOrderTypeChange('out_of_stock')}
            className={`px-3 py-1 rounded-full transition-all ${
              orderTypeFilter === 'out_of_stock' ? 'bg-[#122a26] text-[#dcc090] shadow-sm' : 'text-[#414141]/70 hover:text-[#122a26]'
            }`}
          >
            {t('admin.orders.outOfStockOrders')}
          </button>
        </div>
        {totalOrders !== null && (
          <p className="text-sm font-medium tabular-nums text-[#414141]/75">
            {t('admin.orders.ordersTotalCount').replace('{total}', totalOrders.toLocaleString())}
          </p>
        )}
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <select
          className="px-3 py-2 border border-[#dcc090]/35 rounded-md focus:outline-none focus:ring-2 focus:ring-[#dcc090] focus:border-[#dcc090]"
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="">{t('admin.orders.allStatuses')}</option>
          <option value="pending">{t('admin.orders.pending')}</option>
          <option value="processing">{t('admin.orders.processing')}</option>
          <option value="completed">{t('admin.orders.completed')}</option>
          <option value="cancelled">{t('admin.orders.cancelled')}</option>
        </select>
        <select
          className="px-3 py-2 border border-[#dcc090]/35 rounded-md focus:outline-none focus:ring-2 focus:ring-[#dcc090] focus:border-[#dcc090]"
          value={paymentStatusFilter}
          onChange={(e) => handlePaymentStatusChange(e.target.value)}
        >
          <option value="">{t('admin.orders.allPaymentStatuses')}</option>
          <option value="paid">{t('admin.orders.paid')}</option>
          <option value="pending">{t('admin.orders.pendingPayment')}</option>
          <option value="failed">{t('admin.orders.failed')}</option>
        </select>
        <input
          type="text"
          placeholder={t('admin.orders.searchPlaceholder')}
          className="px-3 py-2 border border-[#dcc090]/35 rounded-md focus:outline-none focus:ring-2 focus:ring-[#dcc090] focus:border-[#dcc090] flex-1 min-w-[200px]"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        {updateMessage && (
          <div
            className={`px-4 py-2 rounded-md text-sm ${
              updateMessage.type === 'success'
                ? 'bg-[#122a26]/10 text-[#122a26]'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {updateMessage.text}
          </div>
        )}
      </div>
    </Card>
  );
}

