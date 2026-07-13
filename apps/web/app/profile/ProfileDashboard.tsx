import Link from 'next/link';
import { Button, Card } from '@shop/ui';
import { useCurrency } from '../../components/hooks/useCurrency';
import {
  convertPrice,
  formatCatalogPrice,
  formatPriceInCurrency,
  type CurrencyCode,
} from '../../lib/currency';
import {
  formatOrderListShippingDisplay,
  formatOrderListTotalDisplay,
} from '@/lib/orders/order-summary-display';
import { formatDisplayDate } from '@/lib/format-display-date';
import { getStatusColor, getPaymentStatusColor } from './utils';
import type { DashboardData, ProfileTab } from './types';

interface ProfileDashboardProps {
  dashboardData: DashboardData | null;
  dashboardLoading: boolean;
  onTabChange: (tab: ProfileTab) => void;
  onOrderClick: (orderNumber: string, e: React.MouseEvent<HTMLAnchorElement>) => void;
  t: (key: string) => string;
}

function formatDashboardTotalSpent(
  stats: DashboardData['stats'],
  displayCurrency: CurrencyCode
): string {
  if (
    displayCurrency === 'AMD' &&
    typeof stats.totalSpentAmd === 'number' &&
    Number.isFinite(stats.totalSpentAmd)
  ) {
    return formatCatalogPrice(stats.totalSpentAmd, 'AMD');
  }
  return formatPriceInCurrency(
    convertPrice(stats.totalSpent, 'USD', displayCurrency),
    displayCurrency
  );
}

export function ProfileDashboard({
  dashboardData,
  dashboardLoading,
  onTabChange,
  onOrderClick,
  t,
}: ProfileDashboardProps) {
  const displayCurrency = useCurrency() as CurrencyCode;
  const dashboardCardClassName =
    'border border-[#dcc090]/30 bg-white/90 p-6 shadow-[0_8px_30px_rgba(18,42,38,0.06)]';
  const statCardClassName =
    'border border-[#dcc090]/30 bg-white/90 p-6 shadow-[0_8px_30px_rgba(18,42,38,0.06)] transition-all duration-200 hover:-translate-y-1 hover:border-[#dcc090] hover:shadow-[0_14px_34px_rgba(18,42,38,0.12)]';
  const statLabelClassName = 'text-sm font-semibold uppercase tracking-[0.08em] text-[#414141]/70';
  const statValueClassName = 'mt-1 text-2xl font-black text-[#122a26]';
  const statIconWrapClassName =
    'flex h-12 w-12 items-center justify-center rounded-full border border-[#dcc090]/40 bg-white text-[#122a26]';
  const quickActionIconWrapClassName =
    'flex h-10 w-10 items-center justify-center rounded-full border border-[#dcc090]/40 bg-white text-[#122a26]';

  if (dashboardLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">{t('profile.dashboard.loading')}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Card className={dashboardCardClassName}>
        <p className="text-gray-600 text-center py-8">{t('profile.dashboard.failedToLoad')}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={statCardClassName}>
          <div className="flex items-center justify-between">
            <div>
              <p className={statLabelClassName}>{t('profile.dashboard.totalOrders')}</p>
              <p className={statValueClassName}>
                {dashboardData.stats.totalOrders}
              </p>
            </div>
            <div className={statIconWrapClassName}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className={statCardClassName}>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className={statLabelClassName}>{t('profile.dashboard.totalSpent')}</p>
              <p className="mt-1 break-words text-xl font-black text-[#122a26] sm:text-2xl overflow-wrap-anywhere">
                {formatDashboardTotalSpent(dashboardData.stats, displayCurrency)}
              </p>
            </div>
            <div className={`${statIconWrapClassName} flex-shrink-0`}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className={statCardClassName}>
          <div className="flex items-center justify-between">
            <div>
              <p className={statLabelClassName}>{t('profile.dashboard.pendingOrders')}</p>
              <p className={statValueClassName}>
                {dashboardData.stats.pendingOrders}
              </p>
            </div>
            <div className={statIconWrapClassName}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className={dashboardCardClassName}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-[#414141]">{t('profile.dashboard.recentOrders')}</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#122a26] hover:bg-[#dcc090]/15 hover:text-[#122a26]"
            onClick={() => onTabChange('orders')}
          >
            {t('profile.dashboard.viewAll')}
          </Button>
        </div>
        {dashboardData.recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">{t('profile.dashboard.noOrders')}</p>
            <Link href="/products">
              <Button variant="primary">{t('profile.dashboard.startShopping')}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {dashboardData.recentOrders.map((order) => {
              const shippingDisplay = formatOrderListShippingDisplay(order, displayCurrency);
              return (
              <Link
                key={order.id}
                href={`/orders/${order.number}`}
                onClick={(e) => onOrderClick(order.number, e)}
                className="block cursor-pointer rounded-lg border border-[#dcc090]/25 bg-white/70 p-4 transition-colors hover:border-[#dcc090] hover:bg-[#dcc090]/10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-6 mb-2">
                      <h3 className="text-lg font-black text-[#122a26]">{t('profile.orders.orderNumber')}{order.number}</h3>
                      <div>
                        <p className="mb-0.5 text-[11px] uppercase tracking-wide text-[#414141]/55">{t('profile.dashboard.orderStatus')}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div>
                        <p className="mb-0.5 text-[11px] uppercase tracking-wide text-[#414141]/55">{t('profile.dashboard.paymentStatus')}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-[#414141]/75">
                      {order.itemsCount} {order.itemsCount !== 1 ? t('profile.orders.items') : t('profile.orders.item')} • {t('profile.dashboard.placedOn')} {formatDisplayDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-black text-[#122a26]">
                      {formatOrderListTotalDisplay(order, displayCurrency)}
                    </p>
                    {shippingDisplay ? (
                      <p className="text-xs text-[#414141]/55 mt-1">
                        {t('orders.orderSummary.shipping')}: {shippingDisplay}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-[#414141]/55">{t('profile.dashboard.viewDetails')}</p>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className={dashboardCardClassName}>
        <h2 className="mb-4 text-xl font-black text-[#414141]">{t('profile.dashboard.quickActions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => onTabChange('orders')}
            className="h-auto justify-start py-4"
          >
            <div className="flex items-center gap-3">
              <div className={quickActionIconWrapClassName}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="font-medium text-[#122a26]">{t('profile.dashboard.viewAllOrders')}</span>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => onTabChange('addresses')}
            className="h-auto justify-start py-4"
          >
            <div className="flex items-center gap-3">
              <div className={quickActionIconWrapClassName}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="font-medium text-[#122a26]">{t('profile.dashboard.manageAddresses')}</span>
            </div>
          </Button>
          <Link href="/products">
            <Button
              variant="gold"
              className="h-auto w-full justify-start py-4"
            >
              <div className="flex items-center gap-3">
                <div className={quickActionIconWrapClassName}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span className="font-medium text-[#122a26]">{t('profile.dashboard.continueShopping')}</span>
              </div>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}



