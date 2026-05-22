'use client';

import { ADMIN_PRICE_CURRENCY } from '../../../lib/currency';
import { useOrderDetailsDialog } from './hooks/useOrderDetailsDialog';
import { useOrders } from './useOrders';
import { OrderDetailsModal } from './components/OrderDetailsModal';
import { OrdersFilters } from './components/OrdersFilters';
import { BulkSelectionControls } from './components/BulkSelectionControls';
import { OrdersTable } from './components/OrdersTable';
import { AdminShell } from '../components/AdminShell';
import { ADMIN_PAGE_SHELL_CLASS } from '../constants/adminShell.constants';

export function OrdersPageContent() {
  const {
    orders,
    loading,
    statusFilter,
    paymentStatusFilter,
    orderTypeFilter,
    searchQuery,
    page,
    meta,
    sortBy,
    sortOrder,
    updatingStatuses,
    updatingPaymentStatuses,
    updateMessage,
    selectedIds,
    bulkDeleting,
    applyOrderListPatch,
    setStatusFilter,
    setPaymentStatusFilter,
    setOrderTypeFilter,
    setSearchQuery,
    setPage,
    toggleSelect,
    toggleSelectAll,
    handleSort,
    handleBulkDelete,
    handleStatusChange,
    handlePaymentStatusChange,
    router,
    searchParams,
  } = useOrders();

  const detailsDialog = useOrderDetailsDialog({ applyOrderListPatch });

  return (
    <div className={ADMIN_PAGE_SHELL_CLASS}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <AdminShell>
          <OrdersFilters
            statusFilter={statusFilter}
            paymentStatusFilter={paymentStatusFilter}
            orderTypeFilter={orderTypeFilter}
            searchQuery={searchQuery}
            updateMessage={updateMessage}
            setStatusFilter={setStatusFilter}
            setPaymentStatusFilter={setPaymentStatusFilter}
            setOrderTypeFilter={setOrderTypeFilter}
            setSearchQuery={setSearchQuery}
            setPage={setPage}
            router={router}
            searchParams={searchParams}
            totalOrders={meta?.total ?? null}
          />

          <BulkSelectionControls
            selectedCount={selectedIds.size}
            onBulkDelete={handleBulkDelete}
            bulkDeleting={bulkDeleting}
          />

          <OrdersTable
            orders={orders}
            loading={loading}
            selectedIds={selectedIds}
            updatingStatuses={updatingStatuses}
            updatingPaymentStatuses={updatingPaymentStatuses}
            sortBy={sortBy}
            sortOrder={sortOrder}
            page={page}
            meta={meta}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onSort={handleSort}
            onViewDetails={detailsDialog.openDetails}
            onPrefetchOrderDetails={detailsDialog.prefetchOrderDetails}
            onStatusChange={handleStatusChange}
            onPaymentStatusChange={handlePaymentStatusChange}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </AdminShell>
      </div>

      <OrderDetailsModal
        open={detailsDialog.detailsOpen}
        detailHeaderHint={detailsDialog.detailHeaderHint}
        orderDetails={detailsDialog.orderDetails}
        loading={detailsDialog.detailsLoading}
        error={detailsDialog.detailsError}
        currency={ADMIN_PRICE_CURRENCY}
        onClose={detailsDialog.closeDetails}
        formatCurrency={detailsDialog.formatCurrency}
        updatingStatus={detailsDialog.updatingStatus}
        updatingPaymentStatus={detailsDialog.updatingPaymentStatus}
        onStatusChange={detailsDialog.handleDetailsStatusChange}
        onPaymentStatusChange={detailsDialog.handleDetailsPaymentStatusChange}
      />
    </div>
  );
}
